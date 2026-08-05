# 🚀 Guia Definitivo: Arquitetura de Hospedagem e Solução de E-mail (CORRENEM)

Este documento explica em detalhes o motivo pelo qual o Railway bloqueia envios de e-mail tradicionais (SMTP) e como estruturar a hospedagem ideal para a plataforma **CORRENEM** utilizando **Supabase**, **Railway/Render** e **Vercel**, além da solução definitiva de envio de e-mails por HTTP API (Porta 443).

---

## ❓ 1. Por que o Railway Bloqueia o Envio de E-mails via SMTP?

A maioria dos provedores de nuvem (Railway, Render, AWS, Heroku, DigitalOcean) **bloqueia conexões de saída nas portas SMTP padrão (25, 587 e 465)**.

* **O Motivo**: Proteger os servidores contra abusos de SPAM e inclusão em listas negras (*blacklists*).
* **O Sintoma**: Quando seu backend tenta conectar ao `smtp.gmail.com` na porta `587`, a requisição sofre *Timeout* (estoura o tempo limite) ou retorna erro de conexão recusada (`Errno 101`).

---

## 🏗️ 2. Supabase vs Railway vs Vercel: Como dividir a hospedagem?

### É possível hospedar o backend Python (FastAPI) no Supabase?
**Não diretamente.** O Supabase é um **BaaS (Backend-as-a-Service)** focado em Banco de Dados PostgreSQL, Autenticação e Storage. Ele não executa contêineres Python/FastAPI tradicionais.

### 🎯 Arquitetura Recomendada (100% Gratuita e Alta Performance)

| Componente | Tecnologia | Onde Hospedar Recomendado | Por que usar esta opção? |
| :--- | :--- | :--- | :--- |
| **Banco de Dados** | PostgreSQL | **Supabase** | Oferece um banco PostgreSQL gerenciado robusto, gratuito, sem hibernação de dados e com painel administrativo excelente. |
| **Backend (API)** | FastAPI (Python) | **Railway** ou **Render** | Executa contêineres Docker / Python com deploys automáticos via GitHub. |
| **Frontend (UI)** | React (Vite) | **Vercel** ou **Railway** | Vercel oferece CDN global ultra-rápida e SSL automático gratuito para SPA (React). |
| **Envio de E-mail** | HTTP API (Resend) | **Resend** (via Porta 443) | **Nunca é bloqueado**, pois utiliza requisições HTTPS normais na porta 443. |

---

## ✉️ 3. A Solução Definitiva para E-mails na Nuvem (Resend HTTP API)

Em vez de usar portas SMTP bloqueadas, utilizamos a **API HTTP da Resend** (ou Brevo) enviando requisições REST pela porta **443 (HTTPS)**. A porta 443 é **100% liberada** no Railway e em qualquer provedor de nuvem.

* **Gratuito**: Até **3.000 e-mails/mês** no plano grátis do Resend.
* **Sem bloqueios**: Funciona instantaneamente no Railway e Vercel.

---

## 📋 4. Passo a Passo Completo de Configuração

### ⚠️ ATENÇÃO: O Resend envia para qualquer pessoa?

* **Usando o e-mail de teste (`onboarding@resend.dev`)**: O Resend só permite enviar e-mails para o **seu próprio e-mail cadastrado na conta do Resend**. Se tentar enviar para outra pessoa usando o remetente padrão de testes, ele retorna o erro `403 Forbidden`.
* **Para enviar para QUALQUER PESSOA no Resend**: Você precisa adicionar seu domínio próprio (ex: `correnem.com`) em **Domains > Add Domain** no painel do Resend e adicionar 3 registros no seu DNS (Registro.br, Cloudflare, Hostinger, etc).

---

### 🎁 E se você NÃO tem um domínio próprio pago ainda? Use o Brevo!

Se você ainda não comprou um domínio (ex: `.com` ou `.com.br`), use o **Brevo (antigo Sendinblue)**!

1. Crie uma conta grátis em [brevo.com](https://brevo.com).
2. Valide o seu e-mail comum (ex: `seu-email@gmail.com`) como remetente autorizado.
3. Gere uma **API Key** na aba **SMTP & API > API Keys**.
4. O Brevo envia até **300 e-mails por dia para QUALQUER pessoa** via API HTTP (Porta 443) sem exigir domínio comprado!
5. Adicione no seu `.env`:
   ```env
   BREVO_API_KEY=xkeysib-123456...
   ```

---

### Passo 2: Configurar o Banco de Dados no Supabase (5 minutos)
1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito.
2. Defina a senha do seu banco de dados PostgreSQL.
3. No painel do Supabase, vá em **Project Settings > Database** e copie a **Connection String (URI)** no formato Transaction / Direct.
   Exemplo:
   ```env
   DATABASE_URL=postgresql://postgres.xxxx:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
4. Atualize a variável `DATABASE_URL` no seu backend FastAPI.

---

### Passo 3: Garantir que o Backend FastAPI Use a HTTP API na Porta 443

No arquivo `backend/routers/auth.py`, a função de envio de e-mail utiliza a HTTP API do Resend antes do fallback SMTP:

```python
import os
import json
import urllib.request

def _enviar_email_verificacao(email_destino: str, nome: str, codigo: str) -> bool:
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()

    # Se a chave do Resend estiver configurada, envia via HTTPS (Porta 443 - Liberada no Railway)
    if resend_api_key:
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": "CorrEnem <onboarding@resend.dev>", # Ou seu domínio próprio verificado
                "to": [email_destino],
                "subject": "✉️ Confirme seu e-mail — CORRENEM",
                "html": html_body
            }
            req = urllib.request.Request(
                url, 
                data=json.dumps(payload).encode('utf-8'), 
                headers=headers, 
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    print(f"[AUTH] E-mail enviado com sucesso via Resend HTTP API para {email_destino}")
                    return True
        except Exception as err:
            print(f"[AUTH] Erro ao enviar via Resend API: {err}")

    # Fallback caso a chave não esteja definida
    return False
```

---

### Passo 4: Publicando o Backend no Railway

1. No Railway, clique em **New Project > Deploy from GitHub repo**.
2. Selecione a pasta `/backend`.
3. Adicione as **Variables** na aba de configurações do Railway:
   - `DATABASE_URL` = `postgresql://...` (sua URL do Supabase)
   - `RESEND_API_KEY` = `re_...` (sua chave do Resend)
   - `GROQ_API_KEY` = `gsk_...`
   - `SHOW_CONSOLE_CODES` = `false`
   - `ENVIRONMENT` = `production`
4. O Railway gerará uma URL pública para seu backend (ex: `https://correnem-backend.up.railway.app`).

---

### Passo 5: Publicando o Frontend no Vercel ou Railway

1. Conecte o repositório do frontend.
2. Adicione as **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://correnem-backend.up.railway.app`
   - `VITE_GOOGLE_CLIENT_ID` = `seu_google_client_id`
3. Faça o deploy.

---

## 🎯 Resumo da Solução

* **Onde fica o Banco?** No **Supabase** (PostgreSQL Gratuito e sem bloqueios).
* **Onde fica o Backend?** No **Railway** (FastAPI).
* **Onde fica o Frontend?** Na **Vercel** ou **Railway** (React).
* **Como os E-mails funcionam sem travar?** Usando a **Resend HTTP API** na porta **443 (HTTPS)**. Isso elimina **100% dos bloqueios de SMTP** no Railway.
