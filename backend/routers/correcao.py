"""Router de correção de redações usando OpenAI e PostgreSQL."""
import time

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, User, Redacao, DesvioRedacao
from services.openai_client import client, gerar_json
from services.fallbacks import simular_correcao

router = APIRouter(tags=["Correção"])


# ── Modelos Pydantic ──────────────────────────────────────────────────────────

class DesvioEscrita(BaseModel):
    trecho: str = Field(..., description="Trecho exato do texto do estudante contendo o erro ou desvio")
    erro: str = Field(..., description="Nome curto do desvio (ex: Desvio de concordância nominal)")
    competencia: str = Field(..., description="Chave da competência associada: competencia1, competencia2, competencia3, competencia4 ou competencia5")
    explicacao: str = Field(..., description="Explicação didática de por que está incorreto e como corrigir")
    correcao: str = Field(..., description="Sugestão de trecho corrigido para substituição")


class CompetenciaAvaliacao(BaseModel):
    nota: int = Field(..., description="Nota da competência: 0, 40, 80, 120, 160 ou 200")
    feedback: str = Field(..., description="Comentários detalhados apontando os acertos e os desvios na redação")
    sugestoes: str = Field(..., description="Dicas práticas de como o estudante pode evoluir nesta competência")


class ResultadoCorrecao(BaseModel):
    competencia1: CompetenciaAvaliacao = Field(..., description="C1: Domínio da norma culta da língua escrita")
    competencia2: CompetenciaAvaliacao = Field(..., description="C2: Compreender a proposta e aplicar conceitos de várias áreas")
    competencia3: CompetenciaAvaliacao = Field(..., description="C3: Selecionar, relacionar e organizar informações para defender um ponto de vista")
    competencia4: CompetenciaAvaliacao = Field(..., description="C4: Mecanismos linguísticos para construção da argumentação")
    competencia5: CompetenciaAvaliacao = Field(..., description="C5: Proposta de intervenção para o problema abordado")
    nota_final: int = Field(..., description="Soma das notas das 5 competências (máximo 1000)")
    comentario_geral: str = Field(..., description="Avaliação global: pontos fortes, fracos e encorajamento")
    explicacao_nota_final: str = Field(..., description="Explicação didática de como as notas se somaram para compor o resultado")
    desvios: list[DesvioEscrita] = Field(default_factory=list, description="Lista de desvios de escrita para marcação no texto")


