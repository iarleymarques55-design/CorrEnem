/**
 * Componente AuthModal (Modal de Autenticação)
 * Gerencia os fluxos de Login, Cadastro com verificação de código enviado por e-mail,
 * e modal de aviso para o login com Google (exigindo configuração de API Key).
 */
import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Camera, ArrowRight, ShieldCheck, Eye, EyeOff, AlertTriangle, RefreshCw, CheckCircle2, KeyRound } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Chave local de fallback offline
const USERS_KEY = 'correnem_users_db';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function upsertUserLocal(userObj) {
  if (!userObj || !userObj.email) return userObj;
  const users = getUsers();
  const emailLower = userObj.email.trim().toLowerCase();
  const index = users.findIndex(u => u.email && u.email.trim().toLowerCase() === emailLower);
  if (index >= 0) {
    users[index] = { ...users[index], ...userObj, email: emailLower };
  } else {
    users.push({ ...userObj, email: emailLower });
  }
  saveUsers(users);
  return index >= 0 ? users[index] : userObj;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isValidPassword(senha) {
  return senha.trim().length >= 6;
}

// Converte erros de API (que podem ser objetos ou arrays do FastAPI 422) em strings seguras e amigáveis para o React
function parseErrorMessage(detail, fallback = 'Ocorreu um erro no servidor. Tente novamente.') {
  if (!detail) return fallback;
  if (typeof detail === 'string') {
    if (detail.includes('Input should be a valid string')) return 'Por favor, preencha os dados no formato correto e tente novamente.';
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map(item => {
      const msg = typeof item === 'object' ? item.msg || item.message || JSON.stringify(item) : String(item);
      if (typeof msg === 'string' && msg.includes('Input should be a valid string')) return 'Dados no formato incorreto.';
      return msg;
    }).join(' | ');
  }
  if (typeof detail === 'object') {
    const msg = detail.msg || detail.message || detail.detail || JSON.stringify(detail);
    if (typeof msg === 'string' && msg.includes('Input should be a valid string')) return 'Por favor, verifique os dados digitados.';
    return String(msg);
  }
  return String(detail);
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'email_verify' | 'reset_email' | 'reset_codigo' | 'reset_senha'

  // Form fields
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  // Verification fields
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  // Backend response feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [codigoConsole, setCodigoConsole] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de redefinição de senha
  const [resetEmail, setResetEmail] = useState('');
  const [resetCodigo, setResetCodigo] = useState('');
  const [resetNovaSenha, setResetNovaSenha] = useState('');
  const [resetConfirmaSenha, setResetConfirmaSenha] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Check se a variável GOOGLE_CLIENT_ID foi configurada
  const googleClientId = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '') : '';
  const isGoogleConfigured = !!googleClientId;

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEmailBlur = () => {
    if (email.trim() && !isValidEmail(email)) {
      setEmailError('E-mail inválido. Use o formato: exemplo@dominio.com');
    } else {
      setEmailError('');
    }
  };

  const handleSenhaBlur = () => {
    if (senha.trim() && !isValidPassword(senha)) {
      setSenhaError('A senha deve ter pelo menos 6 caracteres.');
    } else {
      setSenhaError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setCodigoConsole('');

    if (!isValidEmail(email)) {
      setEmailError('E-mail inválido. Use o formato: exemplo@dominio.com');
      return;
    }
    if (!isValidPassword(senha)) {
      setSenhaError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      // ─── CADASTRO ─────────────────────────────────────────────────────────
      if (!nome.trim()) {
        setErrorMsg('Por favor, preencha o seu nome completo.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/cadastrar`, {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          telefone: telefone.trim(),
          profilePic
        });

        if (response.data && response.data.sucesso) {
          setInfoMsg(response.data.mensagem || 'Conta criada! Verifique seu e-mail.');
          if (response.data.codigo_console) {
            setCodigoConsole(String(response.data.codigo_console));
          }
          setStep('email_verify');
        } else {
          setErrorMsg(parseErrorMessage(response.data?.mensagem, 'Erro ao criar conta. Tente novamente.'));
        }
      } catch (err) {
        console.warn('Erro na API Python de cadastro:', err);
        const detail = err.response?.data?.detail;
        if (detail) {
          setErrorMsg(parseErrorMessage(detail));
        } else {
          setErrorMsg('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // ─── LOGIN ─────────────────────────────────────────────────────────────
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: email.trim().toLowerCase(),
          senha
        });

        if (response.data && response.data.sucesso && response.data.usuario) {
          const saved = upsertUserLocal(response.data.usuario);
          onLoginSuccess(saved);
          resetForm();
          onClose();
        } else {
          setErrorMsg(parseErrorMessage(response.data?.mensagem, 'Erro ao realizar login. Verifique seus dados.'));
        }
      } catch (err) {
        console.warn('Erro na API Python de login:', err);
        const detail = err.response?.data?.detail;
        if (detail) {
          setErrorMsg(parseErrorMessage(detail));
        } else {
          setErrorMsg('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verificar-email`, {
        email: email.trim().toLowerCase(),
        codigo: emailCode.trim()
      });

      if (response.data && response.data.sucesso) {
        if (telefone.trim()) {
          setStep('phone_verify');
        } else {
          onLoginSuccess(response.data.usuario);
          resetForm();
          onClose();
        }
      } else {
        setErrorMsg(parseErrorMessage(response.data?.mensagem, 'Código incorreto. Tente novamente.'));
      }
    } catch (err) {
      console.warn('Erro na verificação de e-mail via API Python:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(parseErrorMessage(detail, 'Código de e-mail inválido ou expirado. Verifique e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reenviar-codigo`, {
        email: email.trim().toLowerCase()
      });
      if (response.data && response.data.sucesso) {
        setInfoMsg(response.data.mensagem || 'Código reenviado com sucesso!');
        if (response.data.codigo_console) {
          setCodigoConsole(String(response.data.codigo_console));
        }
      }
    } catch (err) {
      console.warn('Erro ao reenviar código:', err);
      setErrorMsg(parseErrorMessage(err.response?.data?.detail, 'Não foi possível reenviar o código no momento.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = (e) => {
    e.preventDefault();
    if (phoneCode === '5678' || phoneCode.length >= 4) {
      setErrorMsg('');
      const novoUsuario = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim(),
        profilePic: profilePic || null,
        verified: true,
      };
      const saved = upsertUserLocal(novoUsuario);

      onLoginSuccess(saved);
      resetForm();
      onClose();
    } else {
      setErrorMsg('Código de SMS inválido. Utilize o código de teste: 5678');
    }
  };

  // ─── REDEFINIÇÃO DE SENHA: HANDLERS ───────────────────────────────────────
  const handleSolicitarReset = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setCodigoConsole('');

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail || !isValidEmail(targetEmail)) {
      setErrorMsg('Por favor, digite um e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/solicitar-reset`, {
        email: targetEmail
      });

      if (response.data && response.data.sucesso) {
        setInfoMsg(response.data.mensagem || 'Código de redefinição enviado!');
        if (response.data.codigo_console) {
          setCodigoConsole(String(response.data.codigo_console));
        }
        setStep('reset_codigo');
      } else {
        setErrorMsg(parseErrorMessage(response.data?.mensagem, 'Erro ao solicitar redefinição de senha.'));
      }
    } catch (err) {
      console.warn('Erro ao solicitar redefinição via API Python:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(parseErrorMessage(detail, 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigoReset = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const targetEmail = resetEmail.trim().toLowerCase();
    const codigo = resetCodigo.trim();

    if (!codigo) {
      setErrorMsg('Por favor, digite o código de 6 dígitos.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verificar-codigo-reset`, {
        email: targetEmail,
        codigo: codigo
      });

      if (response.data && response.data.sucesso) {
        setInfoMsg(response.data.mensagem || 'Código verificado! Agora defina sua nova senha.');
        setStep('reset_senha');
      } else {
        setErrorMsg(parseErrorMessage(response.data?.mensagem, 'Código incorreto ou expirado.'));
      }
    } catch (err) {
      console.warn('Erro ao verificar código de reset via API Python:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(parseErrorMessage(detail, 'Código de redefinição inválido ou expirado.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!isValidPassword(resetNovaSenha)) {
      setErrorMsg('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (resetNovaSenha !== resetConfirmaSenha) {
      setErrorMsg('As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }

    setLoading(true);
    const targetEmail = resetEmail.trim().toLowerCase();
    const codigo = resetCodigo.trim();

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/redefinir-senha`, {
        email: targetEmail,
        codigo: codigo,
        nova_senha: resetNovaSenha
      });

      if (response.data && response.data.sucesso) {
        setInfoMsg('Senha redefinida com sucesso! Faça login com a sua nova senha.');
        setIsSignUp(false);
        setEmail(targetEmail);
        setSenha('');
        setStep('form');
      } else {
        setErrorMsg(parseErrorMessage(response.data?.mensagem, 'Erro ao redefinir a senha.'));
      }
    } catch (err) {
      console.warn('Erro na redefinição de senha via API Python:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(parseErrorMessage(detail, 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured) return;

    setLoading(true);
    setErrorMsg('');

    const loadGsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google?.accounts?.oauth2) {
          resolve(window.google);
          return;
        }
        const existingScript = document.getElementById('gsi-client-script');
        if (existingScript) {
          existingScript.onload = () => resolve(window.google);
          return;
        }
        const script = document.createElement('script');
        script.id = 'gsi-client-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error('Falha ao carregar o SDK do Google Login.'));
        document.body.appendChild(script);
      });
    };

    loadGsiScript()
      .then((google) => {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setErrorMsg('Falha ao autenticar com o Google: ' + tokenResponse.error);
              }
              return;
            }

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await res.json();

              if (!profile.email) {
                throw new Error('Não foi possível obter o e-mail da conta do Google.');
              }

              const usuarioGoogle = {
                id: profile.sub || 'google_' + Date.now(),
                nome: profile.name || profile.given_name || 'Usuário Google',
                email: profile.email.toLowerCase(),
                profilePic: profile.picture || null,
                verificado: true,
                provedor: 'google'
              };

              // Envia o perfil do Google para a API do backend salvar no PostgreSQL
              try {
                const apiRes = await axios.post(`${API_BASE_URL}/auth/google`, {
                  nome: usuarioGoogle.nome,
                  email: usuarioGoogle.email,
                  profilePic: usuarioGoogle.profilePic
                });
                if (apiRes.data && apiRes.data.usuario) {
                  const saved = upsertUserLocal(apiRes.data.usuario);
                  onLoginSuccess(saved);
                } else {
                  const saved = upsertUserLocal(usuarioGoogle);
                  onLoginSuccess(saved);
                }
              } catch (apiErr) {
                console.warn('Erro na chamada da API do Google:', apiErr);
                const detail = apiErr.response?.data?.detail;
                setErrorMsg(parseErrorMessage(detail, 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'));
                setLoading(false);
                return;
              }

              resetForm();
              onClose();
            } catch (err) {
              console.error('Erro ao obter perfil do Google:', err);
              setErrorMsg('Ocorreu um erro ao obter os dados da conta Google.');
            } finally {
              setLoading(false);
            }
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.message);
      });
  };

  const resetForm = () => {
    setIsSignUp(false);
    setStep('form');
    setEmail('');
    setSenha('');
    setNome('');
    setTelefone('');
    setProfilePic(null);
    setEmailCode('');
    setPhoneCode('');
    setErrorMsg('');
    setInfoMsg('');
    setCodigoConsole('');
    setEmailError('');
    setSenhaError('');
    setShowPassword(false);
    setLoading(false);
    setResetEmail('');
    setResetCodigo('');
    setResetNovaSenha('');
    setResetConfirmaSenha('');
    setShowResetPassword(false);
  };

  const inputStyle = {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    borderRadius: '12px',
    border: '1.5px solid var(--color-brand-border)',
    background: 'var(--color-brand-surface)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-brand-dark)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
  };

  const inputStyleError = {
    ...inputStyle,
    border: '1.5px solid #ef4444',
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = 'var(--color-brand-primary)';
    e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-brand-primary) 12%, transparent)';
    e.target.style.background = 'white';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'var(--color-brand-border)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'var(--color-brand-surface)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(13, 31, 26, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => { resetForm(); onClose(); }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md animate-slide-down rounded-3xl p-8 max-h-[95vh] overflow-y-auto"
        style={{
          background: 'white',
          border: '1px solid var(--color-brand-border)',
          boxShadow: '0 24px 80px rgba(13,31,26,0.18), 0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Fechar */}
        <button
          onClick={() => { resetForm(); onClose(); }}
          className="absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-all"
          style={{ color: 'var(--color-brand-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-brand-surface)'; e.currentTarget.style.color = 'var(--color-brand-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-brand-muted)'; }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: FORMULÁRIO DE LOGIN/CADASTRO */}
        {step === 'form' && (
          <>
            <div className="text-center mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--color-brand-primary-pale)', border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)' }}
              >
                <span className="text-lg font-black" style={{ color: 'var(--color-brand-primary)' }}>E</span>
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-brand-dark)' }}>
                {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta!'}
              </h3>
              <p className="text-xs font-medium mt-1.5" style={{ color: 'var(--color-brand-muted)' }}>
                {isSignUp ? 'Já tem cadastro? ' : 'Novo por aqui? '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setInfoMsg(''); setEmailError(''); setSenhaError(''); }}
                  className="font-bold cursor-pointer underline hover:opacity-80"
                  style={{ color: 'var(--color-brand-primary)' }}
                >
                  {isSignUp ? 'Acessar minha conta.' : 'Criar conta grátis.'}
                </button>
              </p>
            </div>

            {/* Google Login */}
            {!isSignUp && (
              <>
                <div className="relative">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={!isGoogleConfigured}
                    title={!isGoogleConfigured ? 'Configure VITE_GOOGLE_CLIENT_ID no arquivo .env para ativar o login com Google.' : 'Entrar com Google'}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-3"
                    style={{
                      background: isGoogleConfigured ? 'white' : 'var(--color-brand-surface)',
                      border: `1.5px solid ${isGoogleConfigured ? 'var(--color-brand-border)' : '#e2e8f0'}`,
                      color: isGoogleConfigured ? 'var(--color-brand-dark)' : 'var(--color-brand-muted)',
                      opacity: isGoogleConfigured ? 1 : 0.6,
                      cursor: isGoogleConfigured ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={e => isGoogleConfigured && (e.currentTarget.style.background = 'var(--color-brand-surface)', e.currentTarget.style.borderColor = 'var(--color-brand-primary)')}
                    onMouseLeave={e => isGoogleConfigured && (e.currentTarget.style.background = 'white', e.currentTarget.style.borderColor = 'var(--color-brand-border)')}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.15" />
                      <path d="M12 6.5C13.47 6.5 14.69 7.04 15.6 7.91L18.15 5.41C16.6 4.02 14.44 3 12 3C8.48 3 5.44 5.01 3.96 7.93L6.87 10.17C7.62 8.07 9.65 6.5 12 6.5Z" fill="#EA4335" />
                      <path d="M21 12.2C21 11.44 20.93 10.68 20.8 9.95H12V14.2H17.17C16.88 15.54 16.08 16.66 14.93 17.39L17.78 19.54C19.71 17.74 21 15.18 21 12.2Z" fill="#4285F4" />
                      <path d="M6.87 13.83C6.68 13.27 6.57 12.65 6.57 12C6.57 11.35 6.68 10.73 6.87 10.17L3.96 7.93C3.35 9.16 3 10.54 3 12C3 13.46 3.35 14.84 3.96 16.07L6.87 13.83Z" fill="#FBBC05" />
                      <path d="M12 21C14.44 21 16.6 20.2 18.15 18.76L15.3 16.61C14.47 17.17 13.34 17.5 12 17.5C9.65 17.5 7.62 15.93 6.87 13.83L3.96 16.07C5.44 18.99 8.48 21 12 21Z" fill="#34A853" />
                    </svg>
                    CONTINUAR COM O GOOGLE
                  </button>
                  {!isGoogleConfigured && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-[10px] text-amber-700 font-semibold">
                        Configure <code className="bg-amber-50 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> no <code className="bg-amber-50 px-1 rounded">.env</code> para ativar.
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative my-5 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'var(--color-brand-border)' }} />
                  </div>
                  <span
                    className="relative px-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'white', color: 'var(--color-brand-muted)' }}
                  >
                    ou com e-mail
                  </span>
                </div>
              </>
            )}

            {/* Formulário Principal */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  {/* Foto de Perfil */}
                  <div className="flex flex-col items-center gap-2 mb-3">
                    <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] flex items-center justify-center overflow-hidden group">
                      {profilePic ? (
                        <img src={profilePic} alt="Preview Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-[var(--color-brand-primary)] transition-colors" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Escolher Foto de Perfil"
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-[var(--color-brand-muted)] uppercase tracking-wider">Foto de Perfil (Opcional)</span>
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1 ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-brand-muted)' }} />
                      <input
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Ex: Pedro Silva"
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  {/* Telefone celular */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1 ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                      Telefone Celular (Opcional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-brand-muted)' }} />
                      <input
                        type="tel"
                        value={telefone}
                        onChange={e => setTelefone(e.target.value)}
                        placeholder="Ex: (11) 98765-4321"
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1 ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                  Endereço de e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: emailError ? '#ef4444' : 'var(--color-brand-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    onBlur={handleEmailBlur}
                    placeholder="exemplo@dominio.com"
                    style={emailError ? inputStyleError : inputStyle}
                    onFocus={handleInputFocus}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 ml-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{emailError}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                    Senha
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setStep('reset_email'); setErrorMsg(''); setInfoMsg(''); }}
                      className="text-[10px] font-bold cursor-pointer hover:underline"
                      style={{ color: 'var(--color-brand-primary)' }}
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: senhaError ? '#ef4444' : 'var(--color-brand-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={e => { setSenha(e.target.value); if (senhaError) setSenhaError(''); }}
                    onBlur={handleSenhaBlur}
                    placeholder={isSignUp ? 'Mínimo 6 caracteres' : '••••••••'}
                    style={{ ...(senhaError ? inputStyleError : inputStyle), paddingRight: '40px' }}
                    onFocus={handleInputFocus}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {senhaError && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 ml-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{senhaError}
                  </p>
                )}
                {isSignUp && !senhaError && senha.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1 w-6 rounded-full transition-all duration-300"
                          style={{
                            background: senha.length >= (i + 1) * 3
                              ? (senha.length >= 12 ? '#10b981' : senha.length >= 8 ? '#f59e0b' : '#ef4444')
                              : '#e2e8f0'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: senha.length >= 12 ? '#10b981' : senha.length >= 8 ? '#f59e0b' : '#ef4444' }}>
                      {senha.length >= 12 ? 'Forte' : senha.length >= 8 ? 'Média' : 'Fraca'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mensagem de erro global */}
              {errorMsg && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{String(errorMsg)}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-2 flex items-center gap-2"
                style={{ padding: '14px 20px', fontSize: '0.75rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    {isSignUp ? 'CADASTRAR E ENVIAR CÓDIGO' : 'ACESSAR MINHA CONTA'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: VERIFICAÇÃO DE E-MAIL */}
        {step === 'email_verify' && (
          <div className="space-y-5 py-2 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto border border-emerald-100">
                <Mail className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-[var(--color-brand-dark)]">Confirme seu E-mail</h3>
              <p className="text-xs text-[var(--color-brand-muted)] font-medium">
                Enviamos um código de segurança de 6 dígitos para <strong>{email}</strong>.
              </p>
            </div>

            {infoMsg && (
              <div className="p-3 text-[11px] font-medium text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{String(infoMsg)}</span>
              </div>
            )}

            {codigoConsole && (
              <div className="bg-[var(--color-brand-amber-pale)] border border-amber-200 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[var(--color-brand-amber)] block">CÓDIGO DE TESTE (MODO LOCAL)</span>
                <span className="text-2xl font-black tracking-widest text-[var(--color-brand-dark)] font-mono">{String(codigoConsole)}</span>
                <p className="text-[10px] text-amber-800 font-medium">Insira a chave SMTP no .env para enviar e-mails reais diretamente à caixa de entrada.</p>
              </div>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={emailCode}
                  onChange={e => setEmailCode(e.target.value)}
                  placeholder="Digite os 6 dígitos"
                  className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] focus:bg-white focus:outline-none focus:border-[var(--color-brand-primary)]"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl text-center border border-red-100">
                  {String(errorMsg)}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center flex items-center gap-2"
                style={{ padding: '14px 20px', fontSize: '0.75rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                CONFIRMAR E ATIVAR CONTA
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[var(--color-brand-border)]">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-[11px] font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={loading}
                className="text-[11px] font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reenviar código
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFICAÇÃO DE TELEFONE */}
        {step === 'phone_verify' && (
          <div className="space-y-5 py-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto border border-emerald-100">
                <Phone className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-[var(--color-brand-dark)]">Confirme seu Telefone</h3>
              <p className="text-xs text-[var(--color-brand-muted)] font-medium">
                Enviamos um SMS com código de segurança para <strong>{telefone}</strong>.
              </p>
            </div>

            <div className="bg-[var(--color-brand-amber-pale)] border border-amber-200 p-4 rounded-xl text-center">
              <span className="text-[10px] font-extrabold uppercase text-[var(--color-brand-amber)] block mb-1">CÓDIGO DE TESTE SMS</span>
              <span className="text-lg font-black tracking-widest text-[var(--color-brand-dark)] font-mono">5678</span>
            </div>

            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={phoneCode}
                  onChange={e => setPhoneCode(e.target.value)}
                  placeholder="Digite os 4 dígitos do SMS"
                  className="w-full text-center tracking-widest text-lg font-bold py-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] focus:bg-white focus:outline-none focus:border-[var(--color-brand-primary)]"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl text-center">
                  {String(errorMsg)}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full justify-center"
                style={{ padding: '14px 20px', fontSize: '0.75rem' }}
              >
                CONCLUIR CADASTRO
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email_verify')}
                className="text-[11px] font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
              >
                ← Voltar para verificação de e-mail
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SOLICITAR CÓDIGO DE REDEFINIÇÃO DE SENHA */}
        {step === 'reset_email' && (
          <div className="space-y-5 py-2 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto border border-emerald-100">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-[var(--color-brand-dark)]">Redefinir Senha</h3>
              <p className="text-xs text-[var(--color-brand-muted)] font-medium">
                Digite o seu e-mail cadastrado. Enviaremos um código de 6 dígitos para redefinir sua senha.
              </p>
            </div>

            {infoMsg && (
              <div className="p-3 text-[11px] font-medium text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{String(infoMsg)}</span>
              </div>
            )}

            <form onSubmit={handleSolicitarReset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1 ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                  Endereço de e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-brand-muted)' }} />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="exemplo@dominio.com"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{String(errorMsg)}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center flex items-center gap-2"
                style={{ padding: '14px 20px', fontSize: '0.75rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    ENVIANDO...
                  </>
                ) : (
                  <>
                    ENVIAR CÓDIGO DE REDEFINIÇÃO
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[var(--color-brand-border)]">
              <button
                type="button"
                onClick={() => { setStep('form'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-[11px] font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
              >
                ← Voltar para o login
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VERIFICAR CÓDIGO DE REDEFINIÇÃO DE SENHA */}
        {step === 'reset_codigo' && (
          <div className="space-y-5 py-2 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto border border-emerald-100">
                <ShieldCheck className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-[var(--color-brand-dark)]">Código de Redefinição</h3>
              <p className="text-xs text-[var(--color-brand-muted)] font-medium">
                Digite o código de 6 dígitos enviado para <strong>{resetEmail}</strong>.
              </p>
            </div>

            {infoMsg && (
              <div className="p-3 text-[11px] font-medium text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{String(infoMsg)}</span>
              </div>
            )}

            {codigoConsole && (
              <div className="bg-[var(--color-brand-amber-pale)] border border-amber-200 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[var(--color-brand-amber)] block">CÓDIGO DE TESTE (MODO LOCAL)</span>
                <span className="text-2xl font-black tracking-widest text-[var(--color-brand-dark)] font-mono">{String(codigoConsole)}</span>
              </div>
            )}

            <form onSubmit={handleVerificarCodigoReset} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCodigo}
                  onChange={e => setResetCodigo(e.target.value)}
                  placeholder="Digite os 6 dígitos"
                  className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] focus:bg-white focus:outline-none focus:border-[var(--color-brand-primary)]"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl text-center border border-red-100">
                  {String(errorMsg)}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center flex items-center gap-2"
                style={{ padding: '14px 20px', fontSize: '0.75rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                VERIFICAR CÓDIGO
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[var(--color-brand-border)]">
              <button
                type="button"
                onClick={() => { setStep('reset_email'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-[11px] font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleSolicitarReset}
                disabled={loading}
                className="text-[11px] font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reenviar código
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: DEFINIR NOVA SENHA */}
        {step === 'reset_senha' && (
          <div className="space-y-5 py-2 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto border border-emerald-100">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-[var(--color-brand-dark)]">Criar Nova Senha</h3>
              <p className="text-xs text-[var(--color-brand-muted)] font-medium">
                Sua identidade foi verificada. Escolha uma nova senha para sua conta.
              </p>
            </div>

            {infoMsg && (
              <div className="p-3 text-[11px] font-medium text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{String(infoMsg)}</span>
              </div>
            )}

            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              {/* Nova Senha */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1 ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-brand-muted)' }} />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetNovaSenha}
                    onChange={e => setResetNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetNovaSenha.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5 ml-0.5">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1 w-6 rounded-full transition-all duration-300"
                          style={{
                            background: resetNovaSenha.length >= (i + 1) * 3
                              ? (resetNovaSenha.length >= 12 ? '#10b981' : resetNovaSenha.length >= 8 ? '#f59e0b' : '#ef4444')
                              : '#e2e8f0'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: resetNovaSenha.length >= 12 ? '#10b981' : resetNovaSenha.length >= 8 ? '#f59e0b' : '#ef4444' }}>
                      {resetNovaSenha.length >= 12 ? 'Forte' : resetNovaSenha.length >= 8 ? 'Média' : 'Fraca'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1 ml-0.5" style={{ color: 'var(--color-brand-muted)' }}>
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-brand-muted)' }} />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetConfirmaSenha}
                    onChange={e => setResetConfirmaSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                  />
                </div>
                {resetConfirmaSenha.length > 0 && resetNovaSenha !== resetConfirmaSenha && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 ml-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> As senhas não coincidem
                  </p>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{String(errorMsg)}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center flex items-center gap-2"
                style={{ padding: '14px 20px', fontSize: '0.75rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                REDEFINIR SENHA E ENTRAR
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[var(--color-brand-border)]">
              <button
                type="button"
                onClick={() => { setStep('reset_codigo'); setErrorMsg(''); setInfoMsg(''); }}
                className="text-[11px] font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] font-medium mt-5" style={{ color: 'var(--color-brand-muted)' }}>
          Ao continuar, você concorda com os{' '}
          <span className="font-bold" style={{ color: 'var(--color-brand-primary)' }}>Termos de Uso</span>{' '}
          e a{' '}
          <span className="font-bold" style={{ color: 'var(--color-brand-primary)' }}>Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}
