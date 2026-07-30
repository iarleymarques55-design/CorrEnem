# 📝 Corretor de Redação ENEM com Inteligência Artificial

Este documento apresenta a arquitetura, stack tecnológica, guia de instalação isolada e estruturação de um **Corretor de Redação baseado nos critérios do ENEM**, utilizando Inteligência Artificial (API do Groq com o modelo Llama 3.3) para avaliar o texto de acordo com as 5 competências oficiais.

---

## 🏛️ Arquitetura do Projeto

O projeto é dividido em duas partes principais organizadas de forma independente na mesma pasta raiz, garantindo a separação de responsabilidades (*Separation of Concerns*):

```
CORRENEM/
├── backend/          # Servidor Python com FastAPI e integração com Groq
└── frontend/         # Interface SPA em React com Tailwind CSS
```

---

## 🛠️ Stack Tecnológica

### **Front-end**
*   **React (via Vite):** Framework de interface rápida, moderna e reativa.
*   **Tailwind CSS:** Framework utilitário de estilização para design responsivo e customizado.
*   **Axios:** Cliente HTTP para comunicação simples com o backend Python.
*   **Lucide React:** Biblioteca de ícones modernos e minimalistas.

### **Back-end (100% Python)**
*   **FastAPI:** Framework web assíncrono de altíssima performance para construção de APIs.
*   **Uvicorn:** Servidor ASGI de produção para rodar a aplicação FastAPI localmente.
*   **Groq SDK (Llama 3.3):** Modelo de linguagem extremamente rápido e inteligente da Meta executado via Groq Cloud para analisar o texto baseado nos critérios do ENEM.
*   **Pydantic:** Validação de tipos e garantia de saídas estruturadas (Structured Outputs) da Inteligência Artificial via formato JSON.
*   **Python-dotenv:** Gerenciamento seguro de credenciais locais (API Keys) sem expor segredos no código.

---

## 🔒 Preparação do Ambiente Isolado (Sem Instalação Global)

Para evitar conflitos com outros projetos e manter o seu computador limpo, toda a instalação de dependências e ambientes de execução será feita de forma **local e isolada** dentro da pasta do projeto.

### 🐍 1. Preparando o Back-end (Python Virtual Environment)

O Python possui o módulo `venv` integrado, que cria um ambiente virtual isolado contendo seu próprio executável do Python e gerenciador de pacotes `pip`.

1.  Abra o seu terminal na pasta do projeto `CORRENEM`.
2.  Entre na pasta `backend`:
    ```bash
    cd backend
    ```
3.  Crie o ambiente virtual local (chamado `venv`):
    ```bash
    python -m venv venv
    ```
4.  Ative o ambiente virtual:
    *   **No Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   **No Windows (Prompt de Comando/CMD):**
        ```cmd
        .\venv\Scripts\activate.bat
        ```
    *   **No Linux/macOS:**
        ```bash
        source venv/bin/activate
        ```
    *(Você saberá que o ambiente está ativo quando o terminal mostrar `(venv)` antes do prompt)*.

5.  Crie o arquivo `requirements.txt` na pasta `backend/` com as dependências necessárias:
    ```text
    fastapi>=0.115.0
    uvicorn>=0.32.0
    groq>=0.9.0
    pydantic>=2.9.0
    python-dotenv==1.0.1
    ```

6.  Instale as dependências localmente dentro do ambiente virtual ativo:
    ```bash
    pip install -r requirements.txt
    ```

7.  Crie um arquivo `.env` para armazenar a sua chave de API com segurança:
    ```env
    GROQ_API_KEY=gsk_sua_chave_do_groq_aqui
    ```

---

### 💻 2. Preparando o Front-end (Node.js & React Local)

Para o front-end, usaremos o gerenciador de pacotes do Node (`npm`) para instalar todos os frameworks e bibliotecas apenas dentro da pasta `node_modules/` do projeto, mantendo o ecossistema local.

1.  Retorne à raiz do projeto e crie o front-end com Vite:
    ```bash
    cd ..
    npm create vite@latest frontend -- --template react
    ```
2.  Entre na pasta `frontend` criada:
    ```bash
    cd frontend
    ```
