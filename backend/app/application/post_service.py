import os
from typing import List, Optional
from fastapi import HTTPException, status
from app.domain.entities import Post, PostImage
from app.domain.repositories import PostRepository, PostImageRepository

class PostService:
    def __init__(self, post_repo: PostRepository, image_repo: PostImageRepository):
        self.post_repo = post_repo
        self.image_repo = image_repo

    def list_posts(self) -> List[Post]:
        return self.post_repo.list_all()

    def get_post(self, post_id: int) -> Post:
        post = self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Postagem não encontrada."
            )
        return post

    def create_post(
        self, 
        title: str, 
        content: str, 
        author: str, 
        background_image: Optional[str], 
        image_paths: List[str]
    ) -> Post:
        new_post = Post(
            id=None,
            title=title,
            content=content,
            author=author,
            background_image=background_image
        )
        # Salva o post
        saved_post = self.post_repo.create(new_post)

        # Salva as imagens associadas
        saved_images = []
        for path in image_paths:
            img_entity = PostImage(id=None, post_id=saved_post.id, image_path=path)
            saved_img = self.image_repo.create(img_entity)
            saved_images.append(saved_img)
        
        saved_post.images = saved_images
        return saved_post

    def delete_post(self, post_id: int) -> bool:
        post = self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Postagem não encontrada."
            )

        # Remove os arquivos físicos das imagens anexadas
        for img in post.images:
            if img.image_path and os.path.exists(img.image_path):
                try:
                    os.remove(img.image_path)
                except Exception as e:
                    print(f"Erro ao remover arquivo {img.image_path}: {e}")

        # Remove o arquivo físico da imagem de fundo se for um arquivo local
        # Ex: se o caminho da imagem de fundo começar com 'uploads/'
        if post.background_image and post.background_image.startswith("uploads/"):
            if os.path.exists(post.background_image):
                try:
                    os.remove(post.background_image)
                except Exception as e:
                    print(f"Erro ao remover imagem de fundo {post.background_image}: {e}")

        # Deleta do banco de dados (o cascade cuidará das imagens na tabela post_imagens se houver FK cascade,
        # mas por garantia ou caso a FK não suporte, deletamos explicitamente ou deixamos o repo cuidar)
        return self.post_repo.delete(post_id)
