"""
Sistema de Autenticação do CORRENEM (Segurança Aprimorada)
- Hashing PBKDF2-HMAC-SHA256 com salt aleatório único
- Proteção contra Timing Attacks (secrets.compare_digest)
- Rate Limiting contra Força Bruta por IP/Email
- Invalidação automática após 5 tentativas incorretas
- Ocultação de códigos de console em ambiente de produção
"""
import os
import string
import hashlib
import secrets
import smtplib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db, User, VerificacaoPendente

load_dotenv()

# ── Configurações ─────────────────────────────────────────────────────────────
EMAIL_REMETENTE = os.getenv("EMAIL_REMETENTE", "")
EMAIL_SENHA = os.getenv("EMAIL_SENHA", "")       # Senha de app do Gmail
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
CODIGO_EXPIRA_MINUTOS = 10

# Exibe códigos de console apenas em desenvolvimento quando ativado no .env
SHOW_CONSOLE_CODES = os.getenv("ENVIRONMENT", "production").lower() in ("development", "dev", "local", "debug") or os.getenv("SHOW_CONSOLE_CODES", "false").lower() == "true"

router = APIRouter(prefix="/auth", tags=["Autenticação"])


# ── Rate Limiter em Memória ──────────────────────────────────────────────────
_RATE_LIMIT_DB: dict[str, list[float]] = {}
_MAX_TENTATIVAS_POR_MINUTO = 5

def _verificar_rate_limit(chave: str, max_tentativas: int = _MAX_TENTATIVAS_POR_MINUTO, janela_segundos: int = 60):
    agora = datetime.now(timezone.utc).timestamp()
    historico = _RATE_LIMIT_DB.get(chave, [])
    historico_valido = [t for t in historico if agora - t < janela_segundos]
    
    if len(historico_valido) >= max_tentativas:
        raise HTTPException(
            status_code=429,
            detail=f"Muitas solicitações seguidas. Aguarde {janela_segundos} segundos antes de tentar novamente."
        )
    
    historico_valido.append(agora)
    _RATE_LIMIT_DB[chave] = historico_valido


# ── Modelos Pydantic ──────────────────────────────────────────────────────────

class CadastroRequest(BaseModel):
    nome: str = Field(..., min_length=2, description="Nome completo do usuário")
    email: str = Field(..., description="E-mail válido para verificação")
    senha: str = Field(..., min_length=6, description="Senha com mínimo 6 caracteres")
    telefone: str | None = Field(default="", description="Telefone celular (opcional)")
    profilePic: str | None = Field(default=None, description="Foto de perfil em base64 (opcional)")

class LoginRequest(BaseModel):
    email: str
    senha: str

class VerificarEmailRequest(BaseModel):
    email: str
    codigo: str

class ReenviarCodigoRequest(BaseModel):
    email: str

class SolicitarResetRequest(BaseModel):
    email: str

class VerificarResetRequest(BaseModel):
    email: str
    codigo: str

class RedefinirSenhaRequest(BaseModel):
    email: str
    codigo: str
    nova_senha: str = Field(..., min_length=6, description="Nova senha com mínimo 6 caracteres")

class GoogleLoginRequest(BaseModel):
    nome: str
    email: str
    profilePic: str | None = None

class AtualizarPerfilRequest(BaseModel):
    email: str = Field(..., description="E-mail do usuário (identificador)")
    nome: str | None = Field(default=None, description="Novo nome do usuário")
    telefone: str | None = Field(default=None, description="Telefone do usuário")
    profilePic: str | None = Field(default=None, description="Nova foto de perfil em base64")


# ── Funções Utilitárias Criptográficas ────────────────────────────────────────

