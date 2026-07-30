"""
Servidor Principal FastAPI - CorrEnem Backend API (Arquitetura Modular)
- Autenticação e Segurança (routers/auth.py)
- Correção Criteriosa por IA (routers/correcao.py)
- Histórico e Rascunhos no PostgreSQL (routers/historico.py)
- Transcrição e OCR Visão por IA (routers/manuscrito.py)
- Gerador de Temas, Roteiros e Exemplares (routers/temas.py)
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
from routers import (
    auth_router,
    correcao_router,
    historico_router,
    manuscrito_router,
    temas_router,
)

# Carrega variáveis de ambiente
load_dotenv()

# Inicializa as tabelas do PostgreSQL via SQLAlchemy
try:
    Base.metadata.create_all(bind=engine)
except Exception as db_init_err:
    print(f"AVISO: Não foi possível conectar ao PostgreSQL durante a inicialização: {db_init_err}")

# Instância da aplicação FastAPI
app = FastAPI(
    title="CorrEnem API",
    description="API RESTful de alta performance para correção de redações ENEM com IA (Groq Llama 3.3 70B & Llama 4 Scout).",
    version="2.0.0"
)

# Permite requisições do front-end React (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monta os routers modulares da aplicação
app.include_router(auth_router)
app.include_router(correcao_router)
app.include_router(historico_router)
app.include_router(manuscrito_router)
app.include_router(temas_router)


@app.get("/", tags=["Status"])
async def root():
    """Endpoint de verificação de status da API."""
    return {
        "status": "online",
        "app": "CorrEnem Backend API",
        "version": "2.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
