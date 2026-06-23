from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# --- SCHEMAS DE USUÁRIO ---
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field("view", pattern="^(admin|view)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=50)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(admin|view)$")
    password: Optional[str] = Field(None, min_length=6, max_length=50)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# --- SCHEMAS DE AUTENTICAÇÃO ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- SCHEMAS DE IMAGENS ---
class PostImageResponse(BaseModel):
    id: int
    post_id: int
    image_path: str

    class Config:
        from_attributes = True


# --- SCHEMAS DE POSTS ---
class PostBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=5)
    author: str = Field("Anônimo", max_length=100)
    background_image: Optional[str] = None

class PostResponse(PostBase):
    id: int
    images: List[PostImageResponse] = []

    class Config:
        from_attributes = True


# --- GERAIS ---
class MessageResponse(BaseModel):
    message: str
