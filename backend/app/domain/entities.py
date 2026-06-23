from datetime import datetime
from typing import List, Optional

class User:
    def __init__(self, id: Optional[int], name: str, email: str, password_hash: str, role: str = "view"):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.role = role

class PostImage:
    def __init__(self, id: Optional[int], post_id: int, image_path: str):
        self.id = id
        self.post_id = post_id
        self.image_path = image_path

class Post:
    def __init__(
        self, 
        id: Optional[int], 
        title: str, 
        content: str, 
        author: str, 
        background_image: Optional[str] = None, 
        created_at: Optional[datetime] = None,
        images: List[PostImage] = None
    ):
        self.id = id
        self.title = title
        self.content = content
        self.author = author
        self.background_image = background_image
        self.created_at = created_at or datetime.utcnow()
        self.images = images or []
