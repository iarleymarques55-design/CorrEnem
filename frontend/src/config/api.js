/**
 * Configuração da URL Base da API FastAPI
 * Permite alternar dinamicamente entre ambiente local (localhost:8000)
 * e o ambiente de produção em nuvem (Railway / Vercel) via variável VITE_API_URL.
 */
export const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
