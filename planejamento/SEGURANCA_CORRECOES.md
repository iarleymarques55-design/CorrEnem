# 🛡️ Relatório de Análise de Segurança e Correções Aplicadas — CorrEnem

Este documento consolida a auditoria completa de segurança, identificação de vulnerabilidades e as correções técnicas aplicadas nos módulos **Backend (FastAPI)**, **Database (PostgreSQL)** e **Frontend (React)** da plataforma **CorrEnem**.

---

## 📊 1. Resumo Executivo & Tabela de Vulnerabilidades

Todas as vulnerabilidades identificadas foram **100% corrigidas e aplicadas diretamente no código-fonte**.

| ID | Severidade | Vulnerabilidade / Risco | Módulo Afetado | Status | Correção Aplicada |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **VULN-01** | 🔴 CRÍTICA | Hash de senha sem *salt* (SHA-256 simples) | `backend/auth.py` | ✅ CORRIGIDO | Migrado para **PBKDF2-HMAC-SHA256** com *salt* único de 16 bytes e 100.000 iterações (Padrão OWASP/NIST). |
| **VULN-02** | 🔴 CRÍTICA | Buffer ilimitado de arquivo na memória (Ataque DoS) | `backend/main.py` | ✅ CORRIGIDO | Leitura com streaming limitado a no máximo **5 MB** antes de bufferizar em memória RAM. |
| **VULN-03** | 🟠 ALTA | Vulnerabilidade a Ataques de Tempo (*Timing Attacks*) | `backend/auth.py` | ✅ CORRIGIDO | Substituída a comparação de strings `!=` por `secrets.compare_digest` em tempo constante. |
| **VULN-04** | 🟠 ALTA | Vazamento de Códigos de Segurança na API (*Info Disclosure*) | `backend/auth.py` | ✅ CORRIGIDO | Ocultado o `codigo_console` nas respostas HTTP. Exibido apenas com flag explícita `SHOW_CONSOLE_CODES=true`. |
| **VULN-05** | 🟠 ALTA | Ausência de Proteção contra Força Bruta (*Brute-Force*) | `backend/auth.py` | ✅ CORRIGIDO | Implementado *Rate Limiter* por IP/Email limitando a no máximo **5 tentativas por minuto** em rotas de login e reset. |
| **VULN-06** | 🟡 MÉDIA | Armazenamento de Senhas em Texto Claro no Frontend | `frontend/AuthModal.jsx` | ✅ CORRIGIDO | Removida a propriedade `senha` do `localStorage` dos fallbacks locais. |
| **VULN-07** | 🟡 MÉDIA | Ausência de Invalidação por Tentativas Incorretas | `backend/auth.py` & `database.py` | ✅ CORRIGIDO | Adicionada coluna `tentativas_falhas`. O código é **destruído automaticamente após 5 erros**. |
| **VULN-08** | 🔵 BAIXA | Origens CORS Wildcard / Permissivas | `backend/main.py` | ✅ CORRIGIDO | Leitura de origens permitidas via variável de ambiente `ALLOWED_ORIGINS` e validação estrita. |

---

## 🔍 2. Detalhamento Técnico dos Problemas e Correções

### 1️⃣ VULN-01: Hashing Criptográfico de Senhas (PBKDF2 + Salt Aleatório)
- **Problema**: O sistema utilizava `hashlib.sha256(senha.encode('utf-8')).hexdigest()`. O algoritmo SHA-256 puro sem *salt* individual é vulnerável a computação acelerada por GPUs e consultas em *Rainbow Tables*.
- **Solução Aplicada**:
  - Implementada a função `_hash_senha` usando `hashlib.pbkdf2_hmac` com o algoritmo `sha256`, 100.000 iterações de derivação de chave e *salt* hexadecimal aleatório gerado via `secrets.token_hex(16)`.
  - Formato de armazenamento seguro: `pbkdf2$100000$salt_hex$hash_hex`.
  - Adicionado suporte a **migração transparente**: ao fazer login, se a senha armazenada do usuário ainda estiver em SHA-256 antigo, o sistema valida em tempo constante e atualiza automaticamente para PBKDF2 no banco.

---

