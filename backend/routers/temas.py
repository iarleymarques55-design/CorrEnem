"""
Router de Temas, Roteiros e Exemplares — /gerar-tema, /gerar-roteiro, /exemplar-referencia
Gera temas inéditos no estilo ENEM, roteiros de escrita orientada e redações modelo nota 1000
usando Groq (Llama 3.3 70B). Inclui anti-repetição de temas e seleção de imagens Unsplash.
"""
import json

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.groq_client import client
from services.imagens import get_bg_image_for_tema
from services.fallbacks import HISTORICO_TEMAS_GERADOS, simular_tema_gerado, simular_roteiro, simular_exemplar

router = APIRouter(tags=["Temas & Exemplares"])


# ── Modelos Pydantic ──────────────────────────────────────────────────────────

class TemaGerado(BaseModel):
    titulo: str = Field(..., description="Título do tema no estilo ENEM")
    desc: str = Field(..., description="Instrução rápida sobre a proposta")
    motivadores: str = Field(..., description="Textos de apoio estruturados com cabeçalhos como TEXTO I, TEXTO II...")
    bgImage: str = Field(..., description="URL de imagem do Unsplash correspondente")
    eixo: str = Field(..., description="Eixo temático (Meio Ambiente, Sociedade, Saúde, Educação, Cultura, Tecnologia...)")


class RoteiroRequest(BaseModel):
    tema: str


class RoteiroResposta(BaseModel):
    pergunta1: str = Field(..., description="Pergunta para o primeiro parágrafo (introdução e tese)")
    pergunta2: str = Field(..., description="Pergunta para o segundo parágrafo (desenvolvimento da primeira causa/argumento)")
    pergunta3: str = Field(..., description="Pergunta para o terceiro parágrafo (desenvolvimento da segunda causa/argumento)")
    pergunta4: str = Field(..., description="Pergunta para o quarto parágrafo (conclusão e proposta de intervenção)")


class ExemplarRequest(BaseModel):
    tema: str


class ExemplarResposta(BaseModel):
    tema_titulo: str = Field(..., description="Título do tema da redação modelo")
    redacao_modelo: str = Field(..., description="Redação nota 1000 completa sobre o tema com 4 parágrafos bem definidos")
    analise_c1: str = Field(..., description="Nota 200/200 - Análise profunda da Competência 1 (Norma Culta)")
    analise_c2: str = Field(..., description="Nota 200/200 - Análise profunda da Competência 2 (Repertório e Tema)")
    analise_c3: str = Field(..., description="Nota 200/200 - Análise profunda da Competência 3 (Projeto de Texto e Argumentação)")
    analise_c4: str = Field(..., description="Nota 200/200 - Análise profunda da Competência 4 (Coesão Linguística)")
    analise_c5: str = Field(..., description="Nota 200/200 - Análise profunda da Competência 5 (Proposta de Intervenção)")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/gerar-tema", response_model=TemaGerado)
@router.post("/gerar-tema-groq", response_model=TemaGerado, include_in_schema=False)
async def gerar_tema():
    """Gera um tema de redação inédito no estilo ENEM com textos motivadores e imagem temática."""
    if not client:
        return simular_tema_gerado()

    try:
        # Limita o histórico a 8 temas para evitar prompt crescente
        if len(HISTORICO_TEMAS_GERADOS) > 8:
            HISTORICO_TEMAS_GERADOS.pop(0)

        temas_anteriores_str = ", ".join(HISTORICO_TEMAS_GERADOS) if HISTORICO_TEMAS_GERADOS else "nenhum"

        prompt_sistema = (
            "Você é um elaborador oficial de provas do ENEM. Gere um tema de redação inédito, relevante e atual.\n\n"
            f"NÃO repita nem se inspire nos temas recentes: [{temas_anteriores_str}].\n\n"
            "Retorne SOMENTE um objeto JSON com exatamente estes 5 campos:\n"
            "{\n"
            '  "titulo": "<título completo do tema no estilo ENEM, entre 8 e 15 palavras>",\n'
            '  "desc": "<instrução de 1 frase sobre o que o candidato deve fazer>",\n'
            '  "eixo": "<um de: Meio Ambiente | Sociedade | Saúde | Educação | Cultura | Tecnologia>",\n'
            '  "bgImage": "",\n'
            '  "motivadores": "<três textos motivadores separados por \\n\\n, seguindo EXATAMENTE este modelo:"\n'
            "}\n\n"
            "FORMATO OBRIGATÓRIO do campo 'motivadores':\n"
            "TEXTO I — <título do texto>\n"
            "<parágrafo de 3 a 5 linhas com dados reais, estatísticas ou citação de autor/órgão>\n"
            "\n"
            "TEXTO II — <título do texto>\n"
            "<parágrafo de 3 a 5 linhas com dados reais, estatísticas ou citação de autor/órgão>\n"
            "\n"
            "TEXTO III — <título do texto>\n"
            "<parágrafo de 3 a 5 linhas com dados reais, estatísticas ou citação de autor/órgão>\n\n"
            "REGRAS ABSOLUTAS:\n"
            "- PROIBIDO usar markdown: sem #, ##, **, *, _, -, numeração com ponto\n"
            "- Cada TEXTO deve ter um título após o travessão (—) na primeira linha\n"
            "- Os textos devem ser realistas, com dados do Brasil, referências a órgãos como IBGE, OMS, ONU, pesquisadores reconhecidos\n"
            "- Separar cada bloco TEXTO com exatamente uma linha em branco\n"
            "- O campo 'motivadores' deve ser uma string de texto puro, sem listas ou markdown"
        )

        resposta = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": "Gere um novo tema inédito do ENEM agora."}
            ],
            response_format={"type": "json_object"},
            temperature=0.75,
            max_tokens=1200,
        )

        dados = json.loads(resposta.choices[0].message.content)

        # Limpa qualquer resquício de markdown no campo motivadores
        motivadores = dados.get("motivadores", "")
        for char in ["##", "**", "__", "* ", "- ", "# "]:
            motivadores = motivadores.replace(char, "")
        dados["motivadores"] = motivadores.strip()

        if dados.get("titulo"):
            HISTORICO_TEMAS_GERADOS.append(dados["titulo"])

        # Seleciona a imagem mais relevante e sem repetição
        dados["bgImage"] = get_bg_image_for_tema(
            titulo=dados.get("titulo", ""),
            eixo=dados.get("eixo", "")
        )
        return dados

    except Exception as e:
        print(f"Erro ao gerar tema com IA: {e}")
        return simular_tema_gerado()


