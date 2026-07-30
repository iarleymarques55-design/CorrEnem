# ⚙️ Documentação Completa do Back-end — CorrEnem

O **Back-end** do **CorrEnem** é uma API RESTful de alta performance desenvolvida em **FastAPI (Python)**. Ele orquestra a inteligência artificial para correção pedagógica de redações, processamento visual OCR de manuscritos, autenticação de usuários, envio de e-mails via SMTP e persistência relacional.

---

## 🚀 1. Visão Geral & Tecnologias Utilizadas

| Tecnologia / Biblioteca | Versão | Finalidade |
| :--- | :--- | :--- |
| **Python** | `3.12+` | Linguagem base de execução do servidor |
| **FastAPI** | `^0.115.0` | Framework web assíncrono para construção de APIs REST de alta velocidade |
| **Uvicorn** | `^0.32.0` | Servidor ASGI de produção e desenvolvimento com suporte a reload |
| **Groq SDK** | `^0.11.0` | Cliente oficial para chamadas de modelos de Inteligência Artificial de ultra-baixa latência |
| **SQLAlchemy** | `^2.0.35` | ORM (Object-Relational Mapping) para gerenciamento das tabelas e sessões no PostgreSQL |
| **Psycopg2-binary** | `^2.9.9` | Driver de alta velocidade para comunicação entre Python e PostgreSQL |
| **Pydantic** | `^2.9.0` | Validação estrita de tipos, criação de schemas e tratamento de payloads JSON |
| **Pillow (PIL)** | `^10.4.0` | Manipulação e validação de imagens nos uploads de redações manuscritas |
| **Python-dotenv** | `^1.0.1` | Leitura dinâmica das variáveis de ambiente (`.env`) |

---

## 📁 2. Arquitetura e Estrutura dos Módulos

O código-fonte do backend está estruturado de forma modular e desacoplada:

```
backend/
├── Procfile                   # Instrução de inicialização do servidor Uvicorn no Railway / Render
├── .env                       # Variáveis de ambiente (Chaves API, Banco e SMTP)
├── requirements.txt           # Lista de dependências Python do projeto
├── database.py                # Configuração do Engine SQLAlchemy, Pool, SessionLocal e modelos ORM
├── auth.py                    # Wrapper retrocompatível (re-exporta routers/auth.py)
├── main.py                    # Servidor FastAPI principal (inicialização, CORS e inclusão de routers)
├── routers/                   # Módulos de Rotas por Domínio
│   ├── __init__.py            # Exportação unificada dos routers
│   ├── auth.py                # Rotas de Cadastro, Login, Envio de E-mail SMTP, Reset e Google OAuth
│   ├── correcao.py            # Rota de Correção de Redações com IA (Llama 3.3 70B)
│   ├── historico.py           # Rotas de Histórico de Redações e Rascunhos no PostgreSQL
│   ├── manuscrito.py          # Rota de OCR Visão por IA para Manuscritos (Llama 4 Scout)
│   └── temas.py               # Rotas de Geração de Temas, Roteiros e Redações Nota 1000
└── services/                  # Camada de Serviços e Utilitários
    ├── __init__.py
    ├── fallbacks.py           # Respostas simuladas e mock para desenvolvimento sem API Key
    ├── groq_client.py         # Cliente unificado da Groq API
    └── imagens.py             # Curadoria e busca de imagens temáticas via Unsplash API
```

---

## 🛠️ 3. Módulos do Sistema

### 🔹 `database.py` (Módulo de Conexão com PostgreSQL)
- Configura o motor de conexão (`create_engine`) utilizando a `DATABASE_URL`.
- Implementa a fábrica de sessões `SessionLocal` e os modelos ORM (`User`, `VerificacaoPendente`, `Redacao`, `DesvioRedacao`, `Rascunho`).
- Define a função geradora `get_db()` para **Injeção de Dependência (`Depends`)** no FastAPI.