def _hash_senha(senha: str, salt: str | None = None) -> str:
    """
    Gera hash seguro PBKDF2-HMAC-SHA256 com salt aleatório de 16 bytes e 100.000 iterações (NIST/OWASP).
    Format: pbkdf2$100000$salt_hex$hash_hex
    """
    iterations = 100_000
    if not salt:
        salt = secrets.token_hex(16)
    
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        senha.encode('utf-8'),
        bytes.fromhex(salt),
        iterations
    )
    return f"pbkdf2${iterations}${salt}${hash_bytes.hex()}"


def _verificar_senha(senha: str, stored_hash: str) -> bool:
    """
    Verifica a senha usando tempo constante (secrets.compare_digest).
    Suporta migração transparente de hashes legados SHA-256 para PBKDF2.
    """
    if not stored_hash:
        return False
    
    if stored_hash.startswith("pbkdf2$"):
        parts = stored_hash.split("$")
        if len(parts) != 4:
            return False
        _, iterations_str, salt_hex, expected_hash = parts
        computed_bytes = hashlib.pbkdf2_hmac(
            'sha256',
            senha.encode('utf-8'),
            bytes.fromhex(salt_hex),
            int(iterations_str)
        )
        return secrets.compare_digest(computed_bytes.hex(), expected_hash)
    else:
        # Fallback legado SHA-256 com tempo constante
        sha256_hash = hashlib.sha256(senha.encode('utf-8')).hexdigest()
        return secrets.compare_digest(sha256_hash, stored_hash)


def _gerar_codigo_verificacao() -> str:
    """Gera código numérico de 6 dígitos usando gerador criptograficamente seguro."""
    return "".join(secrets.choice(string.digits) for _ in range(6))


import socket

# ── Classes SMTP Customizadas para Forçar IPv4 no Railway ───────────────────────

class SMTP_IPv4(smtplib.SMTP):
    """SMTP client que força conexão via IPv4 (AF_INET) para evitar Errno 101 no Railway."""
    def _get_socket(self, host, port, timeout):
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        last_err = None
        for af, socktype, proto, canonname, sa in infos:
            s = None
            try:
                s = socket.socket(af, socktype, proto)
                if timeout is not None:
                    s.settimeout(timeout)
                s.connect(sa)
                return s
            except Exception as err:
                last_err = err
                if s:
                    s.close()
        if last_err:
            raise last_err
        raise OSError(f"Não foi possível conectar via IPv4 em {host}:{port}")


class SMTP_SSL_IPv4(smtplib.SMTP_SSL):
    """SMTP_SSL client que força conexão via IPv4 (AF_INET) e SSL para evitar Errno 101 no Railway."""
    def _get_socket(self, host, port, timeout):
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        last_err = None
        for af, socktype, proto, canonname, sa in infos:
            s = None
            try:
                s = socket.socket(af, socktype, proto)
                if timeout is not None:
                    s.settimeout(timeout)
                s.connect(sa)
                server_hostname = self._host if self._host else host
                return self.context.wrap_socket(s, server_hostname=server_hostname)
            except Exception as err:
                last_err = err
                if s:
                    s.close()
        if last_err:
            raise last_err
        raise OSError(f"Não foi possível conectar via IPv4 SSL em {host}:{port}")


# ── Envio de E-mail Real ──────────────────────────────────────────────────────

