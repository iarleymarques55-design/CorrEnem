"""
Módulo de Routers do CorrEnem Backend
Exporta os 5 routers modulares da aplicação.
"""
from routers.auth import router as auth_router
from routers.correcao import router as correcao_router
from routers.historico import router as historico_router
from routers.manuscrito import router as manuscrito_router
from routers.temas import router as temas_router

__all__ = [
    "auth_router",
    "correcao_router",
    "historico_router",
    "manuscrito_router",
    "temas_router",
]
