/**
 * Componente RedacaoForm (Formulário e Editor de Redação)
 * Permite a escrita da redação em folha pautada, contagem de linhas e palavras em tempo real,
 * upload/transcrição de manuscrito com validação por IA e suporte ao modo Roteiro Orientado.
 */
import React, { useState, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ArrowLeft, BookOpen, Check, Upload, HelpCircle, FileText, Image as ImageIcon, BookmarkPlus, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function RedacaoForm({ 
  onSubmit, 
  loading, 
  error, 
  selectedTheme, 
  onBack,
  writingMode = 'padrao',
  roteiroQuestions = null,
  loadingQuestions = false,
  onSaveDraft
}) {
  const [titulo, setTitulo] = useState('');
  const RECUO = '          '; // 10 espaços para recuo de parágrafo
  const [texto, setTexto] = useState(RECUO); // já começa com recuo na primeira linha
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [verMotivadores, setVerMotivadores] = useState(false);
  const [draftSuccessMsg, setDraftSuccessMsg] = useState('');

  // Manuscrito upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrStatus, setOcrStatus] = useState(''); // 'sucesso' | 'invalido' | 'ilegivel'

  // Calcula contadores de texto
  useEffect(() => {
    setCharCount(texto.length);
    const words = texto.trim() ? texto.trim().split(/\s+/).length : 0;
    setWordCount(words);
    
    const lines = texto.split('\n');
    setLineCount(texto ? lines.length : 0);
  }, [texto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (texto.trim().length < 100) return;
    
    const textoFinal = titulo.trim() ? `TÍTULO: ${titulo}\n\n${texto}` : texto;
    onSubmit({
      tema: selectedTheme.titulo || 'Tema Livre',
      texto: textoFinal
    });
  };

  const handleSalvarRascunho = () => {
    if (!texto.trim()) return;
    if (onSaveDraft) {
      onSaveDraft({
        id: `draft_${Date.now()}`,
        tema: selectedTheme.titulo || 'Tema Livre',
        titulo: titulo || selectedTheme.titulo,
        texto: texto,
        linhas: lineCount,
        data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      });
      setDraftSuccessMsg('Rascunho salvo com sucesso!');
      setTimeout(() => setDraftSuccessMsg(''), 2500);
    }
  };

  // Upload/Transcription handler for manuscrito
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setOcrError('');
      setOcrStatus('');
    }
  };

  const handleTranscreverManuscrito = async () => {
    if (!selectedFile) return;
    setLoadingOcr(true);
    setOcrError('');
    setOcrStatus('');
    try {
      const formData = new FormData();
      formData.append('imagem', selectedFile);
      formData.append('metadata', JSON.stringify({ tema: selectedTheme.titulo }));
      
      const response = await axios.post(`${API_BASE_URL}/transcrever-manuscrito`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const resData = response.data;
      if (resData.valido === false) {
        setOcrStatus(resData.status || 'invalido');
        setOcrError(resData.mensagem || 'A imagem enviada não é uma imagem válida de folha de redação.');
      } else if (resData.texto_transcrito) {
        setTexto(resData.texto_transcrito);
        setOcrStatus('sucesso');
      } else {
        setOcrStatus('invalido');
        setOcrError('Não foi possível obter a transcrição da imagem.');
      }
    } catch (err) {
      console.error(err);
      setOcrStatus('invalido');
      setOcrError('Erro na conexão com o servidor de OCR. Verifique o arquivo enviado.');
    } finally {
      setLoadingOcr(false);
    }
  };

  const isTextTooShort = texto.trim().length > 0 && texto.trim().length < 100;
  const isOverLimit = lineCount > 30;

  const linhasArray = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Barra superior de controle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[var(--color-brand-border)]">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[var(--color-brand-primary)] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para escolha do tema
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {selectedTheme.motivadores && (
            <button
              type="button"
              onClick={() => setVerMotivadores(!verMotivadores)}
              className="text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[var(--color-brand-muted)] border border-[var(--color-brand-border)] px-3 py-1.5 rounded-xl hover:bg-[var(--color-brand-surface)] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {verMotivadores ? 'Ocultar Motivadores' : 'Textos Motivadores'}
            </button>
          )}

          {/* Botão Salvar como Rascunho */}
          <button
            type="button"
            onClick={handleSalvarRascunho}
            disabled={!texto.trim()}
            className="text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-[var(--color-brand-border)] px-3 py-1.5 rounded-xl transition-all hover:bg-slate-50 text-[var(--color-brand-dark)]"
            style={{ opacity: !texto.trim() ? 0.5 : 1, cursor: !texto.trim() ? 'not-allowed' : 'pointer' }}
          >
            <BookmarkPlus className="w-4 h-4 text-amber-600" />
            Salvar como Rascunho
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || isTextTooShort || texto.trim().length === 0 || isOverLimit}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              opacity: (loading || isTextTooShort || texto.trim().length === 0 || isOverLimit) ? 0.5 : 1,
              cursor: (loading || isTextTooShort || texto.trim().length === 0 || isOverLimit) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {loading ? 'Avaliando...' : 'Corrigir Redação'}
          </button>
        </div>
      </div>

      {draftSuccessMsg && (
        <div className="p-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {draftSuccessMsg}
        </div>
      )}

      {/* Exibição Lateral de Textos Motivadores */}
      {verMotivadores && selectedTheme.motivadores && (
        <div className="bg-[var(--color-brand-amber-pale)] border border-amber-200 p-5 rounded-2xl animate-slide-down space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--color-brand-amber)]">
            Textos Motivadores
          </h4>
          <div className="text-xs font-medium leading-relaxed whitespace-pre-line text-slate-700 max-h-60 overflow-y-auto pr-2">
            {selectedTheme.motivadores}
          </div>
        </div>
      )}

      {/* MODAL / CONTAINER PARA O ROTEIRO ORIENTADO */}
      {writingMode === 'roteiro' && (
        <div className="bg-white p-5 rounded-2xl border border-[var(--color-brand-primary)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Sparkles className="w-4 h-4 text-[var(--color-brand-primary)]" />
            <h4 className="text-sm font-extrabold text-[var(--color-brand-dark)] uppercase tracking-wider">
              Roteiro Orientado de Redação IA
            </h4>
          </div>

          {loadingQuestions ? (
            <div className="text-xs text-[var(--color-brand-muted)] font-semibold flex items-center gap-2 py-2">
              <Sparkles className="w-4 h-4 animate-spin text-[var(--color-brand-primary)]" />
              IA gerando perguntas de planejamento estrutural...
            </div>
          ) : roteiroQuestions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: '1º Parágrafo (Introdução)', q: roteiroQuestions.pergunta1, bg: 'bg-blue-50/60 border-blue-100 text-blue-900' },
                { title: '2º Parágrafo (Desenv. 1)', q: roteiroQuestions.pergunta2, bg: 'bg-emerald-50/60 border-emerald-100 text-emerald-900' },
                { title: '3º Parágrafo (Desenv. 2)', q: roteiroQuestions.pergunta3, bg: 'bg-purple-50/60 border-purple-100 text-purple-900' },
                { title: '4º Parágrafo (Conclusão)', q: roteiroQuestions.pergunta4, bg: 'bg-amber-50/60 border-amber-100 text-amber-950' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${item.bg} space-y-1.5`}>
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-80">{item.title}</span>
                  <p className="text-xs font-bold leading-relaxed">{item.q}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-red-500">Erro ao carregar roteiro estruturado.</p>
          )}
        </div>
      )}

      {/* UPLOAD DE IMAGEM PARA O SUB-MODO MANUSCRITO */}
      {writingMode === 'manuscrito' && (
        <div className="bg-white p-5 rounded-2xl border border-[var(--color-brand-border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <FileText className="w-4 h-4 text-[var(--color-brand-primary)]" />
            <h4 className="text-sm font-extrabold text-[var(--color-brand-dark)] uppercase tracking-wider">
              Envio de Folha Escrita à Mão
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Drop Zone */}
            <div className="relative border-2 border-dashed border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)] rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px] bg-[var(--color-brand-surface)]">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Selecione ou arraste a foto da folha</span>
              <span className="text-[10px] text-[var(--color-brand-muted)] font-medium mt-1">Formatos suportados: PNG, JPG (máx. 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Preview e Botão de Ação */}
            <div className="space-y-3">
              {filePreview ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border">
                    <img src={filePreview} alt="Manuscrito Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] font-medium text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-xl text-center text-xs font-semibold text-[var(--color-brand-muted)] bg-slate-50">
                  Nenhuma imagem carregada ainda.
                </div>
              )}

              <button
                type="button"
                onClick={handleTranscreverManuscrito}
                disabled={!selectedFile || loadingOcr}
                className="btn-primary w-full justify-center text-xs py-3"
                style={{
                  opacity: (!selectedFile || loadingOcr) ? 0.6 : 1,
                  cursor: (!selectedFile || loadingOcr) ? 'not-allowed' : 'pointer'
                }}
              >
                {loadingOcr ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Transcrevendo texto com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Transcrever e Preencher Folha
                  </>
                )}
              </button>
            </div>
          </div>

          {ocrError && (
            <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-bold animate-slide-down ${
              ocrStatus === 'invalido' 
                ? 'bg-red-50 text-red-800 border-red-200' 
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block uppercase text-[10px] tracking-wider mb-0.5">
                  {ocrStatus === 'invalido' ? 'Imagem Inválida' : 'Imagem Ilegível / Sem Foco'}
                </span>
                <p>{ocrError}</p>
              </div>
            </div>
          )}

          {ocrStatus === 'sucesso' && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-slide-down">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Imagem válida transcrevida com sucesso! O texto foi preenchido na folha pautada abaixo.</span>
            </div>
          )}
        </div>
      )}

      {/* Formulário com folha pautada */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tema Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-[var(--color-brand-border)] space-y-1.5">
          <span className="badge-primary inline-flex">Tema Selecionado</span>
          <h3 className="font-black text-sm tracking-tight text-[var(--color-brand-dark)]">
            {selectedTheme.titulo}
          </h3>
        </div>

        {/* Título opcional da redação */}
        <div>
          <label htmlFor="titulo-redacao" className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)] mb-1.5">
            Título da Redação (Opcional)
          </label>
          <input
            id="titulo-redacao"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: O papel regulador do Estado perante a tecnologia"
            className="input-field"
            disabled={loading || loadingOcr}
          />
        </div>

        {/* Área de folha pautada */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-muted)]">
              Folha Oficial (Máximo 30 linhas)
            </span>
            <div className="flex gap-4 text-xs font-bold">
              <span style={{ color: isOverLimit ? 'var(--color-brand-danger)' : 'var(--color-brand-muted)' }}>
                {lineCount} / 30 linhas
              </span>
              <span className="text-[var(--color-brand-muted)]">
                {wordCount} palavras
              </span>
            </div>
          </div>

          <div className="redacao-folha-container rounded-2.5xl overflow-hidden flex">
            {/* Números da linha no lado esquerdo */}
            <div className="w-10 select-none bg-slate-50/50 border-r border-[var(--color-brand-border)] flex flex-col items-center pt-4 pr-1 text-slate-400">
              {linhasArray.map((num) => (
                <span 
                  key={num} 
                  className="redacao-linha-numero text-right w-full block pr-2"
                  style={{
                    color: num === lineCount ? 'var(--color-brand-primary)' : num > 30 ? 'var(--color-brand-danger)' : ''
                  }}
                >
                  {num}
                </span>
              ))}
            </div>

            {/* Área de escrita */}
            <div className="flex-1 bg-transparent p-4 pt-4 relative">
              <textarea
                value={texto}
                onChange={(e) => {
                  const val = e.target.value;
                  const lines = val.split('\n');
                  if (lines.length <= 32) {
                    setTexto(val);
                  }
                }}
                onKeyDown={(e) => {
                  // Enter → nova linha com recuo automático de parágrafo
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const ta = e.target;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const currentVal = texto;
                    const lines = currentVal.split('\n');
                    if (lines.length < 32) {
                      const novoVal = currentVal.substring(0, start) + '\n' + RECUO + currentVal.substring(end);
                      setTexto(novoVal);
                      // Posicionar cursor após o recuo
                      requestAnimationFrame(() => {
                        ta.selectionStart = start + 1 + RECUO.length;
                        ta.selectionEnd = start + 1 + RECUO.length;
                      });
                    }
                  }
                }}
                rows={30}
                placeholder=""
                className="w-full h-full redacao-textarea-folha focus:outline-none"
                style={{
                  height: '66rem',
                  lineHeight: '2.2rem',
                }}
                disabled={loading || loadingOcr}
                required
              />
            </div>
          </div>
        </div>

        {/* Alertas */}
        {isTextTooShort && (
          <div className="p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 bg-[var(--color-brand-amber-pale)] border border-amber-200">
            <AlertCircle className="w-4 h-4 text-[var(--color-brand-amber)] shrink-0 mt-0.5" />
            <p className="text-slate-800">O texto está muito curto (mínimo 100 caracteres) para ser corrigido adequadamente.</p>
          </div>
        )}

        {isOverLimit && (
          <div className="p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="w-4 h-4 text-[var(--color-brand-danger)] shrink-0 mt-0.5" />
            <p>Sua redação excedeu o limite máximo de 30 linhas permitidas na prova do ENEM.</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="w-4 h-4 text-[var(--color-brand-danger)] shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