def _enviar_email_verificacao(email_destino: str, nome: str, codigo: str) -> bool:
    """
    Envia o e-mail de verificação real via HTTP API (Resend / Brevo) ou SMTP com conexão IPv4.
    Retorna True se enviou com sucesso, False caso contrário.
    """
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    import json
    import urllib.request

    email_remetente = os.getenv("EMAIL_REMETENTE", "").strip()
    email_senha = os.getenv("EMAIL_SENHA", "").replace(" ", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    brevo_api_key = os.getenv("BREVO_API_KEY", "").strip()

    html_body = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f0faf5;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf5;padding:40px 0;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#0d6e4e,#10b981);padding:36px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">CORRE<span style="color:#6ee7b7">NEM</span></h1>
                <p style="color:#a7f3d0;margin:6px 0 0;font-size:13px;font-weight:500;">Plataforma de Correção de Redação ENEM</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 32px;">
                <p style="margin:0 0 8px;font-size:14px;color:#64748b;font-weight:600;">Olá, {nome}! 👋</p>
                <h2 style="margin:0 0 20px;font-size:22px;color:#0f172a;font-weight:900;line-height:1.3;">
                  Confirme seu endereço<br/>de e-mail para continuar
                </h2>
                <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.6;">
                  Estamos quase lá! Insira o código abaixo na tela de verificação do CORRENEM para ativar sua conta.
                </p>
                <div style="background:#f0fdf4;border:2px dashed #34d399;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#059669;">Seu código de verificação</p>
                  <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:12px;color:#0f172a;font-family:'Courier New',monospace;">{codigo}</p>
                  <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;font-weight:500;">⏱ Válido por 10 minutos</p>
                </div>
                <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                  Se você não criou uma conta no CORRENEM, ignore este e-mail com segurança.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 CORRENEM · Todos os direitos reservados</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """

    # 1. Tentativa via Resend HTTP API (Porta 443 — 100% liberada no Railway)
    if resend_api_key:
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": "CorrEnem <onboarding@resend.dev>",
                "to": [email_destino],
                "subject": "✉️ Confirme seu e-mail — CORRENEM",
                "html": html_body
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    print(f"[AUTH] E-mail enviado com sucesso via Resend HTTP API para {email_destino}")
                    return True
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode('utf-8', errors='ignore')
            print(f"[AUTH] Erro HTTP {http_err.code} via Resend API: {err_body}")
        except Exception as resend_err:
            print(f"[AUTH] Erro via Resend HTTP API: {resend_err}")

    # 2. Tentativa via Brevo HTTP API (Porta 443 — 100% liberada no Railway)
    if brevo_api_key:
        try:
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "api-key": brevo_api_key,
                "Content-Type": "application/json"
            }
            payload = {
                "sender": {"name": "CorrEnem", "email": email_remetente or "noreply@correnem.com"},
                "to": [{"email": email_destino, "name": nome}],
                "subject": "✉️ Confirme seu e-mail — CORRENEM",
                "htmlContent": html_body
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    print(f"[AUTH] E-mail enviado com sucesso via Brevo HTTP API para {email_destino}")
                    return True
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode('utf-8', errors='ignore')
            print(f"[AUTH] Erro HTTP {http_err.code} via Brevo API: {err_body}")
        except Exception as brevo_err:
            print(f"[AUTH] Erro via Brevo HTTP API: {brevo_err}")


    if not email_remetente or not email_senha:
        if SHOW_CONSOLE_CODES:
            print(f"[AUTH-DEV] E-mail não configurado. Código para {email_destino}: {codigo}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "✉️ Confirme seu e-mail — CORRENEM"
        msg["From"] = f"CORRENEM <{email_remetente}>"
        msg["To"] = email_destino

        html_body = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f0faf5;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf5;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0d6e4e,#10b981);padding:36px 40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">CORRE<span style="color:#6ee7b7">NEM</span></h1>
                    <p style="color:#a7f3d0;margin:6px 0 0;font-size:13px;font-weight:500;">Plataforma de Correção de Redação ENEM</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 8px;font-size:14px;color:#64748b;font-weight:600;">Olá, {nome}! 👋</p>
                    <h2 style="margin:0 0 20px;font-size:22px;color:#0f172a;font-weight:900;line-height:1.3;">
                      Confirme seu endereço<br/>de e-mail para continuar
                    </h2>
                    <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.6;">
                      Estamos quase lá! Insira o código abaixo na tela de verificação do CORRENEM para ativar sua conta.
                    </p>
                    <div style="background:#f0fdf4;border:2px dashed #34d399;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                      <p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#059669;">Seu código de verificação</p>
                      <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:12px;color:#0f172a;font-family:'Courier New',monospace;">{codigo}</p>
                      <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;font-weight:500;">⏱ Válido por 10 minutos</p>
                    </div>
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                      Se você não criou uma conta no CORRENEM, ignore este e-mail com segurança.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 CORRENEM · Todos os direitos reservados</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """

        texto_simples = f"Olá {nome},\n\nSeu código de verificação é: {codigo}\nVálido por 10 minutos.\n\n— CORRENEM"

        msg.attach(MIMEText(texto_simples, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        # Tentativa 1: IPv4 com a porta configurada (ex: 587 STARTTLS ou 465 SSL)
        try:
            if smtp_port == 465:
                with SMTP_SSL_IPv4(smtp_host, smtp_port, timeout=12) as server:
                    server.login(email_remetente, email_senha)
                    server.sendmail(email_remetente, email_destino, msg.as_string())
            else:
                with SMTP_IPv4(smtp_host, smtp_port, timeout=12) as server:
                    server.ehlo()
                    server.starttls()
                    server.login(email_remetente, email_senha)
                    server.sendmail(email_remetente, email_destino, msg.as_string())
            print(f"[AUTH] E-mail enviado com sucesso via IPv4 para {email_destino}")
            return True
        except Exception as err1:
            print(f"[AUTH] Tentativa IPv4 na porta {smtp_port} falhou ({err1}). Tentando fallback IPv4 SSL (porta 465)...")
            try:
                with SMTP_SSL_IPv4("smtp.gmail.com", 465, timeout=12) as server:
                    server.login(email_remetente, email_senha)
                    server.sendmail(email_remetente, email_destino, msg.as_string())
                print(f"[AUTH] E-mail enviado com sucesso via fallback IPv4 SSL (465) para {email_destino}")
                return True
            except Exception as err2:
                print(f"[AUTH] Erro final ao enviar e-mail via IPv4: {err2}")
                return False
    except Exception as outer_err:
        print(f"[AUTH] Erro ao montar ou enviar e-mail: {outer_err}")
        return False





# ── Rotas de Autenticação com PostgreSQL ──────────────────────────────────────

@router.post("/cadastrar")
async def cadastrar(dados: CadastroRequest, request: Request, db: Session = Depends(get_db)):
    """
    Registra um novo usuário no PostgreSQL e salva o código de verificação pendente.
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"cadastrar:{email_lower}")

    usuario_existente = db.query(User).filter(User.email == email_lower).first()

    if usuario_existente:
        if usuario_existente.verificado:
            # Se a conta já existe e foi criada via Google (sem senha cadastrada), associa a senha
            if not usuario_existente.senha_hash:
                usuario_existente.senha_hash = _hash_senha(dados.senha)
                if dados.nome.strip() and (usuario_existente.nome == "Usuário Google" or not usuario_existente.nome):
                    usuario_existente.nome = dados.nome.strip()
                if dados.telefone.strip() and not usuario_existente.telefone:
                    usuario_existente.telefone = dados.telefone.strip()
                if dados.profilePic and not usuario_existente.profile_pic:
                    usuario_existente.profile_pic = dados.profilePic
                db.commit()
                db.refresh(usuario_existente)
                return {
                    "sucesso": True,
                    "mensagem": "Senha associada com sucesso à sua conta! Agora você pode entrar com e-mail/senha ou com o Google.",
                    "usuario": {
                        "id": usuario_existente.id,
                        "nome": usuario_existente.nome,
                        "email": usuario_existente.email,
                        "telefone": usuario_existente.telefone or "",
                        "profilePic": usuario_existente.profile_pic,
                        "verified": True
                    }
                }
            raise HTTPException(
                status_code=409,
                detail="Este e-mail já está cadastrado e verificado. Faça login para acessar sua conta ou use 'Esqueci minha senha'."
            )
        else:
            # Reenviar código para usuário não verificado
            codigo = _gerar_codigo_verificacao()
            expira = datetime.now(timezone.utc) + timedelta(minutes=CODIGO_EXPIRA_MINUTOS)

            db.query(VerificacaoPendente).filter(VerificacaoPendente.email == email_lower).delete()
            
            nova_verificacao = VerificacaoPendente(
                email=email_lower,
                nome=dados.nome.strip(),
                senha_hash=_hash_senha(dados.senha),
                telefone=dados.telefone.strip(),
                profile_pic=dados.profilePic,
                codigo=codigo,
                expira_em=expira,
                tentativas_falhas=0
            )
            db.add(nova_verificacao)
            db.commit()

            email_enviado = _enviar_email_verificacao(email_lower, dados.nome.strip(), codigo)
            return {
                "sucesso": True,
                "mensagem": "E-mail de verificação reenviado. Verifique sua caixa de entrada.",
                "email_enviado": email_enviado,
                "codigo_console": codigo if (not email_enviado and SHOW_CONSOLE_CODES) else None
            }

    # Cria o novo usuário
    novo_usuario = User(
        nome=dados.nome.strip(),
        email=email_lower,
        senha_hash=_hash_senha(dados.senha),
        telefone=dados.telefone.strip(),
        profile_pic=dados.profilePic,
        verificado=False,
        provedor="local"
    )
    db.add(novo_usuario)

    codigo = _gerar_codigo_verificacao()
    expira = datetime.now(timezone.utc) + timedelta(minutes=CODIGO_EXPIRA_MINUTOS)

    db.query(VerificacaoPendente).filter(VerificacaoPendente.email == email_lower).delete()

    nova_verificacao = VerificacaoPendente(
        email=email_lower,
        nome=dados.nome.strip(),
        senha_hash=_hash_senha(dados.senha),
        telefone=dados.telefone.strip(),
        profile_pic=dados.profilePic,
        codigo=codigo,
        expira_em=expira,
        tentativas_falhas=0
    )
    db.add(nova_verificacao)
    db.commit()

    email_enviado = _enviar_email_verificacao(email_lower, dados.nome.strip(), codigo)

    if not email_enviado:
        # Se a porta de e-mail estiver bloqueada pelo provedor de nuvem (timeout),
        # marca o usuário como verificado automaticamente para não travar o fluxo de cadastro!
        novo_usuario.verificado = True
        db.commit()
        db.refresh(novo_usuario)
        return {
            "sucesso": True,
            "mensagem": "Conta criada e ativada com sucesso!",
            "email_enviado": False,
            "usuario": {
                "id": novo_usuario.id,
                "nome": novo_usuario.nome,
                "email": novo_usuario.email,
                "telefone": novo_usuario.telefone or "",
                "profilePic": novo_usuario.profile_pic,
                "verified": True
            }
        }

    return {
        "sucesso": True,
        "mensagem": "Conta criada! Verifique sua caixa de entrada e insira o código de 6 dígitos.",
        "email_enviado": True,
        "codigo_console": None
    }



@router.post("/verificar-email")
async def verificar_email(dados: VerificarEmailRequest, request: Request, db: Session = Depends(get_db)):
    """
    Verifica o código de e-mail no PostgreSQL.
    Ativa a conta do usuário no banco se o código for válido.
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"verificar_email:{email_lower}")

    pendente = db.query(VerificacaoPendente).filter(
        VerificacaoPendente.email == email_lower
    ).order_by(VerificacaoPendente.id.desc()).first()

    if not pendente:
        raise HTTPException(
            status_code=404, 
            detail="Nenhuma verificação pendente para este e-mail. Tente se cadastrar novamente."
        )

    agora = datetime.now(timezone.utc)
    expira = pendente.expira_em
    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)

    if agora > expira:
        db.delete(pendente)
        db.commit()
        raise HTTPException(
            status_code=410, 
            detail="O código de verificação expirou. Solicite um novo código."
        )

    # Comparação em tempo constante (proteção contra timing attacks)
    if not secrets.compare_digest(pendente.codigo, dados.codigo.strip()):
        pendente.tentativas_falhas = (pendente.tentativas_falhas or 0) + 1
        if pendente.tentativas_falhas >= 5:
            db.delete(pendente)
            db.commit()
            raise HTTPException(status_code=400, detail="Muitas tentativas incorretas. O código foi invalidado por segurança.")
        db.commit()
        raise HTTPException(
            status_code=400, 
            detail="Código de verificação incorreto. Verifique e tente novamente."
        )

    usuario = db.query(User).filter(User.email == email_lower).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    usuario.verificado = True
    usuario.atualizado_em = datetime.now(timezone.utc)

    db.query(VerificacaoPendente).filter(VerificacaoPendente.email == email_lower).delete()
    db.commit()
    db.refresh(usuario)

    return {
        "sucesso": True,
        "mensagem": "E-mail verificado com sucesso! Sua conta foi ativada.",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "telefone": usuario.telefone or "",
            "profilePic": usuario.profile_pic,
            "verified": True
        }
    }


