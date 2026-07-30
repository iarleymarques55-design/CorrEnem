/**
 * Componente ResultadoCard (Relatório de Avaliação do ENEM)
 * Exibe a nota final (0-1000), detalhamento das 5 competências com feedbacks/sugestões,
 * comentário geral da banca e marcação interativa de desvios no texto original.
 */
import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Sparkles, TrendingUp, PenTool, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const COMPETENCIAS_META = [
  {
    key: 'competencia1',
    id: 'C1',
    title: 'Competência 1',
    desc: 'Domínio da norma culta da língua escrita',
  },
  {
    key: 'competencia2',
    id: 'C2',
    title: 'Competência 2',
    desc: 'Compreensão da proposta e uso de repertório',
  },
  {
    key: 'competencia3',
    id: 'C3',
    title: 'Competência 3',
    desc: 'Seleção, relação e organização das ideias',
  },
  {
    key: 'competencia4',
    id: 'C4',
    title: 'Competência 4',
    desc: 'Coesão e coerência no desenvolvimento',
  },
  {
    key: 'competencia5',
    id: 'C5',
    title: 'Competência 5',
    desc: 'Proposta de intervenção viável e detalhada',
  },
];

function getNotaConfig(nota) {
  if (nota >= 180) return { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', label: 'Excelente', bar: 'var(--color-brand-success)' };
  if (nota >= 140) return { bg: 'var(--color-brand-primary-pale)', border: '#6EE7CE', text: 'var(--color-brand-primary)', label: 'Muito Bom', bar: 'var(--color-brand-primary)' };
  if (nota >= 100) return { bg: 'var(--color-brand-amber-pale)', border: '#FCD34D', text: '#92400E', label: 'Regular', bar: 'var(--color-brand-amber)' };
  if (nota >= 60) return { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', label: 'Insuficiente', bar: '#F97316' };
  return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: 'Crítico', bar: 'var(--color-brand-danger)' };
}

function getNotaFinalConfig(nota) {
  if (nota >= 800) return { bg: 'var(--color-brand-primary-pale)', border: 'color-mix(in srgb, var(--color-brand-primary) 25%, transparent)', text: 'var(--color-brand-primary)', label: 'Desempenho Excepcional' };
  if (nota >= 600) return { bg: 'var(--color-brand-amber-pale)', border: 'color-mix(in srgb, var(--color-brand-amber) 25%, transparent)', text: 'var(--color-brand-amber)', label: 'Bom Desempenho' };
  if (nota >= 400) return { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', label: 'Desempenho Regular' };
  return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: 'Precisa Melhorar' };
}

export default function ResultadoCard({ resultado }) {
  const [expandedComp, setExpandedComp] = useState(null);
  const [activeDesvio, setActiveDesvio] = useState(null);
  const [verComoCorrigir, setVerComoCorrigir] = useState(false);
  const [showNotaExplicacao, setShowNotaExplicacao] = useState(false);

  if (!resultado) return null;

  const finalConfig = getNotaFinalConfig(resultado.nota_final);
  const pct = Math.round((resultado.nota_final / 1000) * 100);

  // Helper to render text with highlighted error spans
  const renderTextoComDestaques = (texto, desvios) => {
    if (!desvios || desvios.length === 0) return texto;

    let matches = [];
    desvios.forEach((d, dIdx) => {
      let index = texto.indexOf(d.trecho);
      while (index !== -1) {
        const start = index;
        const end = index + d.trecho.length;
        // Avoid overlapping matching ranges
        const isOverlap = matches.some(m => (start >= m.start && start < m.end) || (end > m.start && end <= m.end));
        if (!isOverlap) {
          matches.push({ start, end, desvio: d, dIdx });
        }
        index = texto.indexOf(d.trecho, index + 1);
      }
    });

    // Sort occurrences by start index
    matches.sort((a, b) => a.start - b.start);

    let result = [];
    let lastIndex = 0;
    matches.forEach((m, idx) => {
      if (m.start > lastIndex) {
        result.push(texto.substring(lastIndex, m.start));
      }
      result.push(
        <span
          key={`desvio-${idx}-${m.dIdx}`}
          onClick={() => {
            setActiveDesvio(m.desvio);
            setVerComoCorrigir(false);
          }}
          className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-900 border-b-2 border-red-500 px-1 py-0.5 rounded transition-all duration-200 font-bold inline-block"
          title="Clique para ver o desvio e como corrigir"
        >
          {texto.substring(m.start, m.end)}
        </span>
      );
      lastIndex = m.end;
    });

    if (lastIndex < texto.length) {
      result.push(texto.substring(lastIndex));
    }

    return result;
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Nota Geral */}
      <div
        className="rounded-2xl p-6 flex flex-col justify-between gap-5"
        style={{
          background: finalConfig.bg,
          border: `1.5px solid ${finalConfig.border}`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Trophy className="w-5 h-5" style={{ color: finalConfig.text }} />
              <h2 className="text-lg font-extrabold" style={{ color: finalConfig.text }}>
                {finalConfig.label}
              </h2>
            </div>
            <p className="text-xs font-medium opacity-80" style={{ color: finalConfig.text }}>
              Avaliação baseada nos critérios oficiais da banca do ENEM.
            </p>
            {/* Mini progress */}
            <div className="mt-2 w-40 mx-auto sm:mx-0">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                <div
                  className="h-full rounded-full animate-progress"
                  style={{ width: `${pct}%`, background: finalConfig.text }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold mt-1 opacity-60" style={{ color: finalConfig.text }}>
                <span>0</span>
                <span>{pct}%</span>
                <span>1000</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end shrink-0">
            <div
              className="flex items-baseline gap-1.5 px-7 py-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <span className="text-5xl font-black tracking-tight animate-count" style={{ color: finalConfig.text }}>
                {resultado.nota_final}
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-brand-muted)' }}>/ 1000</span>
            </div>

            <button
              onClick={() => setShowNotaExplicacao(!showNotaExplicacao)}
              className="mt-3 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 bg-white border border-[var(--color-brand-border)] hover:bg-slate-50"
              style={{ color: finalConfig.text }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showNotaExplicacao ? 'Ocultar Explicação' : 'Explicar Nota'}
            </button>
          </div>
        </div>

        {/* Box da Explicação da Nota por IA */}
        {showNotaExplicacao && (
          <div className="p-4 bg-white/70 backdrop-blur border border-white/80 rounded-xl text-xs font-semibold leading-relaxed animate-slide-down space-y-1.5" style={{ color: 'var(--color-brand-dark)' }}>
            <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-brand-muted)]">Explicação Detalhada do Corretor</span>
            <p>{resultado.explicacao_nota_final || "Sua nota foi gerada a partir da soma dos critérios avaliados pelas Competências 1 a 5 da grade oficial do ENEM."}</p>
          </div>
        )}
      </div>

      {/* Texto Original com highlights */}
      {resultado.texto_original && (
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'white', border: '1px solid var(--color-brand-border)' }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="font-bold text-sm flex items-center gap-2"
              style={{ color: 'var(--color-brand-dark)' }}
            >
              <PenTool className="w-4 h-4" style={{ color: 'var(--color-brand-primary)' }} />
              Seu Texto Original
            </h3>
            {resultado.desvios && resultado.desvios.length > 0 && (
              <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wider">
                {resultado.desvios.length} desvios sinalizados
              </span>
            )}
          </div>
          
          <div
            className="p-5 rounded-xl text-xs leading-relaxed font-medium whitespace-pre-wrap max-h-96 overflow-y-auto"
            style={{
              background: 'var(--color-brand-surface)',
              border: '1px solid var(--color-brand-border)',
              color: 'var(--color-brand-dark)'
            }}
          >
            {renderTextoComDestaques(resultado.texto_original, resultado.desvios)}
          </div>

          {/* Painel do Desvio Ativo / Marcado */}
          {activeDesvio && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 animate-slide-down space-y-3 relative">
              <button 
                onClick={() => { setActiveDesvio(null); setVerComoCorrigir(false); }}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
              >
                [fechar]
              </button>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200">
                  {activeDesvio.erro}
                </span>
                <p className="text-xs font-bold text-slate-800 mt-2">
                  No trecho: <span className="line-through text-red-500">"{activeDesvio.trecho}"</span>
                </p>
              </div>

              {!verComoCorrigir ? (
                <button
                  type="button"
                  onClick={() => setVerComoCorrigir(true)}
                  className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Como corrigir isso?
                </button>
              ) : (
                <div className="p-3 bg-white border border-red-100 rounded-lg space-y-2 animate-fade-in">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Explicação:</strong> {activeDesvio.explicacao}
                  </p>
                  <p className="text-xs text-slate-800 font-bold bg-emerald-50 text-emerald-950 p-2.5 rounded border border-emerald-100">
                    <strong>Correção sugerida:</strong> "{activeDesvio.correcao}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comentário Geral */}
      <div
        className="rounded-2xl p-6 space-y-3"
        style={{ background: 'white', border: '1px solid var(--color-brand-border)' }}
      >
        <h3
          className="font-bold text-sm flex items-center gap-2"
          style={{ color: 'var(--color-brand-dark)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-brand-amber)' }} />
          Avaliação do Corretor IA
        </h3>
        <p
          className="text-sm leading-relaxed font-medium p-4 rounded-xl"
          style={{
            background: 'var(--color-brand-surface)',
            border: '1px solid var(--color-brand-border)',
            color: 'var(--color-brand-muted)'
          }}
        >
          {resultado.comentario_geral}
        </p>
      </div>

      {/* Competências */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--color-brand-border)' }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ background: 'white', borderBottom: '1px solid var(--color-brand-border)' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-brand-primary)' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-brand-dark)' }}>
            Notas por Competência
          </h3>
        </div>

        <div style={{ background: 'white' }}>
          {COMPETENCIAS_META.map((comp, idx) => {
            const details = resultado[comp.key];
            if (!details) return null;
            const cfg = getNotaConfig(details.nota);
            const isExpanded = expandedComp === idx;
            const pctComp = Math.round((details.nota / 200) * 100);

            // Filter desvios for this competency
            const desviosDaComp = (resultado.desvios || []).filter(d => d.competencia === comp.key);

            return (
              <div
                key={comp.key}
                style={{ borderBottom: idx < COMPETENCIAS_META.length - 1 ? '1px solid var(--color-brand-border)' : 'none' }}
              >
                <button
                  onClick={() => setExpandedComp(isExpanded ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 cursor-pointer transition-colors"
                  style={{ background: isExpanded ? 'var(--color-brand-surface)' : 'white' }}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--color-brand-surface)'; }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'white'; }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded font-mono shrink-0"
                        style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                      >
                        {comp.id}
                      </span>
                      <h4 className="font-bold text-sm truncate" style={{ color: 'var(--color-brand-dark)' }}>
                        {comp.title}
                      </h4>
                    </div>
                    {/* Mini progress bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--color-brand-border)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pctComp}%`, background: cfg.bar }}
                        />
                      </div>
                      <span className="text-[9px] font-bold shrink-0" style={{ color: 'var(--color-brand-muted)' }}>
                        {pctComp}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-xs font-extrabold px-3 py-1 rounded-full font-mono animate-fade-in"
                      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                    >
                      {details.nota} / 200
                    </span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-brand-muted)' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-brand-muted)' }} />
                    }
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="px-5 pb-6 pt-4 space-y-4 animate-fade-in"
                    style={{ borderTop: '1px solid var(--color-brand-border)', background: 'var(--color-brand-surface)' }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-brand-muted)' }}>
                      {comp.desc}
                    </p>

                    <div
                      className="p-4 rounded-xl text-xs leading-relaxed font-medium"
                      style={{
                        background: 'white',
                        border: '1px solid var(--color-brand-border)',
                        color: 'var(--color-brand-muted)'
                      }}
                    >
                      <strong className="block mb-1.5 text-[var(--color-brand-dark)]">📋 Feedback Detalhado:</strong>
                      {details.feedback}
                    </div>

                    <div
                      className="p-4 rounded-xl text-xs leading-relaxed font-medium"
                      style={{
                        background: 'var(--color-brand-primary-pale)',
                        border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)',
                        color: 'var(--color-brand-primary)'
                      }}
                    >
                      <strong className="block mb-1.5" style={{ color: 'var(--color-brand-dark)' }}>💡 Dica para Melhorar:</strong>
                      {details.sugestoes}
                    </div>

                    {/* Desvios da Competência */}
                    {desviosDaComp.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <span className="text-[10px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Desvios identificados nesta competência:
                        </span>
                        <div className="space-y-2">
                          {desviosDaComp.map((d, dIdx) => (
                            <div key={dIdx} className="p-3.5 bg-white border border-red-100 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                <span className="font-extrabold text-red-600 uppercase text-[9px] tracking-wider bg-red-50 px-2 py-0.5 rounded">{d.erro}</span>
                              </div>
                              <p className="font-medium text-slate-700">
                                No trecho: <span className="line-through text-red-500 font-mono">"{d.trecho}"</span>
                              </p>
                              <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                                <strong>Por que está errado:</strong> {d.explicacao}
                              </p>
                              <p className="text-emerald-950 font-bold bg-emerald-50 p-2.5 rounded border border-emerald-100">
                                <strong>Sugestão Correta:</strong> "{d.correcao}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
