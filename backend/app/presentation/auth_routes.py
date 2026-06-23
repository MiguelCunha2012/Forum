from fastapi import APIRouter, Depends, Response, status, Request
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.infrastructure.repositories import UserRepositoryImpl
from app.application.auth_service import AuthService
from app.presentation.schemas import UserCreate, LoginRequest, TokenResponse, UserResponse, MessageResponse
from app.infrastructure.security import get_current_user
from app.domain.entities import User

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    auth_service = AuthService(user_repo)
    return auth_service.register(data)

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    auth_service = AuthService(user_repo)
    
    result = auth_service.login(data.email, data.password)
    token = result["access_token"]
    user = result["user"]
    
    # Salva nos cookies como HttpOnly por segurança contra XSS
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=60 * 24 * 60,  # 24 horas
        path="/",
        samesite="lax",
        secure=False  # Mudar para True se rodar em HTTPS (produção)
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    # Remove o cookie de autenticação
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logout realizado com sucesso."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
