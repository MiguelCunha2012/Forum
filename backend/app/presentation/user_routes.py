from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database import get_db
from app.infrastructure.repositories import UserRepositoryImpl
from app.application.user_service import UserService
from app.presentation.schemas import UserResponse, UserCreate, UserUpdate, MessageResponse
from app.infrastructure.security import get_current_admin

router = APIRouter(prefix="/users", tags=["Gerenciamento de Usuários (Admin)"])

# Todas as rotas abaixo requerem privilégios de Admin
@router.get("", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), admin: UserResponse = Depends(get_current_admin)):
    user_repo = UserRepositoryImpl(db)
    service = UserService(user_repo)
    return service.list_users()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), admin: UserResponse = Depends(get_current_admin)):
    user_repo = UserRepositoryImpl(db)
    service = UserService(user_repo)
    return service.get_user(user_id)

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db), admin: UserResponse = Depends(get_current_admin)):
    user_repo = UserRepositoryImpl(db)
    service = UserService(user_repo)
    return service.create_user(data)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), admin: UserResponse = Depends(get_current_admin)):
    user_repo = UserRepositoryImpl(db)
    service = UserService(user_repo)
    return service.update_user(user_id, data)

@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(user_id: int, db: Session = Depends(get_db), admin: UserResponse = Depends(get_current_admin)):
    user_repo = UserRepositoryImpl(db)
    service = UserService(user_repo)
    service.delete_user(user_id)
    return {"message": "Usuário excluído com sucesso."}
