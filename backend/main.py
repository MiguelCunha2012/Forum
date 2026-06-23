import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from app.infrastructure.database import init_db
from app.presentation.api import api_router

# Diretórios absolutos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
FRONTEND_DIST_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")

# Cria pastas caso não existam
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa o banco de dados na inicialização do servidor
    init_db()
    yield

app = FastAPI(
    title="Fórum Game API",
    description="Backend moderno do Fórum Game em Clean Architecture",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração de CORS para desenvolvimento local com React/Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas da API
app.include_router(api_router)

# Serve a pasta de uploads estaticamente
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Rota fallback para servir o frontend React compilado em produção (Vite SPA)
# Se a pasta dist existir, o backend hospeda o frontend
if os.path.exists(FRONTEND_DIST_DIR):
    ASSETS_DIR = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

    @app.get("/{fallback_path:path}")
    def serve_frontend(fallback_path: str):
        # Não intercepta chamadas de API ou arquivos de upload
        if fallback_path.startswith("api") or fallback_path.startswith("uploads"):
            raise HTTPException(status_code=404)
        
        index_file = os.path.join(FRONTEND_DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html não encontrado")
else:
    # Rota raiz simples para desenvolvimento caso o frontend não esteja compilado
    @app.get("/")
    def read_root():
        return {
            "status": "Online",
            "message": "Fórum Game API rodando. Documentação Swagger disponível em /docs",
            "docs": "/docs"
        }
