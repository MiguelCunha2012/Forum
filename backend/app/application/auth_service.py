from fastapi import HTTPException, status
from app.domain.entities import User
from app.domain.repositories import UserRepository
from app.presentation.schemas import UserCreate
from app.infrastructure.security import hash_password, verify_password, create_access_token

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, data: UserCreate) -> User:
        # Verifica se o e-mail já está cadastrado
        existing_user = self.user_repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este e-mail já está cadastrado. Por favor, use outro e-mail."
            )

        # Criptografa a senha
        senha_hash = hash_password(data.password)

        # Cria a entidade User
        new_user = User(
            id=None,
            name=data.name,
            email=data.email,
            password_hash=senha_hash,
            role=data.role
        )

        return self.user_repo.create(new_user)

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail não encontrado."
            )

        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Senha incorreta."
            )

        # Gera o token JWT
        token = create_access_token(data={"sub": user.email, "role": user.role})
        return {
            "access_token": token,
            "user": user
        }