### 2️⃣ VULN-02: Proteção contra Negação de Serviço (DoS) no Upload de Arquivos
- **Problema**: O endpoint `/transcrever-manuscrito` executava `conteudo_imagem = await imagem.read()` sem especificar tamanho. Um atacante poderia enviar um arquivo de vários Gigabytes, esgotando a memória RAM do servidor FastAPI.
- **Solução Aplicada**:
  - Adicionada leitura segura com limite rígido: `conteudo_imagem = await imagem.read(MAX_UPLOAD_BYTES + 1)`.
  - Caso o tamanho exceda 5 MB (`5 * 1024 * 1024` bytes), a API interrompe imediatamente o processamento e retorna o erro HTTP com status `tamanho_excedido` sem consumir RAM desnecessária.

---

### 3️⃣ VULN-03: Mitigação de Ataques de Tempo (*Side-Channel / Timing Attacks*)
- **Problema**: A verificação de códigos de 6 dígitos e hashes de senha utilizava operadores normais de comparação (`!=` e `==`). Como essas comparações encerram a checagem no primeiro caractere divergente, atacantes conseguem medir diferenças de milissegundos para adivinhar os caracteres do código.
- **Solução Aplicada**:
  - Toda validação de código de e-mail, código de reset e hash de senha passou a utilizar `secrets.compare_digest(string_a, string_b)`.
  - Essa função executa o teste em **tempo constante**, impedindo que flutuações de tempo revelem os caracteres corretos.

---

### 4️⃣ VULN-04: Ocultação de Códigos de Segurança em Produção (*Information Disclosure*)
- **Problema**: A API retornava o campo `"codigo_console": codigo` no corpo do JSON de resposta HTTP quando o SMTP de e-mail não estava configurado. Isso permitia que qualquer usuário mal-intencionado consultasse códigos de verificação de terceiros inspecionando a resposta da rede.
- **Solução Aplicada**:
  - Criada a instrução condicional `SHOW_CONSOLE_CODES`.
  - O código só é exposto na resposta HTTP caso a variável de ambiente `ENVIRONMENT=development` ou `SHOW_CONSOLE_CODES=true` esteja ativada no `.env`. Em produção, o campo é estritamente retornado como `null`.

---

### 5️⃣ VULN-05: Proteção Contra Ataques de Força Bruta (*Rate Limiting*)
- **Problema**: Não havia limite de requisições por minuto nas rotas críticas `/auth/login`, `/auth/cadastrar`, `/auth/solicitar-reset` e `/auth/verificar-codigo-reset`, permitindo scripts automatizados de força bruta.
- **Solução Aplicada**:
  - Criado o middleware em memória `_verificar_rate_limit(chave, max_tentativas=5, janela_segundos=60)`.
  - Se um usuário ou IP realizar mais de 5 tentativas dentro de um intervalo de 60 segundos, a API bloqueia a requisição e retorna o código **HTTP 429 Too Many Requests**.

---

### 6️⃣ VULN-06: Remoção de Senhas em Texto Claro no Frontend (`localStorage`)
- **Problema**: No modo offline/fallback de testes no front-end (`AuthModal.jsx`), a senha do usuário estava sendo gravada em texto claro no `localStorage` do navegador sob a chave `correnem_users_db`.
- **Solução Aplicada**:
  - Removido o atributo `senha` da montagem dos objetos salvos no `localStorage`.
  - O navegador armazena apenas dados públicos da sessão de perfil (`nome`, `email`, `telefone`, `profilePic`).

---

### 7️⃣ VULN-07: Destruição e Invalidação Automática por Tentativas Incorretas
- **Problema**: Um código de 6 dígitos gerado ficava ativo por 10 minutos independentemente da quantidade de palpites errados enviados pelo usuário.
- **Solução Aplicada**:
  - Adicionado o campo `tentativas_falhas` na tabela `verificacoes_pendentes` no `database.py`.
  - A cada tentativa incorreta de código, o contador de falhas é incrementado.
  - Ao atingir **5 tentativas incorretas**, o código de verificação é **deletado do banco de dados**, forçando a solicitação de um novo código.

---

## 🛠️ 3. Como Executar e Validar as Alterações de Segurança

### **Servidor Backend (FastAPI)**
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### **Build e Teste do Frontend (React + Vite)**
```bash
cd frontend
npm run build
```
*O build de produção foi testado e concluído com sucesso sem qualquer erro de sintaxe ou compilação.*

---

© 2026 **CorrEnem** · Relatório de Auditoria e Fortalecimento de Segurança.