3.  Instale o Tailwind CSS e suas dependências localmente como ferramentas de desenvolvimento:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    ```
4.  Inicialize o arquivo de configuração do Tailwind:
    ```bash
    npx tailwindcss init -p
    ```
5.  Instale as outras dependências necessárias do front-end:
    ```bash
    npm install axios lucide-react
    ```
6.  Instale todas as dependências locais declaradas no `package.json`:
    ```bash
    npm install
    ```

---

## 📁 Estrutura Detalhada de Arquivos

Aqui está a estrutura de diretórios final sugerida para o projeto completo:

```
CORRENEM/
├── backend/
│   ├── venv/                 # Ambiente virtual Python (ignorado no git)
│   ├── .env                  # Chave da API do Groq (ignorado no git)
│   ├── main.py               # Código principal do servidor FastAPI
│   └── requirements.txt      # Dependências do Python
└── frontend/
    ├── node_modules/         # Módulos do Node (ignorado no git)
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/       # Componentes React reutilizáveis
    │   │   ├── Header.jsx
    │   │   ├── RedacaoForm.jsx
    │   │   └── ResultadoCard.jsx
    │   ├── App.jsx           # Componente principal
    │   ├── index.css         # Configurações do Tailwind CSS
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js    # Configuração do Tailwind
    └── vite.config.js
```

---

## ⚙️ Configurações Importantes

### Configurando o Tailwind (`frontend/tailwind.config.js`)
Para que o Tailwind aplique os estilos corretamente no React, configure o `content` no arquivo criado:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enem: {
          blue: '#1E3A8A',
          yellow: '#FBBF24',
          green: '#10B981',
        }
      }
    },
  },
  plugins: [],
}
```

### Configurando o Tailwind no CSS (`frontend/src/index.css`)
Adicione as diretivas do Tailwind no topo do arquivo CSS principal:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}
```

---

## 🚀 Implementação de Exemplo Prático

### 🐍 Backend Python (`backend/main.py`)
Aqui está a implementação do backend em FastAPI usando a biblioteca Pydantic e o Groq SDK. Isso garante que a IA nos responda exatamente um JSON válido com as notas e comentários estruturados de cada competência do ENEM.

```python
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY or GROQ_API_KEY == "SuaChaveDoGroqAqui":
    print("AVISO: Chave de API do Groq não encontrada no arquivo .env")

app = FastAPI(title="Corretor de Redação ENEM API (Powered by Groq)")

# Permite requisições do front-end React (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Porta padrão do Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos de Dados ---

class RedacaoRequest(BaseModel):
    tema: str
    texto: str

class CompetenciaAvaliacao(BaseModel):
    nota: int = Field(..., description="Nota da competência: 0, 40, 80, 120, 160 ou 200")
    feedback: str = Field(..., description="Comentários detalhados apontando os acertos e os desvios na redação")
    sugestoes: str = Field(..., description="Dicas práticas de como o estudante pode evoluir nesta competência")

class ResultadoCorrecao(BaseModel):
    competencia1: CompetenciaAvaliacao = Field(..., description="C1: Domínio da norma culta da língua escrita")
    competencia2: CompetenciaAvaliacao = Field(..., description="C2: Compreender a proposta e aplicar conceitos de várias áreas")
    competencia3: CompetenciaAvaliacao = Field(..., description="C3: Selecionar, relacionar e organizar informações para defender um ponto de vista")
    competencia4: CompetenciaAvaliacao = Field(..., description="C4: Mecanismos linguísticos para construção da argumentação")
    competencia5: CompetenciaAvaliacao = Field(..., description="C5: Proposta de intervenção para o problema abordado")
    nota_final: int = Field(..., description="Soma das notas das 5 competências (máximo 1000)")
    comentario_geral: str = Field(..., description="Avaliação global: pontos fortes, fracos e encorajamento")

# --- Cliente Groq ---
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY and GROQ_API_KEY != "SuaChaveDoGroqAqui" else None

# --- Rota principal de correção ---

@app.post("/corrigir", response_model=ResultadoCorrecao)
async def corrigir_redacao(requisicao: RedacaoRequest):
    if not client:
        raise HTTPException(
            status_code=500,
            detail="Chave de API do Groq não configurada no arquivo .env"
        )

    if not requisicao.tema.strip() or not requisicao.texto.strip():
        raise HTTPException(status_code=400, detail="Tema e Texto são obrigatórios.")

    try:
        # Pega o esquema JSON gerado pelo Pydantic para orientar o modelo
        schema_json = ResultadoCorrecao.model_json_schema()

        prompt_sistema = (
            "Você é um corretor de redação oficial e extremamente criterioso do ENEM. "
            "Avalie a redação fornecida seguindo rigorosamente a grade de correção oficial do ENEM. "
            "Atribua notas de 0, 40, 80, 120, 160 ou 200 para cada uma das 5 competências. "
            "A soma das 5 notas deve ser igual ao campo nota_final. "
            "Justifique cada nota e dê dicas reais no campo sugestoes.\n\n"
            "Retorne APENAS um objeto JSON válido seguindo EXATAMENTE este esquema:\n"
            f"{json.dumps(schema_json, ensure_ascii=False)}"
        )

        prompt_usuario = (
            f"Tema da Redação: {requisicao.tema}\n\n"
            f"Texto do Estudante:\n{requisicao.texto}"
        )

        resposta = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": prompt_usuario},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        texto_resposta = resposta.choices[0].message.content
        
        if not texto_resposta:
            raise HTTPException(
                status_code=500,
                detail="O modelo de IA não retornou resposta. Tente novamente."
            )

        resultado_json = json.loads(texto_resposta)
        return resultado_json

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="A IA não retornou um formato JSON válido."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno no provedor de IA (Groq): {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

---

### ⚛️ Frontend React (`frontend/src/App.jsx`)
Um exemplo de interface limpa e intuitiva para o estudante submeter a redação e visualizar a nota detalhada.

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Send, Sparkles, Trophy } from 'lucide-react';

