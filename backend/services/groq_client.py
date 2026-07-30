"""
Inicialização do Cliente Groq (LLM).
Expõe o objeto `client` e `GROQ_API_KEY` para uso nos routers.
"""
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

if not GROQ_API_KEY or GROQ_API_KEY == "MinhaChaveDoGroqAqui":
    print("AVISO: Chave de API do Groq não encontrada no arquivo .env — rodando em modo simulação.")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)