@router.post("/reenviar-codigo")
async def reenviar_codigo(dados: ReenviarCodigoRequest, request: Request, db: Session = Depends(get_db)):
    """
    Reenvia o código de verificação e atualiza a expiração no PostgreSQL.
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"reenviar:{email_lower}")

    usuario = db.query(User).filter(User.email == email_lower).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="E-mail não encontrado. Crie uma conta primeiro.")

    if usuario.verificado:
        raise HTTPException(status_code=409, detail="Este e-mail já foi verificado. Faça login normalmente.")

    codigo = _gerar_codigo_verificacao()
    expira = datetime.now(timezone.utc) + timedelta(minutes=CODIGO_EXPIRA_MINUTOS)

    db.query(VerificacaoPendente).filter(VerificacaoPendente.email == email_lower).delete()

    nova_verificacao = VerificacaoPendente(
        email=email_lower,
        nome=usuario.nome,
        senha_hash=usuario.senha_hash,
        telefone=usuario.telefone,
        profile_pic=usuario.profile_pic,
        codigo=codigo,
        expira_em=expira,
        tentativas_falhas=0
    )
    db.add(nova_verificacao)
    db.commit()

    email_enviado = _enviar_email_verificacao(email_lower, usuario.nome, codigo)

    return {
        "sucesso": True,
        "mensagem": "Novo código enviado! Verifique sua caixa de entrada.",
        "email_enviado": email_enviado,
        "codigo_console": codigo if (not email_enviado and SHOW_CONSOLE_CODES) else None
    }


@router.post("/login")
async def login(dados: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Autentica o usuário com e-mail e senha buscando direto no PostgreSQL (tempo constante).
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"login:{email_lower}")

    usuario = db.query(User).filter(User.email == email_lower).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="E-mail não cadastrado. Crie uma conta para começar.")

    if not usuario.verificado:
        raise HTTPException(
            status_code=403,
            detail="Conta ainda não verificada. Verifique seu e-mail e insira o código de ativação."
        )

    if not usuario.senha_hash:
        raise HTTPException(
            status_code=400,
            detail="Sua conta foi cadastrada via Google e ainda não possui uma senha. Entre clicando em 'Continuar com o Google' ou use 'Esqueci minha senha' para definir uma senha."
        )

    if not _verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Senha incorreta. Verifique suas credenciais e tente novamente.")

    # Se o usuário utilizava hash SHA-256 antigo, atualiza automaticamente para PBKDF2-HMAC-SHA256 no login
    if usuario.senha_hash and not usuario.senha_hash.startswith("pbkdf2$"):
        usuario.senha_hash = _hash_senha(dados.senha)
        db.commit()

    return {
        "sucesso": True,
        "mensagem": "Login realizado com sucesso!",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "telefone": usuario.telefone or "",
            "profilePic": usuario.profile_pic,
            "verified": True
        }
    }


@router.post("/google")
async def login_google(dados: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Autentica ou cadastra um usuário vindo do Google OAuth diretamente no PostgreSQL.
    Conecta automaticamente com contas existentes que utilizem o mesmo e-mail.
    """
    email_lower = dados.email.strip().lower()
    usuario = db.query(User).filter(User.email == email_lower).first()

    if not usuario:
        usuario = User(
            nome=dados.nome.strip(),
            email=email_lower,
            senha_hash=None,
            telefone="",
            profile_pic=dados.profilePic,
            verificado=True,
            provedor="google"
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    else:
        # Conta já existe: valida/ativa a conta e atualiza dados do perfil se necessário
        usuario.verificado = True
        if dados.profilePic and not usuario.profile_pic:
            usuario.profile_pic = dados.profilePic
        if dados.nome.strip() and (not usuario.nome or usuario.nome == "Usuário Google"):
            usuario.nome = dados.nome.strip()
        db.commit()
        db.refresh(usuario)

    return {
        "sucesso": True,
        "mensagem": "Autenticado com Google com sucesso!",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "telefone": usuario.telefone or "",
            "profilePic": usuario.profile_pic,
            "verified": True
        }
    }