function App() {
  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  const enviarRedacao = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setResultado(null);
    setErro('');

    try {
      const response = await axios.post('http://localhost:8000/corrigir', {
        tema,
        texto
      });
      setResultado(response.data);
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao comunicar com o servidor de inteligência artificial.');
    } finally {
      setCarregando(false);
    }
  };

  const competentesInfo = [
    { key: 'competencia1', title: 'Competência 1', desc: 'Norma Culta da Língua Escrita' },
    { key: 'competencia2', title: 'Competência 2', desc: 'Compreensão do Tema e Estrutura' },
    { key: 'competencia3', title: 'Competência 3', desc: 'Seleção e Organização de Informações' },
    { key: 'competencia4', title: 'Competência 4', desc: 'Coesão e Mecanismos Linguísticos' },
    { key: 'competencia5', title: 'Competência 5', desc: 'Proposta de Intervenção (Solução)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-amber-400 w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Corretor ENEM <span className="text-amber-400">IA</span></h1>
          </div>
          <span className="text-sm bg-blue-800 px-3 py-1 rounded-full text-blue-200">Powered by Llama 3.3 (Groq)</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Formulário */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <form onSubmit={enviarRedacao} className="space-y-6">
            <div>
              <label htmlFor="tema" className="block text-sm font-semibold text-gray-700 mb-2">Tema da Redação</label>
              <input
                id="tema"
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Insira o tema completo sugerido..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="texto" className="block text-sm font-semibold text-gray-700 mb-2">Texto da Redação</label>
              <textarea
                id="texto"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={15}
                placeholder="Escreva ou cole sua redação aqui (mínimo de 7 linhas)..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 font-mono text-sm leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-800 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {carregando ? (
                <>
                  <Sparkles className="animate-spin w-5 h-5 text-amber-400" />
                  Corrigindo com Inteligência Artificial...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submeter Redação para Correção
                </>
              )}
            </button>
          </form>

          {erro && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}
        </section>

        {/* Painel de Resultados */}
        <section className="space-y-6">
          {resultado ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-fade-in">
              {/* Box de Nota Final */}
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-blue-900">Nota Final</h2>
                  <p className="text-sm text-blue-700 mt-1">Calculada sob as 5 competências</p>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="text-amber-400 w-8 h-8" />
                  <span className="text-4xl font-extrabold text-blue-900">{resultado.nota_final}</span>
                  <span className="text-gray-400 text-xl font-bold">/1000</span>
                </div>
              </div>

              {/* Feedback Geral */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Comentário Geral</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-150 leading-relaxed text-sm">
                  {resultado.comentario_geral}
                </p>
              </div>

              {/* Competências individuais */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Desempenho por Competência</h3>
                
                {competentesInfo.map((comp) => {
                  const avaliacao = resultado[comp.key];
                  return (
                    <div key={comp.key} className="border border-gray-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{comp.title}</h4>
                          <span className="text-xs text-gray-500">{comp.desc}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full">
                          {avaliacao.nota} / 200 pontos
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1 mt-2">
                        <p><strong>Feedback:</strong> {avaliacao.feedback}</p>
                        <p className="text-emerald-700 font-medium mt-1">💡 <strong>Como melhorar:</strong> {avaliacao.sugestoes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-lg font-bold text-gray-700 mb-2">Aguardando Redação</h2>
              <p className="text-gray-400 text-sm max-w-xs">
                Preencha o tema e cole o seu rascunho na área ao lado para receber um feedback completo do corretor inteligente.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 text-center py-4 text-xs text-gray-500">
        © 2026 Corretor Inteligente. Ambiente de desenvolvimento 100% isolado.
      </footer>
    </div>
  );
}

export default App;
```

---

## 🏃‍♂️ Como Executar o Projeto Localmente

### 1. Inicializar o Backend (Python)
1. Certifique-se de estar na pasta `backend`.
2. Certifique-se de que o ambiente virtual está ativo (`venv`).
3. Execute o servidor FastAPI com Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   *O backend rodará em `http://127.0.0.1:8000`*

### 2. Inicializar o Frontend (React)
1. Em outro terminal, navegue até a pasta `frontend`.
2. Execute o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   *O frontend rodará em `http://localhost:5173`*
