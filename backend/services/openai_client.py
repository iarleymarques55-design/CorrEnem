"""Cliente OpenAI e helpers para respostas estruturadas e visão."""
import asyncio
import base64
import json
import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_TEXT_MODEL = os.getenv("OPENAI_TEXT_MODEL", "gpt-4o-mini")
OPENAI_VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", OPENAI_TEXT_MODEL)

if not OPENAI_API_KEY or OPENAI_API_KEY == "COLE_A_NOVA_CHAVE_OPENAI_AQUI":
    print("AVISO: OPENAI_API_KEY não encontrada. A IA ficará indisponível.")
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)


def gerar_json(
    instrucao_sistema: str,
    conteudo: Any,
    schema: Any,
    *,
    temperatura: float = 0.2,
    modelo: str | None = None,
    max_output_tokens: int | None = None,
) -> dict:
    """Gera JSON usando a API de chat da OpenAI."""
    if client is None:
        raise RuntimeError("Cliente OpenAI indisponível")

    kwargs = {
        "model": modelo or OPENAI_TEXT_MODEL,
        "messages": [
            {"role": "system", "content": instrucao_sistema},
            {"role": "user", "content": conteudo},
        ],
        "temperature": temperatura,
        "response_format": {"type": "json_object"},
    }
    if max_output_tokens is not None:
        kwargs["max_tokens"] = max_output_tokens

    resposta = client.chat.completions.create(**kwargs)
    texto = resposta.choices[0].message.content if resposta.choices else None
    if not texto:
        raise ValueError("OpenAI retornou uma resposta vazia")
    return json.loads(texto)


async def gerar_json_async(
    instrucao_sistema: str,
    conteudo: Any,
    schema: Any,
    *,
    temperatura: float = 0.2,
    modelo: str | None = None,
    max_output_tokens: int | None = None,
    timeout: float = 45.0,
) -> dict:
    """Executa a chamada bloqueante fora do event loop do FastAPI."""
    return await asyncio.wait_for(
        asyncio.to_thread(
            gerar_json,
            instrucao_sistema,
            conteudo,
            schema,
            temperatura=temperatura,
            modelo=modelo,
            max_output_tokens=max_output_tokens,
        ),
        timeout=timeout,
    )


def analisar_imagem(
    instrucao: str,
    imagem: bytes,
    mime_type: str,
    schema: Any,
    *,
    temperatura: float = 0.0,
    max_output_tokens: int | None = None,
) -> dict:
    """Analisa uma imagem usando o modelo multimodal da OpenAI."""
    imagem_b64 = base64.b64encode(imagem).decode("utf-8")
    conteudo = [
        {"type": "text", "text": instrucao},
        {
            "type": "image_url",
            "image_url": {"url": f"data:{mime_type};base64,{imagem_b64}"},
        },
    ]
    return gerar_json(
        instrucao,
        conteudo,
        schema,
        temperatura=temperatura,
        modelo=OPENAI_VISION_MODEL,
        max_output_tokens=max_output_tokens,
    )


def transcrever_imagem(instrucao: str, imagem: bytes, mime_type: str) -> str:
    """Transcreve uma imagem manuscrita usando o modelo multimodal."""
    if client is None:
        raise RuntimeError("Cliente OpenAI indisponível")

    imagem_b64 = base64.b64encode(imagem).decode("utf-8")
    resposta = client.chat.completions.create(
        model=OPENAI_VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": instrucao},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{imagem_b64}"},
                    },
                ],
            }
        ],
        temperature=0.1,
    )
    texto = resposta.choices[0].message.content if resposta.choices else None
    if not texto:
        raise ValueError("OpenAI não retornou transcrição")
    return texto.strip()
