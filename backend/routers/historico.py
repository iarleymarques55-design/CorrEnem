"""
Router de Histórico — /redacoes/usuario, /rascunhos
Gerencia o histórico de redações corrigidas e os rascunhos salvos
do usuário no PostgreSQL via SQLAlchemy.
"""
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, User, Redacao, DesvioRedacao, Rascunho

router = APIRouter(tags=["Histórico & Rascunhos"])


# ── Modelo Pydantic ───────────────────────────────────────────────────────────

class RascunhoSaveRequest(BaseModel):
    id: str | None = None
    usuario_email: str
    tema: str
    titulo: str | None = None
    texto: str | None = None
    linhas: int | None = 0


# ── Endpoints de Redações ─────────────────────────────────────────────────────

@router.get("/redacoes/usuario")
async def listar_redacoes_usuario(email: str, db: Session = Depends(get_db)):
    """Retorna o histórico de redações avaliadas do usuário no PostgreSQL."""
    user_obj = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user_obj:
        return []

    redacoes = (
        db.query(Redacao)
        .filter(Redacao.usuario_id == user_obj.id)
        .order_by(Redacao.criado_em.desc())
        .all()
    )

    resultado_lista = []
    for r in redacoes:
        desvios = db.query(DesvioRedacao).filter(DesvioRedacao.redacao_id == r.id).all()
        resultado_lista.append({
            "id": r.id,
            "tema": r.tema,
            "titulo": r.titulo or r.tema,
            "texto_original": r.texto_original,
            "nota_final": r.nota_final,
            "competencia1": {"nota": r.c1_nota, "feedback": r.c1_feedback, "sugestoes": r.c1_sugestoes},
            "competencia2": {"nota": r.c2_nota, "feedback": r.c2_feedback, "sugestoes": r.c2_sugestoes},
            "competencia3": {"nota": r.c3_nota, "feedback": r.c3_feedback, "sugestoes": r.c3_sugestoes},
            "competencia4": {"nota": r.c4_nota, "feedback": r.c4_feedback, "sugestoes": r.c4_sugestoes},
            "competencia5": {"nota": r.c5_nota, "feedback": r.c5_feedback, "sugestoes": r.c5_sugestoes},
            "comentario_geral": r.comentario_geral,
            "explicacao_nota_final": r.explicacao_nota_final,
            "desvios": [
                {
                    "trecho": d.trecho,
                    "erro": d.erro,
                    "competencia": d.competencia,
                    "explicacao": d.explicacao,
                    "correcao": d.correcao
                } for d in desvios
            ],
            "criado_em": r.criado_em.isoformat() if r.criado_em else None,
            "data": r.criado_em.strftime("%d/%m/%Y às %H:%M") if r.criado_em else "recém-criada"
        })
    return resultado_lista


@router.get("/historico/{usuario_id}", include_in_schema=False)
async def historico_legacy(usuario_id: str, db: Session = Depends(get_db)):
    """Rota de compatibilidade para obter histórico por ID de usuário ou e-mail."""
    if "@" in usuario_id:
        return await listar_redacoes_usuario(email=usuario_id, db=db)
    user_obj = db.query(User).filter(User.id == int(usuario_id)).first() if usuario_id.isdigit() else None
    if not user_obj:
        return []
    return await listar_redacoes_usuario(email=user_obj.email, db=db)


@router.delete("/historico/{redacao_id}", include_in_schema=False)
async def deletar_redacao_legacy(redacao_id: str, db: Session = Depends(get_db)):
    """Exclui uma redação do PostgreSQL."""
    db.query(Redacao).filter(Redacao.id == redacao_id).delete()
    db.commit()
    return {"sucesso": True}


# ── Endpoints de Rascunhos ────────────────────────────────────────────────────

@router.post("/rascunhos")
async def salvar_rascunho(dados: RascunhoSaveRequest, db: Session = Depends(get_db)):
    """Salva ou atualiza um rascunho de redação no PostgreSQL."""
    user_obj = db.query(User).filter(User.email == dados.usuario_email.strip().lower()).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    draft_id = dados.id or f"draft_{int(time.time() * 1000)}"
    rascunho_existente = db.query(Rascunho).filter(Rascunho.id == draft_id).first()

    if rascunho_existente:
        rascunho_existente.tema = dados.tema
        rascunho_existente.titulo = dados.titulo
        rascunho_existente.texto = dados.texto
        rascunho_existente.linhas = dados.linhas
        rascunho_existente.atualizado_em = datetime.now(timezone.utc)
    else:
        db.add(Rascunho(
            id=draft_id,
            usuario_id=user_obj.id,
            tema=dados.tema,
            titulo=dados.titulo or dados.tema,
            texto=dados.texto,
            linhas=dados.linhas or 0
        ))

    db.commit()
    return {"sucesso": True, "id": draft_id}


@router.get("/rascunhos/usuario")
async def listar_rascunhos_usuario(email: str, db: Session = Depends(get_db)):
    """Retorna os rascunhos salvos do usuário no PostgreSQL."""
    user_obj = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user_obj:
        return []

    rascunhos = (
        db.query(Rascunho)
        .filter(Rascunho.usuario_id == user_obj.id)
        .order_by(Rascunho.atualizado_em.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "tema": r.tema,
            "titulo": r.titulo or r.tema,
            "texto": r.texto or "",
            "linhas": r.linhas,
            "data": r.atualizado_em.strftime("%d/%m/%Y") if r.atualizado_em else ""
        }
        for r in rascunhos
    ]


@router.get("/rascunhos/{usuario_id}", include_in_schema=False)
async def rascunhos_legacy(usuario_id: str, db: Session = Depends(get_db)):
    """Rota de compatibilidade para listar rascunhos por e-mail ou ID."""
    if "@" in usuario_id:
        return await listar_rascunhos_usuario(email=usuario_id, db=db)
    user_obj = db.query(User).filter(User.id == int(usuario_id)).first() if usuario_id.isdigit() else None
    if not user_obj:
        return []
    return await listar_rascunhos_usuario(email=user_obj.email, db=db)


@router.delete("/rascunhos/{draft_id}")
async def deletar_rascunho(draft_id: str, db: Session = Depends(get_db)):
    """Exclui um rascunho do PostgreSQL."""
    db.query(Rascunho).filter(Rascunho.id == draft_id).delete()
    db.commit()
    return {"sucesso": True}