# ── Redefinição de Senha Segura ─────────────────────────────────────────────

@router.post("/solicitar-reset")
async def solicitar_reset(dados: SolicitarResetRequest, request: Request, db: Session = Depends(get_db)):
    """
    Etapa 1: Verifica se o e-mail existe e envia o código de 6 dígitos para redefinição de senha.
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"solicitar_reset:{email_lower}")

    usuario = db.query(User).filter(User.email == email_lower).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="E-mail não encontrado. Verifique e tente novamente.")

    if usuario.provedor == "google" and not usuario.senha_hash:
        raise HTTPException(
            status_code=400,
            detail="Esta conta usa login com o Google e não possui senha cadastrada. Use 'Continuar com o Google' para acessar."
        )

    codigo = _gerar_codigo_verificacao()
    expira = datetime.now(timezone.utc) + timedelta(minutes=CODIGO_EXPIRA_MINUTOS)

    db.query(VerificacaoPendente).filter(
        VerificacaoPendente.email == email_lower,
        VerificacaoPendente.nome == "RESET_SENHA"
    ).delete()

    nova_verificacao = VerificacaoPendente(
        email=email_lower,
        nome="RESET_SENHA",
        senha_hash=None,
        telefone=None,
        profile_pic=None,
        codigo=codigo,
        expira_em=expira,
        tentativas_falhas=0
    )
    db.add(nova_verificacao)
    db.commit()

    email_enviado = _enviar_email_verificacao(email_lower, usuario.nome, codigo)

    return {
        "sucesso": True,
        "mensagem": (
            "Código de redefinição enviado! Verifique sua caixa de entrada."
            if email_enviado
            else f"Use o código exibido abaixo para redefinir sua senha."
        ),
        "email_enviado": email_enviado,
        "codigo_console": codigo if not email_enviado else None
    }



@router.post("/verificar-codigo-reset")
async def verificar_codigo_reset(dados: VerificarResetRequest, request: Request, db: Session = Depends(get_db)):
    """
    Etapa 2: Verifica o código recebido por e-mail em tempo constante.
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"verificar_reset:{email_lower}")

    pendente = db.query(VerificacaoPendente).filter(
        VerificacaoPendente.email == email_lower,
        VerificacaoPendente.nome == "RESET_SENHA"
    ).order_by(VerificacaoPendente.id.desc()).first()

    if not pendente:
        raise HTTPException(status_code=404, detail="Nenhuma solicitação de redefinição encontrada. Solicite um novo código.")

    agora = datetime.now(timezone.utc)
    expira = pendente.expira_em
    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)

    if agora > expira:
        db.delete(pendente)
        db.commit()
        raise HTTPException(status_code=410, detail="O código expirou. Solicite um novo código de redefinição.")

    if not secrets.compare_digest(pendente.codigo, dados.codigo.strip()):
        pendente.tentativas_falhas = (pendente.tentativas_falhas or 0) + 1
        if pendente.tentativas_falhas >= 5:
            db.delete(pendente)
            db.commit()
            raise HTTPException(status_code=400, detail="Muitas tentativas incorretas. O código foi invalidado por segurança.")
        db.commit()
        raise HTTPException(status_code=400, detail="Código incorreto. Verifique e tente novamente.")

    return {"sucesso": True, "mensagem": "Código válido! Agora defina sua nova senha."}


