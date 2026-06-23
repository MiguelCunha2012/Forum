from typing import List
from fastapi import HTTPException, status
from app.domain.entities import User
from app.domain.repositories import UserRepository
from app.presentation.schemas import UserCreate, UserUpdate
from app.infrastructure.security import hash_password

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def list_users(self) -> List[User]:
        return self.user_repo.list_all()

    def get_user(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado."
            )
        return user

    def create_user(self, data: UserCreate) -> User:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-mail já cadastrado."
            )

        hashed_pass = hash_password(data.password)
        new_user = User(
            id=None,
            name=data.name,
            email=data.email,
            password_hash=hashed_pass,
            role=data.role
        )
        return self.user_repo.create(new_user)

    def update_user(self, user_id: int, data: UserUpdate) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado."
            )

        # Se mudou e-mail, verifica se já existe
        if data.email and data.email != user.email:
            existing = self.user_repo.get_by_email(data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="E-mail já está sendo utilizado por outro usuário."
                )
            user.email = data.email

        if data.name:
            user.name = data.name
        if data.role:
            user.role = data.role
        if data.password:
            user.password_hash = hash_password(data.password)

        return self.user_repo.update(user)

    def delete_user(self, user_id: int) -> bool:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado."
            )
        return self.user_repo.delete(user_id)
