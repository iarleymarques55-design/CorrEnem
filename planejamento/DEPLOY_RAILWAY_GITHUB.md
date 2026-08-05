# 🚀 Guia Completo de Deploy: GitHub & Railway — CorrEnem

Este guia detalha o passo a passo completo e prático para publicar a plataforma **CorrEnem** (Front-end React, Back-end FastAPI modularizado e Banco de Dados PostgreSQL) no **Railway** e enviar o código-fonte para o **GitHub**.

---

## 📋 Sumário
1. [Passo 1: Subir o Projeto para o GitHub](#-passo-1-subir-o-projeto-para-o-github)
2. [Passo 2: Criar o Banco PostgreSQL no Railway](#-passo-2-criar-o-banco-postgresql-no-railway)
3. [Passo 3: Hospedar o Back-end (FastAPI Modular) no Railway](#-passo-3-hospedar-o-back-end-fastapi-modular-no-railway)
4. [Passo 4: Hospedar o Front-end (React + Vite)](#-passo-4-hospedar-o-front-end-react--vite)
5. [Passo 5: Conectar Front-end e Back-end (CORS & Endpoints)](#-passo-5-conectar-front-end-e-back-end-cors--endpoints)
6. [Checklist Final de Verificação](#-checklist-final-de-verificação)

---

## 🐙 Passo 1: Subir o Projeto para o GitHub

### **1.1 Verificar o `.gitignore`**
Garante que arquivos sensíveis (`.env`), ambientes virtuais (`venv`), arquivos compilados (`__pycache__`) e dependências do Node (`node_modules`) **NÃO** sejam enviados publicamente.

O arquivo `.gitignore` na raiz do projeto deve conter:
```gitignore
# Ambientes Virtuais Python
backend/venv/
venv/
*.pyc
__pycache__/

# Node / Frontend
frontend/node_modules/
frontend/dist/
node_modules/
dist/

# Variáveis de Ambiente e Segredos
*.env
.env
*.env.local

# IDEs e Sistema Operacional
.vscode/
.idea/
.DS_Store
```

### **1.2 Executar os Comandos Git no Terminal**
Abra o terminal PowerShell ou Prompt de Comando na pasta raiz do projeto (`c:\Users\iarle\Documentos\PORTFÓLIO\CORRENEM`) e execute:

```bash
# 1. Inicializar o Git (caso ainda não esteja inicializado)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Criar o commit de atualização
git commit -m "feat: arquitetura modular do backend e documentação de deploy atualizada"

# 4. Garantir a branch principal como main
git branch -M main

# 5. Conectar ao repositório no GitHub (substitua pelo seu repositório)
git remote add origin https://github.com/SEU_USUARIO/correnem.git

# 6. Enviar as alterações para o GitHub
git push -u origin main
```

---

## 🐘 Passo 2: Criar o Banco PostgreSQL no Railway

1. Acesse [railway.app](https://railway.app) e faça login com sua conta do GitHub.
2. Clique em **"New Project"**.
3. Selecione **"Provision PostgreSQL"**.
4. O Railway criará a instância de banco relacional instantaneamente.
5. Clique na caixa do **PostgreSQL** criada, vá na aba **"Variables"** ou **"Connect"** e copie a variável `DATABASE_URL` (ou `POSTGRES_URL`).
   Exemplo: `postgresql://postgres:senha@host.railway.app:port/railway`

---

## ⚙️ Passo 3: Hospedar o Back-end (FastAPI Modular) no Railway

### **3.1 Arquitetura Modular do Back-end**
O backend do CorrEnem é estruturado de forma modular e escalável:
```
backend/
├── Procfile                   # Instrução de inicialização para servidores ASGI (Uvicorn)
├── database.py                # Session local e mapeamento de modelos ORM
├── main.py                    # Aplicação principal FastAPI (montagem de routers)
├── auth.py                    # Wrapper retrocompatível
├── routers/                   # Módulos de Rotas (auth, correcao, historico, manuscrito, temas)
└── services/                  # Serviços de IA (Groq), fallbacks e imagens (Unsplash)
```

### **3.2 Criar o Serviço do Back-end**
1. No seu projeto do Railway, clique no botão **"+ New"** -> **"GitHub Repo"**.
2. Selecione o repositório `correnem`.
3. Clique no serviço do backend e vá na aba **"Settings"**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` (ou utilizar o `Procfile` automático)

### **3.3 Configurar as Variáveis de Ambiente no Railway**
Vá na aba **"Variables"** do serviço do Back-end e adicione:

| Nome da Variável | Valor Recomendado / Descrição |
| :--- | :--- |
| `DATABASE_URL` | Cole a `DATABASE_URL` gerada pelo PostgreSQL no Passo 2 |
| `GROQ_API_KEY` | Sua chave oficial da API Groq (`gsk_...`) |
| `BREVO_API_KEY` | Sua chave de API gerada no painel do Brevo (`xkeysib-...`) |
| `BREVO_REMETENTE_EMAIL` | Seu e-mail verificado como remetente no Brevo |
| `BREVO_REMETENTE_NOME` | Nome de exibição padrão do e-mail (ex: `CorrEnem`) |
| `ALLOWED_ORIGINS` | `https://seu-frontend.vercel.app,http://localhost:5173` |
| `ENVIRONMENT` | `production` |

### **3.4 Gerar o Domínio Público do Back-end**
1. Na aba **"Settings"** do serviço de Back-end, role até **"Networking"**.
2. Clique em **"Generate Domain"**.
3. Guarde a URL gerada (ex: `https://backend-production-xxxx.up.railway.app`).

---

## 🎨 Passo 4: Hospedar o Front-end (React + Vite)

### **Opção A: Hospedar no Vercel (Recomendado & Gratuito)**
1. Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
2. Clique em **"Add New..."** -> **"Project"**.
3. Importe o repositório `correnem`.
4. Em **Framework Preset**, selecione **Vite**.
5. Em **Root Directory**, selecione `frontend`.
6. Na seção **Environment Variables**, adicione:
   - Nome: `VITE_API_URL`
   - Valor: `https://backend-production-xxxx.up.railway.app` *(URL gerada no Passo 3.4)*
7. Clique em **"Deploy"**.

---

### **Opção B: Hospedar no Railway**
1. No Railway, clique em **"+ New"** -> **"GitHub Repo"** -> selecione `correnem`.
2. Em **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
3. Em **Variables**:
   - `VITE_API_URL` = `https://backend-production-xxxx.up.railway.app`
4. Em **Settings** -> **Networking**, clique em **"Generate Domain"**.

---

## 🔌 Passo 5: Conectar Front-end e Back-end (CORS & Endpoints)

1. No arquivo `frontend/src/config/api.js`, o sistema já utiliza a variável configurada:
```javascript
export const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
```
2. No serviço do **Back-end no Railway**, certifique-se de preencher a variável `ALLOWED_ORIGINS` com a URL do Front-end publicado (ex: `https://correnem.vercel.app`).

---

## ✅ Checklist Final de Verificação

- [x] Repositório enviado e atualizado no GitHub (`git push -u origin main`).
- [x] Instância do PostgreSQL em execução no Railway.
- [x] Serviço `backend` configurado no Railway com `Root Directory: backend` e arquivo `Procfile`.
- [x] Variáveis de ambiente configuradas no Railway (`DATABASE_URL`, `GROQ_API_KEY`, etc.).
- [x] Domínio público do Back-end gerado (`https://...up.railway.app`).
- [x] Front-end hospedado no Vercel ou Railway apontando para a `VITE_API_URL` de produção.
- [x] Cadastro de usuários, envio de e-mail SMTP, login, IA (Llama 3.3 70B & Llama 4 Scout) e salvamento no PostgreSQL testados em ambiente de produção.
