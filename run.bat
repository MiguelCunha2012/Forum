@echo off
echo =======================================================
echo            INICIALIZADOR DO FÓRUM FULLSTACK
echo =======================================================
echo.
echo [1/2] Iniciando o Backend FastAPI (Porta 8000)...
start "Fórum - Backend API" cmd /k "cd backend && .venv\Scripts\uvicorn main:app --reload"

echo [2/2] Iniciando o Frontend React + Vite (Porta 5173)...
start "Fórum - Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo Servidores iniciados com sucesso!
echo - Backend: http://localhost:8000
echo - Documentacao Swagger: http://localhost:8000/docs
echo - Frontend: http://localhost:5173
echo =======================================================
pause
