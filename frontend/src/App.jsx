/**
 * Componente Principal da Aplicação React (App.jsx)
 * Gerencia o estado global de navegação (Landing Page vs. Área do Estudante), controle de usuário,
 * histórico de redações/rascunhos e integração com todos os serviços do backend via Axios.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config/api';
import Header from './components/Header';
import RedacaoForm from './components/RedacaoForm';
import ResultadoCard from './components/ResultadoCard';
import ComoFunciona from './components/ComoFunciona';
import AuthModal from './components/AuthModal';
import ProfileEditModal from './components/ProfileEditModal';
import {
  Sparkles, FileText, ArrowRight, BookOpen,
  Star, ShieldCheck, Cpu, TrendingUp, Award, Zap,
  CheckCircle, Users, Clock, Search, HelpCircle, PenTool,
  Plus, History, BarChart3, AlertCircle, RefreshCw, X, FileEdit,
  Laptop, Landmark, BookmarkPlus, Trash2, Edit2
} from 'lucide-react';

import { TEMAS_ENEM } from './data/temasEnem';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('correnem_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Manter o usuário na 'dashboard' (Área do Estudante) se já estiver logado ao recarregar
  const [view, setView] = useState(() => {
    try {
      const savedUser = localStorage.getItem('correnem_user');
      if (savedUser) {
        const savedView = localStorage.getItem('correnem_view');
        return savedView || 'dashboard';
      }
      return 'landing';
    } catch {
      return 'landing';
    }
  });

  const [dashboardSubView, setDashboardSubView] = useState('home');

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // Efeito para salvar a view atual no localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('correnem_view', view);
      } else {
        localStorage.removeItem('correnem_view');
      }
    } catch (e) {
      console.error('Erro ao salvar view no localStorage:', e);
    }
  }, [view, user]);

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);

  // Novos estados para Planejamento de Escrita e IA
  const [writingMode, setWritingMode] = useState('padrao'); // 'padrao' | 'roteiro' | 'manuscrito' | 'exemplar'
  const [isAIThemeActive, setIsAIThemeActive] = useState(false);
  const [roteiroQuestions, setRoteiroQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [exemplarData, setExemplarData] = useState(null);
  const [loadingExemplar, setLoadingExemplar] = useState(false);

  // Modais
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Histórico de redações
  const [essayHistory, setEssayHistory] = useState([]);

  // Lista de rascunhos com persistência
  const [draftHistory, setDraftHistory] = useState(() => {
    try {
      const savedDrafts = localStorage.getItem('correnem_drafts');
      return savedDrafts ? JSON.parse(savedDrafts) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Carrega histórico de redações e rascunhos salvos no PostgreSQL para o usuário logado
  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE_URL}/redacoes/usuario?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setEssayHistory(res.data);
          }
        })
        .catch(err => console.warn('Erro ao carregar redações do PostgreSQL:', err));

      axios.get(`${API_BASE_URL}/rascunhos/usuario?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setDraftHistory(res.data);
          }
        })
        .catch(err => console.warn('Erro ao carregar rascunhos do PostgreSQL:', err));
    } else {
      setEssayHistory([]);
    }
  }, [user?.email]);

  const handleSubmissaoRedacao = async (dadosRedacao) => {
    setLoading(true);
    setResultado(null);
    setError('');
    try {
      const payload = {
        ...dadosRedacao,
        usuario_email: user?.email || null
      };
      const response = await axios.post(`${API_BASE_URL}/corrigir`, payload);
      const novaRedacao = {
        id: response.data.id || `red_${Date.now()}`,
        tema: dadosRedacao.tema,
        titulo: dadosRedacao.tema.length > 25 ? `${dadosRedacao.tema.substring(0, 25)}...` : dadosRedacao.tema,
        texto_original: dadosRedacao.texto, // Salvando o texto original
        nota_final: response.data.nota_final,
        competencia1: response.data.competencia1,
        competencia2: response.data.competencia2,
        competencia3: response.data.competencia3,
        competencia4: response.data.competencia4,
        competencia5: response.data.competencia5,
        comentario_geral: response.data.comentario_geral,
        explicacao_nota_final: response.data.explicacao_nota_final,
        desvios: response.data.desvios || [],
        data: 'agora mesmo'
      };

      setEssayHistory(prev => [novaRedacao, ...prev]);
      setResultado(novaRedacao); // Passando o objeto completo para ResultadoCard
      setDashboardSubView('view_result');
    } catch (err) {
      console.error(err);
      const rawDetail = err.response?.data?.detail;
      const msgErro = typeof rawDetail === 'string' ? rawDetail : (Array.isArray(rawDetail) ? rawDetail.map(i => i.msg || String(i)).join(' | ') : (rawDetail ? JSON.stringify(rawDetail) : 'Não foi possível conectar ao servidor. Verifique se o backend está ativo.'));
      setError(msgErro);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    if (user) {
      setView('dashboard');
      setDashboardSubView('home');
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = (dadosUser) => {
    setUser(dadosUser);
    try {
      localStorage.setItem('correnem_user', JSON.stringify(dadosUser));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
    setView('dashboard');
    setDashboardSubView('home');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('correnem_user');
      localStorage.removeItem('correnem_view');
    } catch (e) {
      console.error('Erro ao remover do localStorage:', e);
    }
    setView('landing');
  };

  const handleSaveProfile = async (updatedUser) => {
    // 1. Atualiza imediatamente no estado local e localStorage (feedback rápido)
    setUser(updatedUser);
    try {
      localStorage.setItem('correnem_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Erro ao atualizar perfil no localStorage:', e);
    }

    // 2. Persiste no banco de dados (foto de perfil, nome, telefone)
    if (updatedUser?.email) {
      try {
        const res = await axios.put(`${API_BASE_URL}/auth/perfil`, {
          email: updatedUser.email,
          nome: updatedUser.nome,
          telefone: updatedUser.telefone || '',
          profilePic: updatedUser.profilePic || null,
        });
        if (res.data?.usuario) {
          // Mescla dados confirmados pelo backend com o estado local
          const confirmed = { ...updatedUser, ...res.data.usuario };
          setUser(confirmed);
          localStorage.setItem('correnem_user', JSON.stringify(confirmed));
        }
      } catch (err) {
        console.warn('Erro ao salvar perfil no backend, mantendo localStorage:', err);
      }
    }
  };

  const handleSaveDraft = async (novoRascunho) => {
    setDraftHistory(prev => {
      const atualizados = [novoRascunho, ...prev.filter(d => d.id !== novoRascunho.id)];
      try {
        localStorage.setItem('correnem_drafts', JSON.stringify(atualizados));
      } catch (e) {
        console.error('Erro ao salvar rascunhos no localStorage:', e);
      }
      return atualizados;
    });

    if (user?.email) {
      try {
        await axios.post(`${API_BASE_URL}/rascunhos`, {
          id: novoRascunho.id,
          usuario_email: user.email,
          tema: novoRascunho.tema,
          titulo: novoRascunho.titulo || novoRascunho.tema,
          texto: novoRascunho.texto,
          linhas: novoRascunho.linhas || 0
        });
      } catch (err) {
        console.warn('Erro ao salvar rascunho no PostgreSQL:', err);
      }
    }
  };

  const handleDeleteDraft = async (draftId) => {
    setDraftHistory(prev => {
      const atualizados = prev.filter(d => d.id !== draftId);
      try {
        localStorage.setItem('correnem_drafts', JSON.stringify(atualizados));
      } catch (e) {
        console.error('Erro ao excluir rascunho do localStorage:', e);
      }
      return atualizados;
    });

    if (user?.email) {
      try {
        await axios.delete(`${API_BASE_URL}/rascunhos/${draftId}`);
      } catch (err) {
        console.warn('Erro ao excluir rascunho do PostgreSQL:', err);
      }
    }
  };

  const totalCorrigidas = essayHistory.length;
  const notaMedia = totalCorrigidas > 0
    ? Math.round(essayHistory.reduce((acc, curr) => acc + curr.nota_final, 0) / totalCorrigidas)
    : 0;

  const getCompetenciaMedia = (key) => {
    if (totalCorrigidas === 0) return 0;
    const soma = essayHistory.reduce((acc, curr) => {
      const comp = curr[key];
      return acc + (comp ? comp.nota : 0);
    }, 0);
    return Math.round(soma / totalCorrigidas);
  };

  const mediasCompetencias = {
    c1: getCompetenciaMedia('competencia1'),
    c2: getCompetenciaMedia('competencia2'),
    c3: getCompetenciaMedia('competencia3'),
    c4: getCompetenciaMedia('competencia4'),
    c5: getCompetenciaMedia('competencia5')
  };

  // Geração de Tema por IA
  const handleGerarTemaIA = async () => {
    setLoading(true);
    setIsAIThemeActive(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/gerar-tema`);
      setSelectedTheme({
        id: `ai_theme_${Date.now()}`,
        titulo: response.data.titulo,
        desc: response.data.desc,
        motivadores: response.data.motivadores,
        bgImage: response.data.bgImage,
        eixo: response.data.eixo,
        gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-100',
      });
      setIsPreviewModalOpen(true);
    } catch (err) {
      console.error(err);
      // Fallback a um tema aleatório
      const randomIdx = Math.floor(Math.random() * TEMAS_ENEM.length);
      setSelectedTheme(TEMAS_ENEM[randomIdx]);
      setIsPreviewModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoteiroQuestions = async (tema) => {
    setLoadingQuestions(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/gerar-roteiro`, { tema });
      setRoteiroQuestions(res.data);
    } catch (err) {
      console.error(err);
      setRoteiroQuestions({
        pergunta1: "Como contextualizar o tema e introduzir sua tese?",
        pergunta2: "Qual a primeira causa desse problema?",
        pergunta3: "Qual a consequência ou segunda causa do problema?",
        pergunta4: "Qual proposta de intervenção pode mitigar o problema?"
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchExemplar = async (tema) => {
    setExemplarData(null);        // 1. limpa dados anteriores
    setLoadingExemplar(true);     // 2. ativa loading ANTES de trocar view
    setDashboardSubView('view_exemplar'); // 3. agora troca view (loading já está true)
    try {
      const res = await axios.post(`${API_BASE_URL}/exemplar-referencia`, { tema });
      setExemplarData(res.data);
    } catch (err) {
      console.error(err);
      setExemplarData({
        tema_titulo: tema,
        redacao_modelo: "Historicamente, o Brasil enfrenta grandes desafios sociais que requerem ação coordenada do Estado e da sociedade civil.\n\nEm primeira análise, percebe-se que a inoperância governamental contribui significativamente para a perpetuação do problema. Conforme postulado por John Locke na teoria do contrato social, o Estado deve garantir o bem-estar coletivo, porém a realidade brasileira evidencia uma lacuna entre o texto constitucional e a prática administrativa.\n\nAlém disso, a omissão da sociedade civil amplifica as consequências do entrave. Segundo o sociólogo Zygmunt Bauman, a modernidade líquida enfraquece os laços de solidariedade, tornando difícil a mobilização coletiva para enfrentar problemas estruturais.\n\nPortanto, é imperioso que o Ministério responsável, em parceria com organizações da sociedade civil, implemente políticas públicas eficazes por meio de programas educativos e campanhas de conscientização, com o fito de construir um Brasil mais justo e equânime.",
        analise_c1: "Nota 200/200: A redação apresenta domínio pleno da norma culta da língua portuguesa, sem desvios gramaticais, utilizando vocabulário culto e preciso ao longo de toda a dissertação.",
        analise_c2: "Nota 200/200: O texto compreende a proposta temática integralmente e utiliza repertório sociocultural legitimado (John Locke, Zygmunt Bauman) de forma produtiva e bem articulada com a tese.",
        analise_c3: "Nota 200/200: O projeto de texto está bem estruturado com introdução, dois desenvolvimentos temáticos distintos e conclusão coesa, defendendo um ponto de vista claro ao longo de toda a argumentação.",
        analise_c4: "Nota 200/200: Uso de conectivos interparágrafos variados ('Em primeira análise', 'Além disso', 'Portanto') garantindo fluidez textual e progressão argumentativa sem repetições.",
        analise_c5: "Nota 200/200: A proposta de intervenção apresenta os 5 elementos obrigatórios: Agente (Ministério), Ação (implementar políticas), Meio (programas educativos e campanhas), Efeito (Brasil mais justo) e Detalhamento implícito na execução conjunta."
      });
    } finally {
      setLoadingExemplar(false);
    }
  };

  const handleSelecionarTema = (theme) => {
    setIsAIThemeActive(false);
    setSelectedTheme(theme);
    setIsPreviewModalOpen(true);
  };

  const handleConfirmarTema = () => {
    setIsPreviewModalOpen(false);
    if (writingMode === 'roteiro') {
      fetchRoteiroQuestions(selectedTheme.titulo);
      setDashboardSubView('write_essay');
    } else if (writingMode === 'exemplar') {
      fetchExemplar(selectedTheme.titulo);
    } else {
      setDashboardSubView('write_essay');
    }
  };

  const handleTemaLivre = () => {
    setIsAIThemeActive(false);
    setSelectedTheme({
      id: 'tema_livre',
      titulo: 'Enunciado Próprio',
      desc: 'Escreva sobre qualquer assunto à sua escolha. O algoritmo de correção interpretará a tese defendida.',
      motivadores: null
    });
    if (writingMode === 'roteiro') {
      fetchRoteiroQuestions('Enunciado Próprio');
      setDashboardSubView('write_essay');
    } else if (writingMode === 'exemplar') {
      fetchExemplar('Enunciado Próprio');
    } else {
      setDashboardSubView('write_essay');
    }
  };

  const filteredThemes = TEMAS_ENEM.filter(t =>
    t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-brand-bg)', fontFamily: 'var(--font-sans)', color: 'var(--color-brand-dark)' }}>
      <Header
        onOpenLogin={() => setIsLoginOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenProfileEdit={() => setIsProfileEditOpen(true)}
        onGoToDashboard={(novaView) => {
          setView(novaView);
          if (novaView === 'dashboard') setDashboardSubView('home');
        }}
        currentView={view}
        onDashboardNavigate={(subView) => setDashboardSubView(subView)}
        dashboardSubView={dashboardSubView}
      />

      {view === 'landing' ? (
        <div className="flex-grow">
          {/* ============ LANDING: HERO ============ */}
          <section className="hero-bg py-24 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

              {/* Texto */}
              <div className={`lg:col-span-7 space-y-7 text-center lg:text-left transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="badge-primary inline-flex mx-auto lg:mx-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Correção inteligente no modelo ENEM</span>
                </div>

                <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  Sua redação avaliada{' '}
                  <span className="text-shimmer">como no ENEM de verdade</span>
                </h2>

                <p className="text-base text-[var(--color-brand-muted)] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  Nossa IA analisa cada competência da grade oficial — gramática, argumentação,
                  coesão e proposta de intervenção — e devolve um feedback tão detalhado quanto
                  o de um corretor especialista.
                </p>

                {/* Social proof */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[var(--color-brand-amber)] text-[var(--color-brand-amber)]" style={{ marginRight: i < 4 ? '-1px' : 0 }} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[var(--color-brand-muted)]">
                      4,9 • mais de 50.000 estudantes
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-muted)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-brand-success)]" />
                    Privacidade garantida
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                  <button className="btn-primary w-full sm:w-auto" onClick={handleGoToDashboard}>
                    Corrigir redação grátis
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    className="btn-secondary w-full sm:w-auto"
                    onClick={() => {
                      const el = document.getElementById('como-funciona');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Ver como funciona
                  </button>
                </div>
              </div>

              {/* Card mockup flutuante */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="animate-float relative" style={{ maxWidth: '340px', width: '100%' }}>
                  <div
                    className="absolute -top-4 -right-4 z-10 px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase shadow-lg"
                    style={{ background: 'var(--color-brand-primary)', rotate: '4deg' }}
                  >
                    ✓ Nota 1000
                  </div>

                  <div className="glass rounded-3xl p-6 space-y-5" style={{ boxShadow: '0 20px 60px rgba(26,122,94,0.15), 0 4px 16px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-brand-border)' }}>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-450 block" />
                        <span className="w-3 h-3 rounded-full bg-amber-450 block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-450 block" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand-muted)]">
                        Relatório de Correção
                      </span>
                    </div>

                    <div className="text-center py-5 rounded-2xl" style={{ background: 'var(--color-brand-primary-pale)' }}>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)] block mb-1">
                        Nota Geral
                      </span>
                      <span className="text-5xl font-black text-[var(--color-brand-dark)]">
                        960
                        <span className="text-sm font-bold text-[var(--color-brand-muted)]"> / 1000</span>
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { comp: 'Norma Culta', nota: 200, max: 200 },
                        { comp: 'Compreensão', nota: 200, max: 200 },
                        { comp: 'Argumentação', nota: 180, max: 200 },
                        { comp: 'Coesão', nota: 200, max: 200 },
                        { comp: 'Intervenção', nota: 180, max: 200 },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-[var(--color-brand-dark)]">{c.comp}</span>
                              <span
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                                style={{
                                  background: c.nota === c.max ? 'var(--color-brand-primary-pale)' : 'var(--color-brand-amber-pale)',
                                  color: c.nota === c.max ? 'var(--color-brand-primary)' : 'var(--color-brand-amber)',
                                }}
                              >
                                {c.nota}/{c.max}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-brand-border)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(c.nota / c.max) * 100}%`,
                                  background: c.nota === c.max ? 'var(--color-brand-primary)' : 'var(--color-brand-amber)',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ComoFunciona />

          {/* ============ CRITÉRIOS ENEM ============ */}
          <section id="criterios" className="py-20 px-6 scroll-mt-20">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="badge-primary inline-flex mx-auto">
                  <TrendingUp className="w-3 h-3" />
                  Métricas Avaliativas
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-brand-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  As 5 Competências Oficiais do ENEM
                </h2>
                <p className="text-sm text-[var(--color-brand-muted)] max-w-2xl mx-auto font-medium">
                  Compreenda quais eixos de escrita nossa plataforma avalia para gerar sua nota.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  {
                    num: 'C1',
                    title: 'Norma Culta da Língua',
                    desc: 'Avaliamos a ortografia, acentuação, concordância verbal/nominal, regência e escolha lexical formal.'
                  },
                  {
                    num: 'C2',
                    title: 'Compreensão Temática',
                    desc: 'Análise de aderência ao tema proposto, fugas parciais e aplicação de repertório sociocultural.'
                  },
                  {
                    num: 'C3',
                    title: 'Projeto Argumentativo',
                    desc: 'Coerência na seleção de fatos, organização lógica de ideias e sustentabilidade da tese defendida.'
                  },
                  {
                    num: 'C4',
                    title: 'Mecanismos Coesivos',
                    desc: 'Uso qualificado de conectivos lógicos interparágrafos e intraparágrafos sem repetição de vocábulos.'
                  },
                  {
                    num: 'C5',
                    title: 'Proposta de Intervenção',
                    desc: 'Construção da solução contendo os 5 elementos fundamentais: agente, ação, meio, efeito e detalhamento.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="card p-6 flex flex-col space-y-4">
                    <span className="text-xs font-black w-9 h-9 flex items-center justify-center rounded-xl text-white font-mono" style={{ background: 'var(--color-brand-primary)' }}>
                      {item.num}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--color-brand-dark)] mb-1">{item.title}</h4>
                      <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ============ TECNOLOGIA IA ============ */}
          <section id="sobre" className="py-20 px-6 scroll-mt-20" style={{ background: 'var(--color-brand-dark)' }}>
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 text-white">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                <Cpu className="w-12 h-12 text-[var(--color-brand-primary-light)] animate-pulse" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  Motor de Correção CorrEnem
                </h2>
                <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
                  A nossa plataforma utiliza uma integração com a infraestrutura do **Groq** para processamento em frações de segundos do modelo **Llama 3.3 (70B)**.
                  O corretor virtual funciona como um agente de IA especializado que:
                </p>
                <ul className="text-left text-xs text-slate-300 space-y-2 list-disc pl-5">
                  <li>Valida os limites físicos da prova (linhas escritas, tamanho mínimo de 100 caracteres e coerência do título).</li>
                  <li>Inspeciona o repertório do aluno cruzando dados socioculturais relevantes.</li>
                  <li>Avalia desvios gramaticais de forma isolada, gerando dicas contextuais corretivas imediatas.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* ==================== WORKSPACE / DASHBOARD FLOW ==================== */
        <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">

          {/* ============ DASHBOARD: SUBVIEW HOME ============ */}
          {dashboardSubView === 'home' && (
            <div className="space-y-8 animate-fade-in">
              {/* Top Banner de Ações */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight font-serif text-[var(--color-brand-dark)]">Área do Estudante</h2>
                  <p className="text-xs font-semibold text-[var(--color-brand-muted)]">Acompanhe seu rendimento acadêmico e submeta novos rascunhos para avaliação.</p>
                </div>
                <button
                  onClick={() => setIsModeModalOpen(true)}
                  className="btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Praticar Escrita
                </button>
              </div>

              {/* Seu Sumário (Visão Geral de Rendimento) */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Meu Painel de Progresso</h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Card Total Redações */}
                  <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-[var(--color-brand-border)] flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Total Avaliado</span>
                      <h4 className="text-3xl font-black text-[var(--color-brand-dark)]">{totalCorrigidas}</h4>
                      <p className="text-[10px] font-medium text-[var(--color-brand-muted)]">ensaios avaliados</p>
                    </div>
                    <div className="p-3 bg-[var(--color-brand-primary-pale)] rounded-xl text-[var(--color-brand-primary)]">
                      <History className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card Nota Média */}
                  <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-[var(--color-brand-border)] flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Média Geral</span>
                      <h4 className="text-3xl font-black text-[var(--color-brand-dark)]">{notaMedia}</h4>
                      <p className="text-[10px] font-medium text-[var(--color-brand-muted)]">pontuação acumulada</p>
                    </div>
                    <div className="p-3 bg-[var(--color-brand-amber-pale)] rounded-xl text-[var(--color-brand-amber)]">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card Desempenho por Competência */}
                  <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-[var(--color-brand-border)] flex flex-col shadow-sm min-h-[140px]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)] block mb-3">Análise por competência</span>
                    <div className="flex justify-between items-end gap-1 flex-grow">
                      {[
                        { key: 'c1', label: 'C1', val: mediasCompetencias.c1, color: 'bg-emerald-500' },
                        { key: 'c2', label: 'C2', val: mediasCompetencias.c2, color: 'bg-teal-500' },
                        { key: 'c3', label: 'C3', val: mediasCompetencias.c3, color: 'bg-cyan-500' },
                        { key: 'c4', label: 'C4', val: mediasCompetencias.c4, color: 'bg-amber-500' },
                        { key: 'c5', label: 'C5', val: mediasCompetencias.c5, color: 'bg-indigo-500' }
                      ].map((item) => (
                        <div key={item.key} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full bg-slate-100 rounded-t-md relative" style={{ height: '4rem' }}>
                            <div
                              className={`absolute bottom-0 left-0 right-0 ${item.color} rounded-t-sm transition-all duration-500`}
                              style={{ height: `${(item.val / 200) * 100}%`, minHeight: '4px' }}
                            />
                          </div>
                          <span className="text-[8px] font-extrabold text-[var(--color-brand-muted)] mt-1">{item.label}</span>
                          <span className="absolute -top-6 bg-slate-800 text-white text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow font-mono">
                            {item.val}/200
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Redações Corrigidas */}
              <div id="historico-section" className="space-y-4 scroll-mt-24">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Relatórios de Notas Emitidos</h3>

                <div className="bg-white rounded-2.5xl border border-[var(--color-brand-border)] divide-y divide-[var(--color-brand-border)] overflow-hidden shadow-sm">
                  {essayHistory.length === 0 ? (
                    <div className="p-8 text-center text-xs font-semibold text-[var(--color-brand-muted)]">
                      Nenhum texto avaliado até o momento.
                    </div>
                  ) : (
                    essayHistory.map((essay) => (
                      <div
                        key={essay.id}
                        onClick={() => {
                          setResultado(essay);
                          setDashboardSubView('view_result');
                        }}
                        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--color-brand-surface)] transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Badge Nota */}
                          <div
                            className="w-12 h-12 flex items-center justify-center font-black text-sm rounded-2xl border text-white font-mono shadow-sm shrink-0"
                            style={{
                              background: essay.nota_final >= 800 ? 'var(--color-brand-primary)' : essay.nota_final >= 600 ? 'var(--color-brand-amber)' : 'var(--color-brand-danger)',
                              borderColor: 'rgba(0,0,0,0.05)'
                            }}
                          >
                            {essay.nota_final}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="font-extrabold text-sm text-[var(--color-brand-dark)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {essay.titulo}
                            </h4>
                            <p className="text-[10px] font-semibold text-[var(--color-brand-muted)] truncate flex items-center gap-1.5">
                              <span className="truncate max-w-[250px] inline-block">{essay.tema}</span>
                              <span>•</span>
                              <span>{essay.data}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-[var(--color-brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
                          Consultar Notas →
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Seção Rascunhos */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Rascunhos em Elaboração</h3>
                <div className="bg-white rounded-2.5xl border border-[var(--color-brand-border)] divide-y divide-[var(--color-brand-border)] overflow-hidden shadow-sm">
                  {draftHistory.length === 0 ? (
                    <div className="p-8 text-center text-xs font-semibold text-[var(--color-brand-muted)]">
                      Nenhum rascunho em andamento.
                    </div>
                  ) : (
                    draftHistory.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => {
                          setSelectedTheme({
                            id: draft.id,
                            titulo: draft.tema,
                            desc: 'Rascunho salvo em andamento.',
                            motivadores: null
                          });
                          setWritingMode('padrao');
                          setDashboardSubView('write_essay');
                        }}
                        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--color-brand-surface)] transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 shrink-0 shadow-sm">
                            <BookmarkPlus className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="font-extrabold text-sm text-[var(--color-brand-dark)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {draft.titulo || draft.tema}
                            </h4>
                            <p className="text-[10px] font-semibold text-[var(--color-brand-muted)] truncate flex items-center gap-2">
                              <span>Salvo em: {draft.data}</span>
                              <span>•</span>
                              <span>{draft.linhas || 0} linhas</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-bold text-[var(--color-brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                            Continuar Escrevendo →
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDraft(draft.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Excluir Rascunho"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ============ DASHBOARD: SUBVIEW CHOOSE THEME (STEP 1) ============ */}
          {dashboardSubView === 'choose_theme' && (
            <div className="space-y-8 animate-fade-in">
              {/* Header de Fluxo */}
              <div className="flex items-center justify-between border-b border-[var(--color-brand-border)] pb-5">
                <button
                  onClick={() => setDashboardSubView('home')}
                  className="text-xs font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
                >
                  ← Voltar para a área do aluno
                </button>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-muted)]">
                  <span className="text-[var(--color-brand-primary)]">Passo A: Definir Proposta</span>
                  <span>•</span>
                  <span>Passo B: Produção Textual</span>
                  <span>•</span>
                  <span>Passo C: Diagnóstico de Notas</span>
                </div>
              </div>

              {/* Barra de Busca de Temas */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar temas por eixos de discussão ou termos..."
                  className="input-field py-3.5 rounded-2xl"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>

              {/* Grid de Temas (Estilizado de forma 100% original por eixos, vetores e gradientes - Sem imagens) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card Sorteador Aleatório */}
                <div
                  onClick={handleGerarTemaIA}
                  className="card p-6 flex flex-col justify-between items-start cursor-pointer group bg-gradient-to-br from-[var(--color-brand-primary-pale)] to-transparent"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[var(--color-brand-border)] flex items-center justify-center text-[var(--color-brand-primary)] shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                  <div className="mt-8 space-y-2">
                    <span className="text-[8px] font-black tracking-widest uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Geração Inteligente</span>
                    <h3 className="font-extrabold text-base text-[var(--color-brand-dark)]">Gere um tema com a IA</h3>
                    <p className="text-xs text-[var(--color-brand-muted)] font-medium leading-relaxed">
                      Utilize nossa inteligência artificial para formular um tema ENEM inédito completo.
                    </p>
                  </div>
                </div>

                {/* Card Tema Livre */}
                <div
                  onClick={handleTemaLivre}
                  className="card p-6 flex flex-col justify-between items-start cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] flex items-center justify-center text-[var(--color-brand-muted)] shadow-sm group-hover:scale-105 transition-transform">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div className="mt-8 space-y-2">
                    <span className="text-[8px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Prática Livre</span>
                    <h3 className="font-extrabold text-base text-[var(--color-brand-dark)]">Enunciado Customizado</h3>
                    <p className="text-xs text-[var(--color-brand-muted)] font-medium leading-relaxed">
                      Digite o tema que desejar trabalhar e inicie a folha de redação imediatamente.
                    </p>
                  </div>
                </div>

                {/* Catálogo de temas originais com fotos de fundo */}
                {filteredThemes.map((theme) => {
                  const IconComponent = theme.icon;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleSelecionarTema(theme)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{ minHeight: '200px' }}
                    >
                      {/* Foto de fundo */}
                      {theme.bgImage ? (
                        <img
                          src={theme.bgImage}
                          alt={theme.eixo}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                      )}

                      {/* Overlay degradê escuro de baixo para cima */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/85 transition-all duration-300" />

                      {/* Conteúdo sobre a imagem */}
                      <div className="relative z-10 p-5 h-full flex flex-col justify-between" style={{ minHeight: '200px' }}>
                        {/* Topo: eixo badge */}
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                            {theme.eixo}
                          </span>
                          {/* Ícone */}
                          <div className={`p-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 ${theme.iconColor}`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Baixo: título e desc */}
                        <div className="space-y-1.5 mt-8">
                          <h4 className="font-extrabold text-sm text-white leading-snug drop-shadow">
                            {theme.titulo}
                          </h4>
                          <p className="text-[11px] text-white/75 leading-relaxed font-medium">
                            {theme.desc}
                          </p>
                          {/* Hover CTA */}
                          <div className="flex items-center gap-1 text-[10px] font-bold text-white/0 group-hover:text-white/90 transition-all duration-300 pt-1">
                            <span>Ver tema e textos</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ DASHBOARD: SUBVIEW WRITE ESSAY (STEP 2) ============ */}
          {dashboardSubView === 'write_essay' && selectedTheme && (
            <RedacaoForm
              key={selectedTheme.id}
              onSubmit={handleSubmissaoRedacao}
              loading={loading}
              error={error}
              selectedTheme={selectedTheme}
              onBack={() => setDashboardSubView('choose_theme')}
              writingMode={writingMode}
              roteiroQuestions={roteiroQuestions}
              loadingQuestions={loadingQuestions}
            />
          )}

          {/* ============ DASHBOARD: SUBVIEW VIEW RESULT (STEP 3) ============ */}
          {dashboardSubView === 'view_result' && resultado && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-[var(--color-brand-border)] pb-4">
                <button
                  onClick={() => setDashboardSubView('home')}
                  className="text-xs font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
                >
                  ← Voltar para a área do aluno
                </button>
                <button
                  onClick={() => { setResultado(null); setDashboardSubView('choose_theme'); }}
                  className="text-xs font-bold text-[var(--color-brand-primary)] hover:opacity-80 transition-opacity"
                >
                  Submeter novo ensaio
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Relatório da redação</h3>
                  <ResultadoCard resultado={resultado} />
                </div>
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[var(--color-brand-border)] space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">Informações da prova</h4>
                  <div className="text-xs font-medium space-y-2 text-slate-700">
                    <p><strong>Tema:</strong> {resultado.tema}</p>
                    {resultado.titulo && <p><strong>Título:</strong> {resultado.titulo.replace('TÍTULO: ', '')}</p>}
                    <p><strong>Status:</strong> Corrigida</p>
                    <p><strong>IA Responsável:</strong> Llama 3.3 (70B)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ DASHBOARD: SUBVIEW VIEW EXEMPLAR (EXEMPLAR DE REFERÊNCIA) ============ */}
          {dashboardSubView === 'view_exemplar' && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-[var(--color-brand-border)] pb-4">
                <button
                  onClick={() => setDashboardSubView('choose_theme')}
                  className="text-xs font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Voltar para escolha de tema
                </button>
                <div className="flex items-center gap-2">
                  <span className="badge-primary flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Exemplar de Referência Nota 1000
                  </span>
                </div>
              </div>

              {loadingExemplar ? (
                <div className="bg-white p-16 rounded-3xl border border-[var(--color-brand-border)] text-center space-y-5 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-[var(--color-brand-primary-pale)] border-t-[var(--color-brand-primary)] animate-spin" />
                    <Sparkles className="w-6 h-6 text-[var(--color-brand-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-extrabold text-slate-800">Gerando Redação Modelo Nota 1000...</p>
                    <p className="text-xs text-[var(--color-brand-muted)] font-medium max-w-xs mx-auto leading-relaxed">
                      A IA está redigindo os 4 parágrafos dissertativos e as análises criteriosas por competência. Isso pode levar até 30 segundos.
                    </p>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              ) : exemplarData ? (
                <div className="space-y-6">

                  {/* 1. SEÇÃO DE TEMA EM TEXTAREA ISOLADO */}
                  <div className="bg-white p-5 rounded-2.5xl border border-[var(--color-brand-border)] shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--color-brand-muted)] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
                        Proposta Temática Avaliada (Seção de Tema Isolada)
                      </label>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Proposta Oficial ENEM
                      </span>
                    </div>
                    <textarea
                      readOnly
                      value={exemplarData.tema_titulo || selectedTheme?.titulo || 'Tema da Redação Modelo'}
                      rows={2}
                      className="w-full bg-[var(--color-brand-surface)] p-3.5 rounded-xl border border-[var(--color-brand-border)] text-xs font-bold text-[var(--color-brand-dark)] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* 2. CONTEÚDO PRINCIPAL: REDAÇÃO FORMATADA + ANÁLISES */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Coluna Esquerda: Redação Modelo Formatada */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-brand-dark)] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--color-brand-primary)]" />
                          Redação Dissertativa Ideal
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                          4 Parágrafos • 1000 Pontos
                        </span>
                      </div>

                      <div className="bg-white p-7 rounded-3xl border border-[var(--color-brand-border)] shadow-md space-y-5" style={{ borderLeft: '5px solid var(--color-brand-primary)' }}>
                        {exemplarData.redacao_modelo ? (
                          exemplarData.redacao_modelo.split('\n\n').filter(p => p.trim()).map((paragrafo, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-brand-primary)] bg-[var(--color-brand-primary-pale)] px-2 py-0.5 rounded">
                                  {idx === 0 ? 'Parágrafo 1 — Introdução' : idx === 1 ? 'Parágrafo 2 — Desenvolvimento 1' : idx === 2 ? 'Parágrafo 3 — Desenvolvimento 2' : 'Parágrafo 4 — Conclusão'}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-800 leading-relaxed text-justify indent-6 font-serif pt-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80">
                                {paragrafo.trim()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-700">Redação não disponível.</p>
                        )}
                      </div>
                    </div>

                    {/* Coluna Direita: Análises Criteriosas por Competência */}
                    <div className="lg:col-span-5 space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-brand-dark)] flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Análise Técnica por Competência
                      </h3>

                      <div className="space-y-3.5">
                        {[
                          { comp: 'C1', title: 'Domínio da Norma Culta', score: '200 / 200', desc: exemplarData.analise_c1 },
                          { comp: 'C2', title: 'Compreensão do Tema e Repertório', score: '200 / 200', desc: exemplarData.analise_c2 },
                          { comp: 'C3', title: 'Projeto de Texto e Argumentação', score: '200 / 200', desc: exemplarData.analise_c3 },
                          { comp: 'C4', title: 'Coesão e Conectivos Linguísticos', score: '200 / 200', desc: exemplarData.analise_c4 },
                          { comp: 'C5', title: 'Proposta de Intervenção Completa', score: '200 / 200', desc: exemplarData.analise_c5 }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4.5 bg-white rounded-2.5xl border border-[var(--color-brand-border)] shadow-sm space-y-2">
                            <div className="flex items-center justify-between border-b pb-2">
                              <span className="text-xs font-black uppercase text-[var(--color-brand-dark)] tracking-wider">
                                {item.comp} — {item.title}
                              </span>
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {item.score}
                              </span>
                            </div>
                            <div className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                              <span className="text-[10px] font-extrabold text-[var(--color-brand-primary)] uppercase block tracking-wider">Por que tirou nota máxima?</span>
                              <p>{(item.desc || '').replace(/^Nota 200\/200:\s*/i, '')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* Estado de erro — mostra botão para tentar novamente */
                <div className="bg-white p-12 rounded-3xl border border-red-100 text-center space-y-5 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-extrabold text-slate-800">Não foi possível gerar o exemplar</p>
                    <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                      Houve um problema ao se comunicar com a IA. Verifique se o servidor está ativo e tente novamente.
                    </p>
                  </div>
                  <button
                    onClick={() => selectedTheme && fetchExemplar(selectedTheme.titulo)}
                    className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ============ FOOTER ============ */}
      <footer style={{ borderTop: '1px solid var(--color-brand-border)', background: 'white' }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-base font-black tracking-tight">
              Corr<span style={{ color: 'var(--color-brand-primary)' }}>Enem</span>
            </h1>
            <p className="text-[10px] text-[var(--color-brand-muted)] font-semibold">
              Corretor Inteligente de Redação ENEM • Todos os direitos reservados © 2026
            </p>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold text-[var(--color-brand-muted)]">
            <a href="#como-funciona" className="hover:text-[var(--color-brand-primary)] transition-colors">Termos de Uso</a>
            <a href="#como-funciona" className="hover:text-[var(--color-brand-primary)] transition-colors">Privacidade</a>
            <span style={{ color: 'var(--color-brand-border)' }}>|</span>
            <span className="text-[10px]">Desenvolvido por Iarley Marques</span>
            <span style={{ color: 'var(--color-brand-border)' }}>|</span>
            <a href="https://www.flaticon.com/br/icones-gratis/direitos-autorais" title="direitos autorais ícones" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-primary)] transition-colors text-[9px]">Direitos autorais ícones criados por Magnific - Flaticon</a>
          </div>
        </div>
      </footer>

      {/* ============ MODAL: MODO DE ESCRITA ============ */}
      {isModeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsModeModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl w-full max-w-lg p-8 border border-[var(--color-brand-border)] shadow-2xl animate-slide-down">
            <button
              onClick={() => setIsModeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 space-y-1.5">
              <h3 className="text-xl font-black text-[var(--color-brand-dark)]">Planejamento de Escrita</h3>
              <p className="text-xs font-semibold text-[var(--color-brand-muted)]">Selecione o formato de prática para iniciar o desenvolvimento do texto.</p>
            </div>

            <div className="space-y-4">
              {/* Modo Redação Treino (Ativo) */}
              <div
                onClick={() => {
                  setWritingMode('padrao');
                  setIsModeModalOpen(false);
                  setDashboardSubView('choose_theme');
                }}
                className="p-4 rounded-2xl border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)] bg-white cursor-pointer hover:bg-[var(--color-brand-surface)] transition-all flex items-center gap-4 group"
              >
                <div className="p-3 bg-[var(--color-brand-primary-pale)] rounded-xl text-[var(--color-brand-primary)]">
                  <PenTool className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--color-brand-dark)] group-hover:text-[var(--color-brand-primary)] transition-colors">Modo Dissertativo Padrão</h4>
                  <p className="text-[10px] text-[var(--color-brand-muted)] font-medium mt-0.5">Selecione um tema do banco oficial e execute a escrita livre na plataforma.</p>
                </div>
              </div>

              {/* Outros Modos Desbloqueados */}
              {[
                { mode: 'roteiro', title: 'Roteiro Orientado por Parágrafos', desc: 'Estruture sua redação respondendo perguntas guias para cada parte do texto.', icon: <TrendingUp className="w-6 h-6" /> },
                { mode: 'manuscrito', title: 'Submissão de Manuscrito Digitalizado', desc: 'Envie uma foto de sua folha manuscrita e receba a transcrição e notas por IA.', icon: <FileText className="w-6 h-6" /> },
                { mode: 'exemplar', title: 'Exemplar de Referência por IA', desc: 'Gere uma dissertação modelo nota 1000 baseada na proposta selecionada.', icon: <Sparkles className="w-6 h-6" />, label: 'Exclusivo' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setWritingMode(item.mode);
                    setIsModeModalOpen(false);
                    setDashboardSubView('choose_theme');
                  }}
                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface)] transition-all flex items-center gap-4 cursor-pointer relative group"
                >
                  <div className="p-3 bg-slate-100 group-hover:bg-[var(--color-brand-primary-pale)] rounded-xl text-slate-400 group-hover:text-[var(--color-brand-primary)] transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[var(--color-brand-dark)] group-hover:text-[var(--color-brand-primary)] transition-colors">{item.title}</h4>
                      {item.label && <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">{item.label}</span>}
                    </div>
                    <p className="text-[10px] text-[var(--color-brand-muted)] font-medium mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: PRÉ-VISUALIZAÇÃO DE TEMA (COM MOTIVADORES E FOTO DE FUNDO) ============ */}
      {isPreviewModalOpen && selectedTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop escuro com blur */}
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => setIsPreviewModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl w-full max-w-2xl overflow-hidden border border-[var(--color-brand-border)] shadow-2xl animate-slide-down flex flex-col max-h-[92vh]">

            {/* ===== HERO: Imagem de fundo do tema ===== */}
            <div className="relative shrink-0 h-52 overflow-hidden">
              {/* Gradiente de fallback — sempre visível até a imagem carregar */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${selectedTheme.gradient || 'from-emerald-600/60 to-teal-600/40'}`}
              />
              {/* Foto de fundo do tema (Unsplash) */}
              {selectedTheme.bgImage ? (
                <img
                  key={selectedTheme.bgImage}
                  src={selectedTheme.bgImage}
                  alt={selectedTheme.eixo || 'Tema ENEM'}
                  className="absolute inset-0 w-full h-full object-cover"
                  onLoad={(e) => {
                    // Quando a imagem carrega, mostra ela com fade-in suave
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    // Se falhar, esconde a imagem (o gradiente já está visível)
                    e.currentTarget.style.display = 'none';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.5s ease' }}
                />
              ) : null}

              {/* Overlay escuro degradê sobre a foto para texto legível */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

              {/* Botão fechar em cima da foto */}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Eixo + Título sobre a foto */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 inline-block mb-2">
                  {selectedTheme.eixo || 'Proposta Oficial ENEM'}
                </span>
                <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
                  {selectedTheme.titulo}
                </h3>
              </div>
            </div>

            {/* ===== CONTEÚDO: Textos Motivadores ===== */}
            <div className="p-6 overflow-y-auto space-y-5 flex-grow">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--color-brand-primary)]" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-brand-dark)]">
                  Textos de Apoio e Subsídios
                </h4>
              </div>

              {selectedTheme.motivadores ? (
                <div className="space-y-4">
                  {(() => {
                    // Parser robusto dos blocos de motivadores
                    const raw = selectedTheme.motivadores || '';

                    // Limpa markdown residual
                    const limpo = raw
                      .replace(/#{1,3}\s*/g, '')
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
                      .replace(/_{2}/g, '')
                      .replace(/^[-•]\s+/gm, '')
                      .trim();

                    // Divide por blocos que começam com "TEXTO I", "TEXTO II", etc.
                    // Suporta formatos: "TEXTO I", "TEXTO I —", "TEXTO I:", "TEXTO I -"
                    const blocos = limpo
                      .split(/(?=TEXTO\s+[IVXLC]+[\s\u2014\-:—])/i)
                      .map(b => b.trim())
                      .filter(b => b.length > 10);

                    // Se o split não funcionou, tenta por linha em branco dupla
                    const partes = blocos.length >= 2 ? blocos : limpo.split(/\n{2,}/).filter(b => b.trim().length > 10);

                    return partes.map((bloco, idx) => {
                      const linhas = bloco.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                      const primeiraLinha = linhas[0] || '';
                      const corpo = linhas.slice(1).join(' ').trim() || primeiraLinha;

                      // Extrai cabeçalho (TEXTO X) e subtítulo
                      const matchCabecalho = primeiraLinha.match(/^(TEXTO\s+[IVXLC0-9]+)\s*[\u2014\-—:–]?\s*(.*)?$/i);
                      const cabecalho = matchCabecalho ? matchCabecalho[1].toUpperCase() : `TEXTO ${idx + 1}`;
                      const subtitulo = matchCabecalho ? (matchCabecalho[2] || '').trim() : primeiraLinha;
                      const textoCorpo = linhas.length > 1 ? corpo : '';

                      return (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                          {/* Cabeçalho */}
                          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-primary)] bg-[var(--color-brand-primary-pale)] px-2.5 py-1 rounded-full whitespace-nowrap">
                              {cabecalho}
                            </span>
                            {subtitulo && (
                              <span className="text-xs font-semibold text-slate-600 truncate">
                                {subtitulo}
                              </span>
                            )}
                          </div>
                          {/* Corpo do texto */}
                          <div className="p-5 bg-white">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {textoCorpo || corpo}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-brand-muted)] font-medium italic">
                  Nenhum texto de apoio disponibilizado para esta modalidade livre. Você poderá escrever livremente sobre o tema.
                </p>
              )}

              {/* Instrução oficial */}
              <div className="p-4 bg-[var(--color-brand-primary-pale)] rounded-2xl text-sm font-medium text-[var(--color-brand-primary)] flex items-start gap-3 border border-[color-mix(in_srgb,var(--color-brand-primary)_20%,transparent)]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  A partir da leitura dos textos de apoio e dos seus saberes construídos ao longo da formação acadêmica, elabore uma dissertação argumentativa em norma culta, com proposta de intervenção detalhada.
                </p>
              </div>
            </div>

            {/* ===== AÇÕES ===== */}
            <div className="p-5 border-t border-[var(--color-brand-border)] bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
              {isAIThemeActive && (
                <button
                  onClick={handleGerarTemaIA}
                  className="btn-secondary text-sm py-2.5 px-5 border-amber-300 text-amber-800 hover:bg-amber-50"
                  disabled={loading}
                >
                  {loading ? 'Gerando...' : 'Gerar outro'}
                </button>
              )}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="btn-secondary text-sm py-2.5 px-5"
              >
                Retornar
              </button>
              <button
                onClick={handleConfirmarTema}
                className="btn-primary text-sm py-2.5 px-6"
              >
                {writingMode === 'exemplar' ? 'Gerar Exemplar Modelo' : 'Escrever sobre este tema'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
