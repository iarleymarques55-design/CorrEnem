# 🎓 CorrEnem — Corretor Inteligente de Redação ENEM

**CorrEnem** é uma plataforma web completa projetada para auxiliar estudantes na preparação para a prova de redação do ENEM. A aplicação utiliza modelos de Inteligência Artificial de última geração via **Groq API** (Llama 3.3 70B para avaliação pedagógica e Llama 4 Scout para visão computacional e OCR de manuscritos).

---

## 🚀 Tecnologias Utilizadas

### **Front-end**
- **React 19** + **Vite 6**
- **Tailwind CSS 4** (Design responsivo, glassmorphism e micro-animações)
- **Lucide React** (Ícones modernos)
- **Axios** (Integração HTTP)

### **Back-end**
- **FastAPI** (Python 3.12+)
- **Groq SDK** (`llama-3.3-70b-versatile` & `meta-llama/llama-4-scout-17b-16e-instruct`)
- **Pillow / PIL** (Processamento físico de imagens)
- **Uvicorn** (Servidor ASGI)

---

## 🛠️ Funcionalidades Principais

1. **Correção Automática por Competências (C1 a C5)**:
   - Avaliação detalhada de cada competência oficial do ENEM (0 a 200 pontos).
   - Identificação precisa de desvios gramaticais e de coesão no texto do aluno.
   - Comentários gerais e explicação didática do cálculo da nota final.

2. **Geração de Temas com IA (Anti-Repetição)**:
   - Formulação de temas inéditos estilo ENEM com eixos temáticos variados.
   - Seleção dinâmica de imagens reais do Unsplash baseadas em palavras-chave.
   - Textos motivadores estruturados sem poluição de markdown.

3. **Submissão de Manuscrito (OCR com Visão por IA)**:
   - Upload de fotos de redações escritas à mão.
   - Análise inteligente via **Llama 4 Scout** para identificar se a imagem é realmente uma folha de redação manuscrita (rejeitando fotos de pessoas, objetos, alimentos, etc.).

4. **Modos de Prática Diversificados**:
   - **Dissertativo Padrão**: Escrita livre em folha pautada simulada com contagem de linhas e palavras em tempo real.
   - **Roteiro Orientado**: Pergunta-guia por parágrafo para estruturar a dissertação.
   - **Exemplar Modelo Nota 1000**: Redação perfeita gerada por IA com justificativas técnicas por competência.

---

## 🔐 Relatório de Análise de Segurança & Recomendações de Arquitetura

Como a aplicação se encontra em fase de protótipo e transição para um banco de dados relacional ou NoSQL (PostgreSQL / Supabase / MongoDB), destacam-se os seguintes pontos de atenção e recomendações de segurança:

### 1. **Autenticação & Hashing de Senhas**
- **Estado Atual**: Implementado hashing robusto com **PBKDF2-HMAC-SHA256** com salt único gerado aleatoriamente e validação em tempo constante.
- **Gestão de Sessão**: O backend armazena o estado de verificação com e-mail diretamente no banco PostgreSQL.

### 2. **Armazenamento de Dados no Front-end**
- **Estado Atual**: Persistência temporária de rascunhos e perfil em `localStorage`.
- **Recomendação**: Evitar armazenar credenciais ou dados sensíveis em texto claro no `localStorage`. Manter apenas informações públicas e tokens expiráveis.

### 3. **Proteção no Upload de Arquivos (`/transcrever-manuscrito`)**
- **Estado Atual**: Validação física prévia (resolução e formato) e classificação visual por IA.
- **Recomendação**: Adicionar middleware no FastAPI para impor limite rígido de tamanho de arquivo (ex: máximo 5 MB) antes da leitura total no buffer de memória (`await imagem.read()`), prevenindo potenciais ataques de Negação de Serviço (*DoS*).

### 4. **Controle de Origem (CORS) & Variáveis de Ambiente**
- **Estado Atual**: Restrito às origens especificadas em `ALLOWED_ORIGINS` no `.env`.
- **Recomendação**: Ao realizar a publicação em produção, atualizar as origens permitidas no `CORSMiddleware` exclusivamente para o domínio oficial da aplicação e garantir que a `GROQ_API_KEY` e a `BREVO_API_KEY` permaneçam isoladas no arquivo `.env`.

---

## 💻 Como Executar o Projeto

### **1. Servidor Back-end (FastAPI)**

```bash
cd backend

# Criar e ativar o ambiente virtual (Windows)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install fastapi uvicorn groq python-dotenv pillow pydantic

# Configurar o arquivo .env
# Adicione sua GROQ_API_KEY no arquivo backend/.env

# Executar o servidor
uvicorn main:app --reload
```
*O servidor iniciará em:* `http://127.0.0.1:8000`

---

### **2. Front-end (React + Vite)**

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
*A aplicação estará acessível em:* `http://localhost:5173`

---

© 2026 **CorrEnem** · Todos os direitos reservados.