class RedacaoRequest(BaseModel):
    tema: str
    texto: str
    usuario_email: str | None = None
    modo_envio: str | None = "digitado"
    imagem_url: str | None = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _salvar_redacao_no_banco(db: Session, requisicao: RedacaoRequest, resultado_dict: dict) -> str:
    """Persiste o resultado da correção no PostgreSQL. Retorna o ID gerado."""
    try:
        user_obj = None
        if requisicao.usuario_email:
            user_obj = db.query(User).filter(User.email == requisicao.usuario_email.strip().lower()).first()

        redacao_id = f"red_{int(time.time() * 1000)}"
        titulo_resumo = requisicao.tema[:25] + "..." if len(requisicao.tema) > 25 else requisicao.tema

        c1 = resultado_dict.get("competencia1", {})
        c2 = resultado_dict.get("competencia2", {})
        c3 = resultado_dict.get("competencia3", {})
        c4 = resultado_dict.get("competencia4", {})
        c5 = resultado_dict.get("competencia5", {})

        nova_redacao = Redacao(
            id=redacao_id,
            usuario_id=user_obj.id if user_obj else None,
            modo_envio=requisicao.modo_envio or "digitado",
            imagem_url=requisicao.imagem_url,
            tema=requisicao.tema,
            titulo=titulo_resumo,
            texto_original=requisicao.texto,
            nota_final=resultado_dict.get("nota_final", 0),
            c1_nota=c1.get("nota", 0) if isinstance(c1, dict) else 0,
            c1_feedback=c1.get("feedback", "") if isinstance(c1, dict) else "",
            c1_sugestoes=c1.get("sugestoes", "") if isinstance(c1, dict) else "",
            c2_nota=c2.get("nota", 0) if isinstance(c2, dict) else 0,
            c2_feedback=c2.get("feedback", "") if isinstance(c2, dict) else "",
            c2_sugestoes=c2.get("sugestoes", "") if isinstance(c2, dict) else "",
            c3_nota=c3.get("nota", 0) if isinstance(c3, dict) else 0,
            c3_feedback=c3.get("feedback", "") if isinstance(c3, dict) else "",
            c3_sugestoes=c3.get("sugestoes", "") if isinstance(c3, dict) else "",
            c4_nota=c4.get("nota", 0) if isinstance(c4, dict) else 0,
            c4_feedback=c4.get("feedback", "") if isinstance(c4, dict) else "",
            c4_sugestoes=c4.get("sugestoes", "") if isinstance(c4, dict) else "",
            c5_nota=c5.get("nota", 0) if isinstance(c5, dict) else 0,
            c5_feedback=c5.get("feedback", "") if isinstance(c5, dict) else "",
            c5_sugestoes=c5.get("sugestoes", "") if isinstance(c5, dict) else "",
            comentario_geral=resultado_dict.get("comentario_geral", ""),
            explicacao_nota_final=resultado_dict.get("explicacao_nota_final", "")
        )
        db.add(nova_redacao)

        desvios = resultado_dict.get("desvios", [])
        for d in desvios:
            if isinstance(d, dict):
                db.add(DesvioRedacao(
                    redacao_id=redacao_id,
                    trecho=d.get("trecho", ""),
                    erro=d.get("erro", ""),
                    competencia=d.get("competencia", "competencia1"),
                    explicacao=d.get("explicacao", ""),
                    correcao=d.get("correcao", "")
                ))

        db.commit()
        return redacao_id
    except Exception as db_err:
        print(f"Aviso ao salvar redação no PostgreSQL: {db_err}")
        return f"red_{int(time.time() * 1000)}"


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/corrigir")
@router.post("/avaliar-redacao", include_in_schema=False)
async def corrigir_redacao(requisicao: RedacaoRequest, db: Session = Depends(get_db)):
    """Corrige a redação nas 5 competências do ENEM usando OpenAI."""
    if not client:
        res_simulado = simular_correcao(requisicao.tema, requisicao.texto)
        redacao_id = _salvar_redacao_no_banco(db, requisicao, res_simulado)
        return {**res_simulado, "id": redacao_id}

    if not requisicao.tema.strip() or not requisicao.texto.strip():
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Tema e Texto são obrigatórios.")

    try:
        prompt_sistema = (
            "Você é um corretor de redação oficial e extremamente criterioso do ENEM.\n"
            "Avalie a redação fornecida seguindo rigorosamente a grade de correção oficial do ENEM.\n"
            "Atribua notas de 0, 40, 80, 120, 160 ou 200 para cada uma das 5 competências.\n"
            "A soma das 5 notas deve ser igual ao campo nota_final.\n"
            "Justifique cada nota e dê dicas reais no campo sugestoes.\n"
            "Preencha o campo explicacao_nota_final detalhando o cálculo e feedback geral de pontuação.\n"
            "Adicionalmente, identifique de 2 a 5 desvios gramaticais, de coesão, clareza ou argumentação reais no texto.\n"
            "No campo 'desvios', retorne um array onde cada objeto possui o 'trecho' exato que contém o erro (case sensitive, igualzinho ao texto original), "
            "o nome do 'erro', a 'competencia' associada (ex: competencia1), a 'explicacao' didática e a 'correcao' sugerida.\n\n"
            "Retorne apenas o objeto JSON solicitado, sem markdown ou texto adicional."
        )

        prompt_usuario = (
            f"Tema da Redação: {requisicao.tema}\n\n"
            f"Texto do Estudante:\n{requisicao.texto}"
        )

        dados_resultado = gerar_json(
            prompt_sistema,
            prompt_usuario,
            ResultadoCorrecao,
            temperatura=0.2,
        )
        resultado_validado = ResultadoCorrecao.model_validate(dados_resultado)
        notas = [getattr(resultado_validado, f"competencia{i}").nota for i in range(1, 6)]
        if sum(notas) != resultado_validado.nota_final:
            raise ValueError("A nota final não corresponde à soma das competências.")
        if any(desvio.trecho not in requisicao.texto for desvio in resultado_validado.desvios):
            raise ValueError("A OpenAI retornou um desvio ausente do texto original.")
        dados_resultado = resultado_validado.model_dump()
        redacao_id = _salvar_redacao_no_banco(db, requisicao, dados_resultado)
        return {**dados_resultado, "id": redacao_id}

    except Exception as e:
        print(f"Erro na OpenAI, simulando correção: {e}")
        res_fallback = simular_correcao(requisicao.tema, requisicao.texto)
        redacao_id = _salvar_redacao_no_banco(db, requisicao, res_fallback)
        return {**res_fallback, "id": redacao_id}
