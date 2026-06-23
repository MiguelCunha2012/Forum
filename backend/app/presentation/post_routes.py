import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.infrastructure.repositories import PostRepositoryImpl, PostImageRepositoryImpl
from app.application.post_service import PostService
from app.presentation.schemas import PostResponse, MessageResponse
from app.infrastructure.security import get_current_user, get_current_admin
from app.domain.entities import User

router = APIRouter(prefix="/posts", tags=["Postagens"])

# Diretório absoluto de uploads
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Certifica que a pasta de uploads existe
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(upload_file: UploadFile) -> str:
    filename = upload_file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']
    
    if not ext or ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Arquivo '{filename}' não é uma imagem válida. Apenas JPG, PNG, GIF, WebP e Avif são permitidos."
        )
        
    # Gera um UUID para evitar conflitos de nomes
    unique_filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar arquivo de imagem: {str(e)}"
        )
        
    return f"uploads/{unique_filename}"

# Rotas visíveis para qualquer usuário autenticado (view ou admin)
@router.get("", response_model=List[PostResponse])
def list_posts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post_repo = PostRepositoryImpl(db)
    img_repo = PostImageRepositoryImpl(db)
    service = PostService(post_repo, img_repo)
    return service.list_posts()

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post_repo = PostRepositoryImpl(db)
    img_repo = PostImageRepositoryImpl(db)
    service = PostService(post_repo, img_repo)
    return service.get_post(post_id)

# Rotas restritas para Administradores
@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    titulo: str = Form(...),
    conteudo: str = Form(...),
    autor: str = Form("Anônimo"),
    imagem_fundo_url: Optional[str] = Form(None),
    imagem_fundo_file: Optional[UploadFile] = File(None),
    imagem: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    post_repo = PostRepositoryImpl(db)
    img_repo = PostImageRepositoryImpl(db)
    service = PostService(post_repo, img_repo)
    
    # Processa imagem de fundo
    bg_image_path = None
    if imagem_fundo_file and imagem_fundo_file.filename:
        bg_image_path = save_uploaded_file(imagem_fundo_file)
    elif imagem_fundo_url:
        bg_image_path = imagem_fundo_url

    # Processa as imagens anexadas (máximo de 8)
    image_paths = []
    if imagem:
        # Filtra uploads vazios
        valid_uploads = [f for f in imagem if f.filename]
        
        if len(valid_uploads) > 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você pode enviar no máximo 8 imagens por postagem."
            )
            
        for f in valid_uploads:
            # Verifica tamanho do arquivo (limite 2MB)
            # Para validar o tamanho, precisamos ler o arquivo ou estimar
            f.file.seek(0, 2)
            file_size = f.file.tell()
            f.file.seek(0)
            
            if file_size > 2 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"O arquivo {f.filename} excede o limite máximo permitido de 2MB."
                )
                
            path = save_uploaded_file(f)
            image_paths.append(path)
            
    return service.create_post(
        title=titulo,
        content=conteudo,
        author=autor,
        background_image=bg_image_path,
        image_paths=image_paths
    )

@router.delete("/{post_id}", response_model=MessageResponse)
def delete_post(post_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    post_repo = PostRepositoryImpl(db)
    img_repo = PostImageRepositoryImpl(db)
    service = PostService(post_repo, img_repo)
    service.delete_post(post_id)
    return {"message": "Postagem excluída com sucesso."}
