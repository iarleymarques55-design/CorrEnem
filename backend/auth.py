"""
Wrapper de compatibilidade retroativa para backend/auth.py.
Re-exporta o router e modelos de routers/auth.py.
"""
from routers.auth import (
    router,
    CadastroRequest,
    LoginRequest,
    VerificarEmailRequest,
    ReenviarCodigoRequest,
    SolicitarResetRequest,
    VerificarResetRequest,
    RedefinirSenhaRequest,
    GoogleLoginRequest,
)

__all__ = [
    "router",
    "CadastroRequest",
    "LoginRequest",
    "VerificarEmailRequest",
    "ReenviarCodigoRequest",
    "SolicitarResetRequest",
    "VerificarResetRequest",
    "RedefinirSenhaRequest",
    "GoogleLoginRequest",
]
