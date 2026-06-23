from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities import User, Post, PostImage
from app.domain.repositories import UserRepository, PostRepository, PostImageRepository
from app.infrastructure.database import DBUser, DBPost, DBPostImage

class UserRepositoryImpl(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    def _to_entity(self, db_user: DBUser) -> User:
        return User(
            id=db_user.id,
            name=db_user.nome,
            email=db_user.email,
            password_hash=db_user.senha,
            role=db_user.tipo
        )

    def get_by_id(self, user_id: int) -> Optional[User]:
        db_user = self.db.query(DBUser).filter(DBUser.id == user_id).first()
        return self._to_entity(db_user) if db_user else None

    def get_by_email(self, email: str) -> Optional[User]:
        db_user = self.db.query(DBUser).filter(DBUser.email == email).first()
        return self._to_entity(db_user) if db_user else None

    def create(self, user: User) -> User:
        db_user = DBUser(
            nome=user.name,
            email=user.email,
            senha=user.password_hash,
            tipo=user.role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return self._to_entity(db_user)

    def update(self, user: User) -> User:
        db_user = self.db.query(DBUser).filter(DBUser.id == user.id).first()
        if db_user:
            db_user.nome = user.name
            db_user.email = user.email
            db_user.tipo = user.role
            if user.password_hash:
                db_user.senha = user.password_hash
            self.db.commit()
            self.db.refresh(db_user)
            return self._to_entity(db_user)
        raise ValueError("User not found")

    def delete(self, user_id: int) -> bool:
        db_user = self.db.query(DBUser).filter(DBUser.id == user_id).first()
        if db_user:
            self.db.delete(db_user)
            self.db.commit()
            return True
        return False

    def list_all(self) -> List[User]:
        db_users = self.db.query(DBUser).all()
        return [self._to_entity(db_user) for db_user in db_users]

class PostRepositoryImpl(PostRepository):
    def __init__(self, db: Session):
        self.db = db

    def _to_entity(self, db_post: DBPost) -> Post:
        images = [
            PostImage(id=img.id, post_id=img.post_id, image_path=img.imagem)
            for img in db_post.imagens
        ]
        return Post(
            id=db_post.id,
            title=db_post.titulo,
            content=db_post.conteudo,
            author=db_post.autor,
            background_image=db_post.imagem_fundo,
            images=images
        )

    def get_by_id(self, post_id: int) -> Optional[Post]:
        db_post = self.db.query(DBPost).filter(DBPost.id == post_id).first()
        return self._to_entity(db_post) if db_post else None

    def create(self, post: Post) -> Post:
        db_post = DBPost(
            titulo=post.title,
            conteudo=post.content,
            autor=post.author,
            imagem_fundo=post.background_image
        )
        self.db.add(db_post)
        self.db.commit()
        self.db.refresh(db_post)
        return self._to_entity(db_post)

    def delete(self, post_id: int) -> bool:
        db_post = self.db.query(DBPost).filter(DBPost.id == post_id).first()
        if db_post:
            self.db.delete(db_post)
            self.db.commit()
            return True
        return False

    def list_all(self) -> List[Post]:
        db_posts = self.db.query(DBPost).all()
        return [self._to_entity(db_post) for db_post in db_posts]

class PostImageRepositoryImpl(PostImageRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, post_image: PostImage) -> PostImage:
        db_img = DBPostImage(
            post_id=post_image.post_id,
            imagem=post_image.image_path
        )
        self.db.add(db_img)
        self.db.commit()
        self.db.refresh(db_img)
        return PostImage(id=db_img.id, post_id=db_img.post_id, image_path=db_img.imagem)

    def get_by_post_id(self, post_id: int) -> List[PostImage]:
        db_imgs = self.db.query(DBPostImage).filter(DBPostImage.post_id == post_id).all()
        return [
            PostImage(id=img.id, post_id=img.post_id, image_path=img.imagem)
            for img in db_imgs
        ]

    def delete_by_post_id(self, post_id: int) -> bool:
        db_imgs = self.db.query(DBPostImage).filter(DBPostImage.post_id == post_id).all()
        if db_imgs:
            for img in db_imgs:
                self.db.delete(img)
            self.db.commit()
            return True
        return False