### 🔹 `routers/auth.py` (Módulo de Segurança & Gestão de Contas)
- **Modelos ORM & Pydantic**: Mapeia as requisições de cadastro, login e redefinição.
- **Hashing PBKDF2-HMAC-SHA256**: Criptografia robusta com salt aleatório e proteção contra *timing attacks*.
- **Serviço de E-mail SMTP**: Envia códigos de verificação de 6 dígitos formatados em HTML via servidor Gmail.

### 🔹 `main.py` (Núcleo de IA e Endpoints Principais)
- Configura permissões de origens cruzadas (**CORS Middleware**).
- Conecta-se à API da Groq utilizando o modelo **Llama 3.3 70B Versatile** para avaliações textuais e o **Llama 4 Scout** para OCR e visão computacional.

---

## 🔌 4. Rotas e Endpoints da API

### 🔑 Autenticação & Usuários (`/auth`)

| Método | Endpoint | Descrição |
| :---: | :--- | :--- |
| `POST` | `/auth/cadastrar` | Registra solicitação de conta e envia código de 6 dígitos por e-mail |
| `POST` | `/auth/verificar-email` | Ativa a conta do usuário após validação do código de 6 dígitos |
| `POST` | `/auth/login` | Autentica e-mail e senha no PostgreSQL |
| `POST` | `/auth/solicitar-reset` | Gera e envia código de 6 dígitos para redefinição de senha |
| `POST` | `/auth/verificar-codigo-reset` | Valida o código de redefinição de senha informado pelo usuário |
| `POST` | `/auth/redefinir-senha` | Atualiza o hash da senha do usuário no banco de dados |
| `POST` | `/auth/google` | Autentica ou cadastra usuários automaticamente via Google OAuth 2.0 |

---

### 🤖 Inteligência Artificial & Correção (`/`)

| Método | Endpoint | Descrição |
| :---: | :--- | :--- |
| `POST` | `/avaliar-redacao` | Submete a redação digitada para avaliação pedagógica completa (C1 a C5) |
| `POST` | `/gerar-tema-groq` | Gera um tema inédito no estilo ENEM com eixos temáticos variados e textos motivadores |
| `POST` | `/transcrever-manuscrito` | Processa foto de redação escrita a mão via **Llama 4 Scout** (com validação anti-fraude para garantir que seja um texto manuscrito) |
| `POST` | `/gerar-modelo-nota-1000` | Gera um texto nota 1000 exemplar sobre o tema com justificativas técnicas por competência |

---

### 📜 Histórico & Rascunhos (`/`)

| Método | Endpoint | Descrição |
| :---: | :--- | :--- |
| `GET` | `/historico/{usuario_id}` | Recupera todas as redações corrigidas e salvas pelo usuário |
| `DELETE`| `/historico/{redacao_id}` | Exclui uma redação específica do histórico |
| `GET` | `/rascunhos/{usuario_id}` | Obtém a lista de rascunhos de redações em andamento |
| `POST` | `/rascunhos` | Salva ou atualiza um rascunho de redação no PostgreSQL |

---

## 🤖 5. Prompts & Modelos de Inteligência Artificial

1. **Llama 3.3 70B (`llama-3.3-70b-versatile`)**:
   - Avalia rigorosamente os textos de acordo com a grade oficial do INEP/ENEM.
   - Fornece notas em múltiplos de 40 (0, 40, 80, 120, 160, 200) para cada uma das 5 competências.
   - Mapeia desvios específicos, trechos problemáticos e sugestões diretas de reescrita.
   - Retorna os dados em formato JSON estrito para consumo direto pelo front-end.

2. **Llama 4 Scout (`meta-llama/llama-4-scout-17b-16e-instruct`)**:
   - Modelo multimodal especializado no processamento visual de manuscritos.
   - Analisa se a imagem enviada é legitimamente uma folha de redação manuscrita.
   - Realiza OCR (Reconhecimento Óptico de Caracteres) transcrevendo o texto manuscrito fielmente para caracteres digitais.