@router.post("/gerar-roteiro", response_model=RoteiroResposta)
async def gerar_roteiro(requisicao: RoteiroRequest):
    """Gera 4 perguntas orientadoras para auxiliar a escrita de redação ENEM sobre o tema."""
    if not client:
        return simular_roteiro(requisicao.tema)

    try:
        schema_json = RoteiroResposta.model_json_schema()
        prompt_sistema = (
            f"Gere 4 perguntas cruciais para orientar a escrita de uma redação do ENEM sobre o tema: '{requisicao.tema}'.\n"
            "As perguntas devem ajudar o aluno a pensar em cada parágrafo de sua dissertação:\n"
            "Pergunta 1 (para o parágrafo 1 - Introdução): Como contextualizar e qual tese defender?\n"
            "Pergunta 2 (para o parágrafo 2 - Desenvolvimento 1): Qual a principal causa ou fator desse problema?\n"
            "Pergunta 3 (para o parágrafo 3 - Desenvolvimento 2): Qual a consequência ou segundo fator do problema no Brasil?\n"
            "Pergunta 4 (para o parágrafo 4 - Conclusão): O que propõe de intervenção prática contendo agente, ação, meio, detalhamento e efeito?\n\n"
            "Retorne APENAS o JSON condizente com este esquema:\n"
            f"{json.dumps(schema_json, ensure_ascii=False)}"
        )

        resposta = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": f"Tema: {requisicao.tema}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )

        return json.loads(resposta.choices[0].message.content)

    except Exception as e:
        print(f"Erro ao gerar roteiro: {e}")
        return simular_roteiro(requisicao.tema)


@router.post("/exemplar-referencia", response_model=ExemplarResposta)
@router.post("/gerar-modelo-nota-1000", response_model=ExemplarResposta, include_in_schema=False)
async def exemplar_referencia(requisicao: ExemplarRequest):
    """Gera uma redação modelo nota 1000 com análise detalhada das 5 competências do ENEM."""
    if not client:
        return simular_exemplar(requisicao.tema)

    try:
        prompt_sistema = (
            "Você é o maior especialista da banca avaliadora do ENEM. Escreva uma redação nota 1000.\n\n"
            f"Tema: {requisicao.tema}\n\n"
            "Retorne SOMENTE um objeto JSON com estes 7 campos exatos:\n"
            "{\n"
            '  "tema_titulo": "<título completo do tema>",\n'
            '  "redacao_modelo": "<redação com 4 parágrafos separados por \\n\\n: Introdução + 2 Desenvolvimentos + Conclusão. Cada parágrafo com 5 a 8 linhas. Use recuo no início de cada parágrafo (espaços). Inclua repertório legítimo como filósofos, sociólogos, dados do IBGE, ONU>",\n'
            '  "analise_c1": "<Por que tirou 200/200 em Norma Culta — cite exemplos do texto>",\n'
            '  "analise_c2": "<Por que tirou 200/200 em Compreensão e Repertório — cite o repertório usado>",\n'
            '  "analise_c3": "<Por que tirou 200/200 em Projeto de Texto e Argumentação — cite a estrutura usada>",\n'
            '  "analise_c4": "<Por que tirou 200/200 em Coesão — cite os conectivos usados>",\n'
            '  "analise_c5": "<Por que tirou 200/200 em Proposta de Intervenção — cite os 5 elementos: agente, ação, meio, efeito, detalhamento>"\n'
            "}\n\n"
            "REGRAS:\n"
            "- A redação deve ser original, coerente e completamente sobre o tema especificado\n"
            "- PROIBIDO markdown: sem **, ##, *, _ ou listas com traços\n"
            "- Os 4 parágrafos DEVEM estar separados por exatamente \\n\\n\n"
            "- Cada análise deve mencionar trechos reais da redação que você escreveu"
        )

        resposta = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": f"Gere a redação nota 1000 sobre o tema: {requisicao.tema}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=2000,
        )

        dados = json.loads(resposta.choices[0].message.content)

        # Limpa markdown residual da redação
        redacao = dados.get("redacao_modelo", "")
        for char in ["**", "##", "# ", "* ", "_ "]:
            redacao = redacao.replace(char, "")
        dados["redacao_modelo"] = redacao.strip()

        return dados

    except Exception as e:
        print(f"Erro ao gerar exemplar: {e}")
        return simular_exemplar(requisicao.tema)
