from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities import User, Post, PostImage

class UserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def create(self, user: User) -> User:
        pass

    @abstractmethod
    def update(self, user: User) -> User:
        pass

    @abstractmethod
    def delete(self, user_id: int) -> bool:
        pass

    @abstractmethod
    def list_all(self) -> List[User]:
        pass

class PostRepository(ABC):
    @abstractmethod
    def get_by_id(self, post_id: int) -> Optional[Post]:
        pass

    @abstractmethod
    def create(self, post: Post) -> Post:
        pass

    @abstractmethod
    def delete(self, post_id: int) -> bool:
        pass

    @abstractmethod
    def list_all(self) -> List[Post]:
        pass

class PostImageRepository(ABC):
    @abstractmethod
    def create(self, post_image: PostImage) -> PostImage:
        pass

    @abstractmethod
    def get_by_post_id(self, post_id: int) -> List[PostImage]:
        pass

    @abstractmethod
    def delete_by_post_id(self, post_id: int) -> bool:
        pass
