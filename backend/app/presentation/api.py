from fastapi import APIRouter
from app.presentation.auth_routes import router as auth_router
from app.presentation.user_routes import router as user_router
from app.presentation.post_routes import router as post_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(post_router)
