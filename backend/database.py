"""
Configuração do Banco de Dados PostgreSQL e ORM (SQLAlchemy)
Para a plataforma CORRENEM.
"""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Boolean, 
    TIMESTAMP, ForeignKey, CheckConstraint
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://correnem_user:correnem_pass_2026@localhost:5432/correnem_db"
)

# Configuração do Engine e Session do SQLAlchemy
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Função Utilitária para Dependência de Sessão no FastAPI ───────────────────

def get_db():
    """Dependency para injeção de sessão do banco em rotas FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Mapeamento ORM das Tabelas do PostgreSQL ──────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=True) # Nullable para Google OAuth
    telefone = Column(String(20), nullable=True)
    profile_pic = Column(Text, nullable=True)
    verificado = Column(Boolean, default=False)
    provedor = Column(String(30), default="local") # 'local' ou 'google'
    is_ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    redacoes = relationship("Redacao", back_populates="usuario", cascade="all, delete-orphan")
    rascunhos = relationship("Rascunho", back_populates="usuario", cascade="all, delete-orphan")


class VerificacaoPendente(Base):
    __tablename__ = "verificacoes_pendentes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    nome = Column(String(150), nullable=False)
    senha_hash = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    profile_pic = Column(Text, nullable=True)
    codigo = Column(String(6), nullable=False)
    expira_em = Column(TIMESTAMP(timezone=True), nullable=False)
    tentativas_falhas = Column(Integer, default=0)
    criado_em = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))


class Redacao(Base):
    __tablename__ = "redacoes"

    id = Column(String(50), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    modo_envio = Column(String(30), default="digitado")
    imagem_url = Column(Text, nullable=True)
    tema = Column(String(300), nullable=False)
    titulo = Column(String(150), nullable=True)
    texto_original = Column(Text, nullable=False)
    nota_final = Column(Integer, nullable=False)

    c1_nota = Column(Integer, nullable=False)
    c1_feedback = Column(Text, nullable=True)
    c1_sugestoes = Column(Text, nullable=True)

    c2_nota = Column(Integer, nullable=False)
    c2_feedback = Column(Text, nullable=True)
    c2_sugestoes = Column(Text, nullable=True)

    c3_nota = Column(Integer, nullable=False)
    c3_feedback = Column(Text, nullable=True)
    c3_sugestoes = Column(Text, nullable=True)

    c4_nota = Column(Integer, nullable=False)
    c4_feedback = Column(Text, nullable=True)
    c4_sugestoes = Column(Text, nullable=True)

    c5_nota = Column(Integer, nullable=False)
    c5_feedback = Column(Text, nullable=True)
    c5_sugestoes = Column(Text, nullable=True)

    comentario_geral = Column(Text, nullable=True)
    explicacao_nota_final = Column(Text, nullable=True)
    criado_em = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    usuario = relationship("User", back_populates="redacoes")
    desvios = relationship("DesvioRedacao", back_populates="redacao", cascade="all, delete-orphan")


class DesvioRedacao(Base):
    __tablename__ = "desvios_redacao"

    id = Column(Integer, primary_key=True, index=True)
    redacao_id = Column(String(50), ForeignKey("redacoes.id", ondelete="CASCADE"), index=True)
    trecho = Column(Text, nullable=False)
    erro = Column(String(150), nullable=False)
    competencia = Column(String(30), nullable=False)
    explicacao = Column(Text, nullable=False)
    correcao = Column(Text, nullable=False)

    redacao = relationship("Redacao", back_populates="desvios")


class Rascunho(Base):
    __tablename__ = "rascunhos"

    id = Column(String(50), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tema = Column(String(300), nullable=False)
    titulo = Column(String(150), nullable=True)
    texto = Column(Text, nullable=True)
    linhas = Column(Integer, default=0)
    criado_em = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    usuario = relationship("User", back_populates="rascunhos")
