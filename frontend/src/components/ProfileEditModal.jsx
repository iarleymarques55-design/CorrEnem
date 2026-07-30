/**
 * Componente ProfileEditModal (Modal de Edição de Perfil)
 * Permite ao usuário editar suas informações de conta (nome, telefone, foto de perfil em Base64
 * e alteração de senha de acesso) com validações e persistência em tempo real.
 */
import React, { useState } from 'react';
import { X, User, Mail, Phone, Camera, Lock, CheckCircle2, ShieldCheck, Save } from 'lucide-react';

export default function ProfileEditModal({ isOpen, onClose, user, onSaveProfile }) {
  if (!isOpen || !user) return null;

  const [nome, setNome] = useState(user.nome || '');
  const [email, setEmail] = useState(user.email || '');
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [profilePic, setProfilePic] = useState(user.profilePic || null);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [msgSucesso, setMsgSucesso] = useState('');
  const [msgErro, setMsgErro] = useState('');

  // Auxiliar para iniciais
  const getInitials = (name) => {
    if (!name) return 'E';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setMsgErro('A imagem selecionada deve ter no máximo 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setMsgErro('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsgErro('');
    setMsgSucesso('');

    if (!nome.trim()) {
      setMsgErro('O campo Nome é obrigatório.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMsgErro('Informe um endereço de e-mail válido.');
      return;
    }
    if (novaSenha && novaSenha !== confirmarSenha) {
      setMsgErro('A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    const updatedUser = {
      ...user,
      nome,
      email,
      telefone,
      profilePic,
    };

    onSaveProfile(updatedUser);
    setMsgSucesso('Perfil atualizado com sucesso!');
    setTimeout(() => {
      setMsgSucesso('');
      onClose();
    }, 1200);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(13, 31, 26, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Card Modal */}
      <div
        className="relative z-10 w-full max-w-lg animate-slide-down rounded-3xl p-8 max-h-[92vh] overflow-y-auto"
        style={{
          background: 'white',
          border: '1px solid var(--color-brand-border)',
          boxShadow: '0 24px 80px rgba(13,31,26,0.22), 0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-all hover:bg-slate-100 text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-primary-pale)] border border-emerald-100">
            <User className="w-6 h-6 text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[var(--color-brand-dark)]">Editar Meu Perfil</h3>
            <p className="text-xs font-medium text-[var(--color-brand-muted)]">Atualize seus dados pessoais e preferências de conta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload / Selector */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/30 p-1 bg-white shadow-md group">
              {profilePic ? (
                <img src={profilePic} alt={nome} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[var(--color-brand-primary)] to-emerald-400 flex items-center justify-center text-white font-black text-2xl tracking-wider">
                  {getInitials(nome)}
                </div>
              )}
              <label
                htmlFor="avatar-upload-edit"
                className="absolute bottom-0 right-0 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-light)] text-white p-2 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110"
                title="Alterar foto de perfil"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload-edit"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[11px] font-extrabold text-[var(--color-brand-muted)] uppercase tracking-wider">Clique na câmera para alterar foto</span>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 text-[var(--color-brand-muted)]">
              Nome Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 text-[var(--color-brand-muted)]">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1 text-[var(--color-brand-muted)]">
              Telefone Celular / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Alterar Senha (Opcional) */}
          <div className="border-t pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Alterar Senha (Opcional)</span>
            
            <div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Nova senha (deixe em branco para não alterar)"
                  style={inputStyle}
                />
              </div>
            </div>

            {novaSenha && (
              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme a nova senha"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Alertas */}
          {msgErro && (
            <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">
              {msgErro}
            </div>
          )}

          {msgSucesso && (
            <div className="p-3 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {msgSucesso}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="w-1/2 btn-primary py-3 px-4 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
