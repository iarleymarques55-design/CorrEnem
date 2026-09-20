"""
Configuração do Banco de Dados PostgreSQL e ORM (SQLAlchemy)
Para a plataforma CORRENEM.
"""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://correnem_user:correnem_pass_2026@localhost:5432/correnem_db"
)

# Configuração do Engine e Session do SQLAlchemy
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


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

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telefone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    profile_pic: Mapped[str | None] = mapped_column(Text, nullable=True)
    verificado: Mapped[bool] = mapped_column(Boolean, default=False)
    provedor: Mapped[str] = mapped_column(String(30), default="local")
    is_ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))
    atualizado_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    redacoes: Mapped[list["Redacao"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    rascunhos: Mapped[list["Rascunho"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")


class VerificacaoPendente(Base):
    __tablename__ = "verificacoes_pendentes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    senha_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telefone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    profile_pic: Mapped[str | None] = mapped_column(Text, nullable=True)
    codigo: Mapped[str] = mapped_column(String(6), nullable=False)
    expira_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    tentativas_falhas: Mapped[int] = mapped_column(Integer, default=0)
    criado_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))


class Redacao(Base):
    __tablename__ = "redacoes"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    modo_envio: Mapped[str] = mapped_column(String(30), default="digitado")
    imagem_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    tema: Mapped[str] = mapped_column(String(300), nullable=False)
    titulo: Mapped[str | None] = mapped_column(String(150), nullable=True)
    texto_original: Mapped[str] = mapped_column(Text, nullable=False)
    nota_final: Mapped[int] = mapped_column(Integer, nullable=False)

    c1_nota: Mapped[int] = mapped_column(Integer, nullable=False)
    c1_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    c1_sugestoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    c2_nota: Mapped[int] = mapped_column(Integer, nullable=False)
    c2_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    c2_sugestoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    c3_nota: Mapped[int] = mapped_column(Integer, nullable=False)
    c3_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    c3_sugestoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    c4_nota: Mapped[int] = mapped_column(Integer, nullable=False)
    c4_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    c4_sugestoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    c5_nota: Mapped[int] = mapped_column(Integer, nullable=False)
    c5_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    c5_sugestoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    comentario_geral: Mapped[str | None] = mapped_column(Text, nullable=True)
    explicacao_nota_final: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    usuario: Mapped["User"] = relationship(back_populates="redacoes")
    desvios: Mapped[list["DesvioRedacao"]] = relationship(back_populates="redacao", cascade="all, delete-orphan")


class DesvioRedacao(Base):
    __tablename__ = "desvios_redacao"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    redacao_id: Mapped[str] = mapped_column(ForeignKey("redacoes.id", ondelete="CASCADE"), index=True)
    trecho: Mapped[str] = mapped_column(Text, nullable=False)
    erro: Mapped[str] = mapped_column(String(150), nullable=False)
    competencia: Mapped[str] = mapped_column(String(30), nullable=False)
    explicacao: Mapped[str] = mapped_column(Text, nullable=False)
    correcao: Mapped[str] = mapped_column(Text, nullable=False)

    redacao: Mapped["Redacao"] = relationship(back_populates="desvios")


class Rascunho(Base):
    __tablename__ = "rascunhos"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tema: Mapped[str] = mapped_column(String(300), nullable=False)
    titulo: Mapped[str | None] = mapped_column(String(150), nullable=True)
    texto: Mapped[str | None] = mapped_column(Text, nullable=True)
    linhas: Mapped[int] = mapped_column(Integer, default=0)
    criado_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))
    atualizado_em: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    usuario: Mapped["User"] = relationship(back_populates="rascunhos")