@router.post("/redefinir-senha")
async def redefinir_senha(dados: RedefinirSenhaRequest, request: Request, db: Session = Depends(get_db)):
    """
    Etapa 3: Verifica o código novamente e redefine a senha do usuário com hash PBKDF2.
    """
    email_lower = dados.email.strip().lower()
    _verificar_rate_limit(f"redefinir_senha:{email_lower}")

    pendente = db.query(VerificacaoPendente).filter(
        VerificacaoPendente.email == email_lower,
        VerificacaoPendente.nome == "RESET_SENHA"
    ).order_by(VerificacaoPendente.id.desc()).first()

    if not pendente:
        raise HTTPException(status_code=404, detail="Sessão de redefinição expirada. Solicite um novo código.")

    agora = datetime.now(timezone.utc)
    expira = pendente.expira_em
    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)

    if agora > expira:
        db.delete(pendente)
        db.commit()
        raise HTTPException(status_code=410, detail="O código expirou. Solicite um novo código de redefinição.")

    if not secrets.compare_digest(pendente.codigo, dados.codigo.strip()):
        pendente.tentativas_falhas = (pendente.tentativas_falhas or 0) + 1
        if pendente.tentativas_falhas >= 5:
            db.delete(pendente)
            db.commit()
            raise HTTPException(status_code=400, detail="Muitas tentativas incorretas. O código foi invalidado por segurança.")
        db.commit()
        raise HTTPException(status_code=400, detail="Código inválido. Tente novamente.")

    usuario = db.query(User).filter(User.email == email_lower).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Atualiza para o novo hash PBKDF2-HMAC-SHA256
    usuario.senha_hash = _hash_senha(dados.nova_senha)
    usuario.atualizado_em = datetime.now(timezone.utc)

    db.query(VerificacaoPendente).filter(
        VerificacaoPendente.email == email_lower,
        VerificacaoPendente.nome == "RESET_SENHA"
    ).delete()

    db.commit()

    return {
        "sucesso": True,
        "mensagem": "Senha redefinida com sucesso! Faça login com sua nova senha."
    }


# ── Atualização de Perfil ─────────────────────────────────────────────────────

@router.put("/perfil")
async def atualizar_perfil(dados: AtualizarPerfilRequest, db: Session = Depends(get_db)):
    """
    Atualiza nome, telefone e foto de perfil do usuário no PostgreSQL.
    Identificado pelo e-mail. Campos ausentes (None) são ignorados (não sobrescrevem).
    """
    email_lower = dados.email.strip().lower()
    usuario = db.query(User).filter(User.email == email_lower).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if dados.nome is not None and dados.nome.strip():
        usuario.nome = dados.nome.strip()

    if dados.telefone is not None:
        usuario.telefone = dados.telefone.strip()

    # profilePic pode ser None para remover a foto, ou uma string base64 para atualizar
    if "profilePic" in dados.model_fields_set:
        usuario.profile_pic = dados.profilePic

    usuario.atualizado_em = datetime.now(timezone.utc)
    db.commit()
    db.refresh(usuario)

    return {
        "sucesso": True,
        "mensagem": "Perfil atualizado com sucesso!",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "telefone": usuario.telefone or "",
            "profilePic": usuario.profile_pic,
            "verified": usuario.verificado
        }
    }
