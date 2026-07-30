# 🎨 Documentação Completa do Front-end — CorrEnem

O **CorrEnem** possui uma interface moderna, responsiva e de alta fidelidade visual para auxiliar estudantes na escrita, correção e acompanhamento de desempenho para a redação do ENEM.

---

## 🚀 1. Visão Geral & Tecnologias Utilizadas

O front-end foi construído com arquitetura baseada em componentes funcionais do React e ferramentas de build extremamente velozes.

| Tecnologia | Versão / Biblioteca | Finalidade |
| :--- | :--- | :--- |
| **React** | `^19.2.7` | Framework de interface reativa baseado em componentes funcionais e Hooks |
| **Vite** | `^8.1.1` | Bundler e ambiente de desenvolvimento ultrarrápido (HMR) |
| **Tailwind CSS** | `^4.3.3` (`@tailwindcss/vite`) | Framework utilitário de estilização, responsável pelo design responsivo e temas |
| **Lucide React** | `^1.25.0` | Conjunto de ícones vetoriais modernos e leves |
| **Axios** | `^1.18.1` | Cliente HTTP baseado em Promessas para consumo da API FastAPI |
| **Oxlint** | `^1.71.0` | Linter de código em JS/JSX para garantia de qualidade e padronização |

---

## 📁 2. Estrutura de Arquivos e Componentes

A estrutura de diretórios do front-end está organizada da seguinte forma:

```
frontend/
├── index.html                # Ponto de entrada HTML e meta-tags SEO
├── package.json              # Dependências e scripts de execução/build
├── vite.config.js            # Configuração do bundler Vite e plugins
└── src/
    ├── main.jsx              # Renderização inicial do React no DOM
    ├── index.css             # Design System, variáveis de cor HSL/CSS e utilitários globais
    ├── App.jsx               # Componente Raiz, controle de estado global e navegação por abas
    └── components/
        ├── Header.jsx        # Barra superior com logo, navegação, tema e perfil
        ├── AuthModal.jsx     # Modal de Autenticação (Login, Cadastro, Reset de Senha, Google OAuth)
        ├── RedacaoForm.jsx   # Formulário de Redação (Folha Pautada, OCR Manuscrito, Roteiro)
        ├── ResultadoCard.jsx # Exibição de Notas (C1-C5), Feedbacks, Desvios e Sugestões
        ├── ProfileEditModal.jsx # Modal para edição do perfil do usuário e senha
        └── ComoFunciona.jsx  # Guia explicativo dos critérios de correção e recursos
```

---

## 🧩 3. Componentes Detalhados

### 🔹 `App.jsx` (Gerenciador da Aplicação)
- **Função**: Controla a navegação principal entre as seções (*Início*, *Praticar/Nova Redação*, *Histórico*, *Perfil* e *Anotações/Rascunhos*).
- **Estado Global**: Armazena o estado do usuário logado, histórico de redações corrigidas e rascunhos em andamento.
- **Funcionalidades Integradas**:
  - Geração automática de temas via IA (com integração Unsplash para imagem de capa e textos motivadores).
  - Geração de redações modelo Nota 1000 com justificativas por competência.
  - Sincronização em tempo real entre salvamento no PostgreSQL e fallback em `localStorage`.

### 🔹 `AuthModal.jsx` (Fluxo Completo de Autenticação & Redefinição)
- **Função**: Gerencia todo o ciclo de vida de acesso do usuário.
- **Modos e Passos (`step`)**:
  1. `form`: Login tradicional e Cadastro com upload de foto de perfil (Base64) e botão de login com Google OAuth (`gsi/client`).
  2. `email_verify`: Confirmação de conta através de código de 6 dígitos enviado por e-mail.
  3. `phone_verify`: Confirmação opcional via SMS (código de teste `5678`).
  4. `reset_email`: Solicitação de redefinição de senha via e-mail.
  5. `reset_codigo`: Validação do código de 6 dígitos para reset de senha.
  6. `reset_senha`: Definição e confirmação da nova senha com medidor visual de força.

### 🔹 `RedacaoForm.jsx` (Simulador de Escrita & OCR)
- **Função**: Interface para digitação e envio da redação.
- **Recursos Destacados**:
  - **Simulador de Folha Pautada ENEM**: Recuo de parágrafo automático (`\t`), contagem de linhas oficiais (1 a 30) e contagem de palavras em tempo real.
  - **Submissão de Manuscrito (OCR)**: Upload de imagem de redação manuscrita com pré-visualização e envio para análise de visão computacional da IA.
  - **Roteiro Orientado**: Perguntas-guia divididas por parágrafos (Introdução, D1, D2 e Proposta de Intervenção).

### 🔹 `ResultadoCard.jsx` (Relatório Pedagógico Detalhado)
- **Função**: Apresenta a nota final (0 a 1000) e o detalhamento por competência (C1 a C5).
- **Recursos Destacados**:
  - **Barras de Desempenho Coloridas**: Categorizadas por pontuação (ex: 200 Excelente, 160 Bom, etc.).
  - **Mapeamento de Desvios Gramaticais**: Grifo no trecho exato com justificativa didática da correção.
  - **Sugestões de Melhoria**: Dicas acionáveis e análise pedagógica detalhada.

---

## 🎨 4. Design System, CSS & Estilização

O front-end utiliza variáveis CSS nativas combinadas com a engine do **Tailwind CSS 4**:

- **Paleta de Cores**:
  - `Primary (Esmeralda)`: `hsl(160, 84%, 39%)` — Representa aprovação, foco e clareza.
  - `Dark (Verde Profundo)`: `#0d1f1a` — Dá tom de autoridade e contraste às superfícies.
  - `Surface / Border`: `#f8faf9` e `#e2e8f0` — Proporciona leveza visual.
  - `Accent / Amber`: `#f59e0b` — Destaque de alertas e códigos de teste.
- **Efeitos de Vidro (Glassmorphism)**: `backdrop-filter: blur(12px)` em modais e cabeçalhos fixos.
- **Tipografia**: Utiliza fontes sem serifa modernas com fallbacks nativos limpos (`Inter`, `system-ui`).
- **Animações**: Transições suaves (`transition-all duration-300`), fade-ins (`animate-fade-in`) e barras de progresso dinâmicas.

---

## 🛡️ 5. Resiliência & Modos de Execução

O front-end do **CorrEnem** foi projetado para funcionar de maneira **híbrida**:
1. **Modo Conectado (Online)**: Comunica com o backend em FastAPI (`http://localhost:8000`), salvando dados no PostgreSQL e consumindo as LLMs da Groq.
2. **Modo Resiliente (Offline / Fallback)**: Se a API local estiver inacessível, o front-end utiliza o `localStorage` do navegador para manter o usuário autenticado, permitir testes com códigos padrão (`123456`) e simular o salvamento de rascunhos e correções.
