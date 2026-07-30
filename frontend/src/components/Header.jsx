/**
 * Componente Header (Barra de Navegação Superior)
 * Responsável pela navegação principal da aplicação CorrEnem, exibindo links de navegação da Landing Page
 * ou opções da Área do Estudante (Painel, Nova Redação, Meus Ensaios), além do controle de perfil do usuário.
 */
import React, { useState } from 'react';
import { User, LogOut, Award, Menu, X, Home, PenTool, History, ArrowLeft, Settings, Edit3, LayoutDashboard } from 'lucide-react';

export default function Header({ 
  onOpenLogin, 
  user, 
  onLogout, 
  onGoToDashboard, 
  currentView, 
  onDashboardNavigate, 
  dashboardSubView,
  onOpenProfileEdit
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'E';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleScroll = (id) => {
    setMenuOpen(false);
    if (currentView !== 'landing') {
      onGoToDashboard('landing');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Links da landing page (visitante / não-logado)
  const landingLinks = [
    { label: 'Como funciona', id: 'como-funciona' },
    { label: 'Critérios ENEM', id: 'criterios' },
    { label: 'Tecnologia IA', id: 'sobre' },
  ];

  // Links do dashboard (usuário logado)
  const dashboardLinks = [
    { label: 'Painel', subView: 'home', icon: Home },
    { label: 'Nova Redação', subView: 'choose_theme', icon: PenTool },
    { label: 'Meus Ensaios', subView: 'home', icon: History, scrollTo: 'historico-section' },
  ];

  const isDashboard = currentView === 'dashboard' && user;

  const handleDashboardNav = (link) => {
    setMenuOpen(false);
    if (onDashboardNavigate) {
      onDashboardNavigate(link.subView);
    }
    if (link.scrollTo) {
      setTimeout(() => {
        document.getElementById(link.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <header
      style={{
        position: 'relative',
        background: 'white',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--color-brand-border)',
        boxShadow: isDashboard
          ? '0 1px 0 0 var(--color-brand-border), 0 2px 12px rgba(0,0,0,0.03)'
          : '0 1px 0 0 var(--color-brand-border), 0 4px 20px rgba(0,0,0,0.04)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => { setMenuOpen(false); onGoToDashboard('landing'); }}
          className="flex items-center gap-3 focus:outline-none cursor-pointer"
        >
          <div
            className="p-2 rounded-xl"
            style={{
              background: 'var(--color-brand-primary-pale)',
              border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)'
            }}
          >
            <Award className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight leading-none">
              Corr<span style={{ color: 'var(--color-brand-primary)' }}>Enem</span>
            </h1>
            <p
              className="text-[9px] font-extrabold uppercase tracking-widest mt-0.5"
              style={{ color: 'var(--color-brand-muted)' }}
            >
              {isDashboard ? 'Área do Estudante' : 'Critérios Oficiais ENEM'}
            </p>
          </div>
        </button>

        {/* Nav desktop — muda conforme o contexto */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-brand-muted)' }}>
          {isDashboard ? (
            /* === Links do Dashboard === */
            dashboardLinks.map((link) => {
              const Icon = link.icon;
              const isActive = dashboardSubView === link.subView && !link.scrollTo;
              return (
                <button
                  key={link.label}
                  onClick={() => handleDashboardNav(link)}
                  className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--color-brand-primary-pale)' : 'transparent',
                    color: isActive ? 'var(--color-brand-primary)' : 'var(--color-brand-muted)',
                    fontWeight: isActive ? '800' : '700',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--color-brand-surface)';
                      e.currentTarget.style.color = 'var(--color-brand-dark)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-brand-muted)';
                    }
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </button>
              );
            })
          ) : (
            /* === Links da Landing === */
            landingLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className="cursor-pointer px-3 py-2 rounded-xl transition-colors"
                style={{ color: 'var(--color-brand-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-muted)'}
              >
                {link.label}
              </button>
            ))
          )}
        </nav>

        {/* Ações do lado direito */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Botão para alternar entre Dashboard e Landing Page */}
              {isDashboard ? (
                <button
                  onClick={() => { setMenuOpen(false); onGoToDashboard('landing'); }}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    color: 'var(--color-brand-muted)',
                    border: '1px solid var(--color-brand-border)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-brand-surface)';
                    e.currentTarget.style.color = 'var(--color-brand-dark)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-brand-muted)';
                  }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Início
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); onGoToDashboard('dashboard'); }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-xs"
                  style={{
                    color: 'var(--color-brand-primary)',
                    border: '1.5px solid color-mix(in srgb, var(--color-brand-primary) 30%, transparent)',
                    background: 'var(--color-brand-primary-pale)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-brand-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--color-brand-primary-pale)';
                    e.currentTarget.style.color = 'var(--color-brand-primary)';
                  }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Área do Estudante
                </button>
              )}
              <button
                onClick={onOpenProfileEdit}
                title="Clique para Editar Perfil"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:border-[var(--color-brand-primary)] hover:bg-emerald-50/50"
                style={{
                  background: 'var(--color-brand-surface)',
                  border: '1px solid var(--color-brand-border)',
                  color: 'var(--color-brand-dark)'
                }}
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.nome}
                    className="w-5 h-5 rounded-full object-cover shrink-0 border border-emerald-500/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--color-brand-primary)] text-white text-[9px] font-black flex items-center justify-center tracking-tighter shrink-0">
                    {getInitials(user.nome)}
                  </div>
                )}
                <span className="font-extrabold">{user.nome}</span>
                <Edit3 className="w-3 h-3 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]" />
              </button>
              <button
                onClick={onLogout}
                title="Sair"
                className="p-2 rounded-full cursor-pointer transition-colors"
                style={{ color: 'var(--color-brand-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setMenuOpen(false); onOpenLogin(); }}
                className="hidden md:block text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                style={{ color: 'var(--color-brand-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-brand-surface)'; e.currentTarget.style.color = 'var(--color-brand-dark)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-brand-muted)'; }}
              >
                Entrar
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (user) {
                    onGoToDashboard('dashboard');
                  } else {
                    onOpenLogin();
                  }
                }}
                className="btn-primary text-xs py-2.5 px-5"
                style={{ padding: '10px 20px', fontSize: '0.75rem' }}
              >
                Corrigir redação
              </button>
            </>
          )}

          {/* Hamburguer mobile */}
          <button
            className="md:hidden p-2 rounded-xl cursor-pointer"
            style={{ color: 'var(--color-brand-dark)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-5 pt-2 space-y-1 animate-slide-down"
          style={{ borderTop: '1px solid var(--color-brand-border)' }}
        >
          {isDashboard ? (
            /* === Mobile: Links dashboard === */
            <>
              {dashboardLinks.map((link) => {
                const Icon = link.icon;
                const isActive = dashboardSubView === link.subView && !link.scrollTo;
                return (
                  <button
                    key={link.label}
                    onClick={() => handleDashboardNav(link)}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                    style={{
                      color: isActive ? 'var(--color-brand-primary)' : 'var(--color-brand-dark)',
                      background: isActive ? 'var(--color-brand-primary-pale)' : 'transparent',
                    }}
                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'var(--color-brand-surface)'; }}
                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
              <button
                onClick={() => { setMenuOpen(false); onGoToDashboard('landing'); }}
                className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                style={{ color: 'var(--color-brand-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao site
              </button>
            </>
          ) : (
            /* === Mobile: Links landing === */
            <>
              {landingLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScroll(link.id)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                  style={{ color: 'var(--color-brand-dark)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (user) {
                    onGoToDashboard('dashboard');
                  } else {
                    onOpenLogin();
                  }
                }}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                style={{ color: 'var(--color-brand-primary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-primary-pale)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {user ? 'Ir para o painel' : 'Corrigir redação'}
              </button>
              {!user && (
                <button
                  onClick={() => { setMenuOpen(false); onOpenLogin(); }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                  style={{ color: 'var(--color-brand-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Entrar na conta
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
