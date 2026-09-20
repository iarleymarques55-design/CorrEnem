# Migração do backend para OpenAI

## Resumo

O provedor de IA do backend foi trocado de Gemini para OpenAI.
Os endpoints públicos foram preservados, então o frontend continua usando as mesmas URLs.

## Alterações principais

- Criado `backend/services/openai_client.py`.
- Removido o cliente Gemini antigo.
- Migrados correção, temas, roteiros, exemplares e manuscritos.
- Adicionado suporte OpenAI para texto, JSON e visão.
- Mantida a execução em thread nas rotas assíncronas para não bloquear o FastAPI.
- Mantido timeout de geração de tema.
- Mantidos fallbacks de correção e demais fluxos.

## Dependência

`backend/requirements.txt` agora usa:

```text
openai>=1.0.0
```

O SDK instalado no ambiente local é `openai 3.16.2`.

## Variáveis de ambiente

Configure em `backend/.env` e no Railway:

```env
OPENAI_API_KEY=sk-sua-chave
OPENAI_TEXT_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4o-mini
```

A chave deve ficar somente no backend. Nunca use `VITE_OPENAI_API_KEY`.

## Funcionalidades migradas

- `/corrigir`
- `/avaliar-redacao`
- `/gerar-tema`
- `/gerar-roteiro`
- `/exemplar-referencia`
- `/transcrever-manuscrito`

A correção continua validando as cinco competências, a soma das notas e os trechos dos desvios.
A validação visual e a transcrição de manuscritos usam o modelo multimodal configurado.

## Geração de temas

A geração ocorre somente quando a API OpenAI está disponível.
Se a chave estiver ausente, houver limite, timeout ou erro do provedor, o backend retorna HTTP 503.
O frontend exibe uma mensagem ao usuário e não seleciona um tema aleatório silenciosamente.

## Deploy

1. Configure `OPENAI_API_KEY` no serviço backend do Railway.
2. Configure os modelos de texto e visão.
3. Remova as variáveis Gemini antigas do Railway.
4. Execute o deploy.
5. Teste `/docs`, `/corrigir`, `/gerar-tema` e `/transcrever-manuscrito`.

## Validação realizada

- Imports OpenAI e routers aprovados.
- Sintaxe do backend aprovada.
- Modelos SQLAlchemy continuam tipados com `Mapped`.
- Banco e tabelas existentes preservados.
- Frontend continua consumindo os mesmos endpoints.

## Observação

A API OpenAI exige chave e créditos/faturamento configurados na plataforma.
Erros HTTP `401`, `429` e `503` devem ser monitorados nos logs e tratados pelo fallback ou mensagem de indisponibilidade.

Referência: [documentação oficial da API OpenAI](https://platform.openai.com/docs/api-reference).
