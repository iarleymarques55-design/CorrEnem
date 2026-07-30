/**
 * Componente ComoFunciona (Seção Explicativa da Landing Page)
 * Apresenta em 3 passos visuais o fluxo de uso da plataforma CorrEnem:
 * 1. Escolha/Criação do tema -> 2. Escrita em ambiente simulação -> 3. Recebimento do diagnóstico das 5 competências.
 */
import React from 'react';
import { Compass, PenTool, CheckCircle, ArrowRight } from 'lucide-react';

const passos = [
  {
    icon: Compass,
    step: '01',
    title: 'Escolha ou escreva o tema',
    desc: 'Selecione entre propostas contemporâneas baseadas em apostas para o próximo ENEM, ou insira seu próprio enunciado personalizado.',
    color: 'var(--color-brand-primary)',
    pale: 'var(--color-brand-primary-pale)',
  },
  {
    icon: PenTool,
    step: '02',
    title: 'Desenvolva sua redação',
    desc: 'Escreva na nossa área de texto com contador de palavras, caracteres e estimativa de linhas em tempo real — igual ao ambiente da prova.',
    color: 'var(--color-brand-amber)',
    pale: 'var(--color-brand-amber-pale)',
  },
  {
    icon: CheckCircle,
    step: '03',
    title: 'Receba a grade ENEM',
    desc: 'Em segundos o modelo Llama 3.3 retorna sua pontuação nas 5 competências com feedbacks detalhados e dicas práticas de melhoria.',
    color: 'var(--color-brand-success)',
    pale: '#ECFDF5',
  },
];

export default function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      className="py-20 px-6"
      style={{
        background: 'white',
        borderTop: '1px solid var(--color-brand-border)',
        borderBottom: '1px solid var(--color-brand-border)',
        scrollMarginTop: '80px',
      }}
    >
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Cabeçalho */}
        <div className="text-center space-y-4">
          <span className="badge-primary inline-flex mx-auto">
            <span className="text-[10px]">✦</span>
            Fluxo de Aprendizado
          </span>
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Do rascunho ao feedback em{' '}
            <span className="text-gradient">3 passos simples</span>
          </h2>
          <p className="text-sm text-[var(--color-brand-muted)] max-w-xl mx-auto font-medium leading-relaxed">
            Nossa plataforma foi desenhada para ser tão direta quanto poderosa. Sem curva de aprendizado,
            sem burocracia — só você e sua evolução na escrita.
          </p>
        </div>

        {/* Cards dos passos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Linha conectora (desktop) */}
          <div
            className="hidden md:block absolute top-12 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px"
            style={{ background: 'linear-gradient(90deg, var(--color-brand-border), var(--color-brand-primary), var(--color-brand-border))' }}
          />

          {passos.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="card p-8 flex flex-col items-center text-center space-y-5 relative"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Número sobreposto */}
                <div
                  className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2"
                  style={{
                    background: p.pale,
                    color: p.color,
                    border: `1px solid color-mix(in srgb, ${p.color} 20%, transparent)`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Passo {p.step}
                </div>

                {/* Ícone */}
                <div
                  className="p-4 rounded-2xl mt-2"
                  style={{
                    background: p.pale,
                    border: `1px solid color-mix(in srgb, ${p.color} 15%, transparent)`
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: p.color }} />
                </div>

                {/* Texto */}
                <div className="space-y-2">
                  <h3
                    className="font-extrabold text-base tracking-tight"
                    style={{ color: 'var(--color-brand-dark)' }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed font-medium"
                    style={{ color: 'var(--color-brand-muted)' }}
                  >
                    {p.desc}
                  </p>
                </div>

                {/* Seta (exceto último) */}
                {idx < passos.length - 1 && (
                  <div
                    className="hidden md:flex absolute -right-3 top-12 w-6 h-6 rounded-full items-center justify-center z-10"
                    style={{
                      background: 'white',
                      border: '1px solid var(--color-brand-border)',
                      color: 'var(--color-brand-primary)',
                    }}
                  >
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
