# 🐘 Documentação Completa do Banco de Dados PostgreSQL — CorrEnem

O **CorrEnem** utiliza o banco de dados relacional **PostgreSQL** para garantir persistência segura, integridade referencial, consultas de histórico eficientes e gerenciamento completo de usuários, redações e rascunhos.

---

## 🚀 1. Visão Geral & Recursos Utilizados

| Recurso / Componente | Descrição / Configuração |
| :--- | :--- |
| **SGBD** | PostgreSQL (Versão 15 / 16) |
| **Engine ORM** | SQLAlchemy `2.0+` com pooling de conexões assíncrono/síncrono |
| **Driver de Conexão** | `psycopg2-binary` |
| **Extensões Ativas** | `uuid-ossp` (Geração de UUIDs universais) |
| **Connection Pooling** | `pool_size=10`, `max_overflow=20`, `pool_pre_ping=True` |
| **Fuso Horário (Timezones)** | `TIMESTAMP WITH TIME ZONE` (UTC / Horário Padrão de Brasília) |

---

## 📐 2. Modelo Entidade-Relacionamento (DER)

A estrutura relacional das tabelas do banco de dados está representada abaixo:

```
+------------------+         +----------------------------+
|      users       | <---+---|   verificacoes_pendentes   |
+------------------+     |   +----------------------------+
| id (PK)          |     |   | id (PK)                    |
| email (UNIQUE)   |     |   | email                      |
| senha_hash       | <---+---| codigo                     |
+------------------+     |   +----------------------------+
         |               |
         |               |   +----------------------------+
         v               +---|         rascunhos          |
+------------------+         +----------------------------+
|     redacoes     |         | id (PK)                    |
+------------------+         | usuario_id (FK)            |
| id (PK)          |         +----------------------------+
| usuario_id (FK)  |
+------------------+
         |
         v
+------------------+
| desvios_redacao  |
+------------------+
| id (PK)          |
| redacao_id (FK)  |
+------------------+
```

---

## 📊 3. Estrutura Detalhada das Tabelas (`schema.sql`)

### 1️⃣ Tabela `users` (Cadastro de Usuários)
Armazena as credenciais e o perfil dos estudantes cadastrados.

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255),               -- Pode ser NULL para logins via Google OAuth
    telefone VARCHAR(20),
    profile_pic TEXT,                        -- Imagem codificada em Base64 ou URL
    verificado BOOLEAN DEFAULT FALSE,
    provedor VARCHAR(30) DEFAULT 'local',    -- 'local' ou 'google'
    is_ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscas ultra-rápidas por e-mail no login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

### 2️⃣ Tabela `verificacoes_pendentes` (Códigos de Ativação & Reset)
Utilizada para armazenar temporariamente códigos de segurança de 6 dígitos para confirmação de e-mail e redefinição de senha.

```sql
CREATE TABLE IF NOT EXISTS verificacoes_pendentes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(255),
    telefone VARCHAR(20),
    profile_pic TEXT,
    codigo VARCHAR(6) NOT NULL,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca de solicitações pendentes por e-mail
CREATE INDEX IF NOT EXISTS idx_verificacoes_email ON verificacoes_pendentes(email);
```

---

### 3️⃣ Tabela `redacoes` (Avaliações Pedagógicas Concluídas)
Armazena a nota final, textos, fotos manuscritas e os feedbacks das 5 competências do ENEM.

```sql
CREATE TABLE IF NOT EXISTS redacoes (
    id VARCHAR(50) PRIMARY KEY,                             -- ex: 'red_1722000000000'
    usuario_id INT REFERENCES users(id) ON DELETE SET NULL, -- Permite manter historico se usuario for removido
    modo_envio VARCHAR(30) DEFAULT 'digitado',             -- 'digitado' ou 'manuscrito'
    imagem_url TEXT,                                        -- Imagem da folha de redação enviada
    tema VARCHAR(300) NOT NULL,
    titulo VARCHAR(150),
    texto_original TEXT NOT NULL,
    nota_final INT NOT NULL CHECK (nota_final >= 0 AND nota_final <= 1000),
    
    -- Competência 1 (Norma Culta)
    c1_nota INT NOT NULL CHECK (c1_nota IN (0, 40, 80, 120, 160, 200)),
    c1_feedback TEXT,
    c1_sugestoes TEXT,
    
    -- Competência 2 (Compreensão e Repertório)
    c2_nota INT NOT NULL CHECK (c2_nota IN (0, 40, 80, 120, 160, 200)),
    c2_feedback TEXT,
    c2_sugestoes TEXT,
    
    -- Competência 3 (Projeto de Texto)
    c3_nota INT NOT NULL CHECK (c3_nota IN (0, 40, 80, 120, 160, 200)),
    c3_feedback TEXT,
    c3_sugestoes TEXT,
    
    -- Competência 4 (Coesão)
    c4_nota INT NOT NULL CHECK (c4_nota IN (0, 40, 80, 120, 160, 200)),
    c4_feedback TEXT,
    c4_sugestoes TEXT,
    
    -- Competência 5 (Proposta de Intervenção)
    c5_nota INT NOT NULL CHECK (c5_nota IN (0, 40, 80, 120, 160, 200)),
    c5_feedback TEXT,
    c5_sugestoes TEXT,
    
    comentario_geral TEXT,
    explicacao_nota_final TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para acelerar a montagem do histórico de redações do estudante
CREATE INDEX IF NOT EXISTS idx_redacoes_usuario ON redacoes(usuario_id);
```

---

### 4️⃣ Tabela `desvios_redacao` (Mapeamento de Erros no Texto)
Guarda os apontamentos sintáticos, ortográficos e coesivos identificados pela IA no texto do aluno.

```sql
CREATE TABLE IF NOT EXISTS desvios_redacao (
    id SERIAL PRIMARY KEY,
    redacao_id VARCHAR(50) REFERENCES redacoes(id) ON DELETE CASCADE,
    trecho TEXT NOT NULL,
    erro VARCHAR(150) NOT NULL,
    competencia VARCHAR(30) NOT NULL,
    explicacao TEXT NOT NULL,
    correcao TEXT NOT NULL
);

-- Índice para busca dos desvios da redação
CREATE INDEX IF NOT EXISTS idx_desvios_redacao ON desvios_redacao(redacao_id);
```

---

### 5️⃣ Tabela `rascunhos` (Salvar para Continuar Depois)
Armazena textos de redações em andamento ainda não submetidas para correção.

```sql
CREATE TABLE IF NOT EXISTS rascunhos (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id INT REFERENCES users(id) ON DELETE CASCADE,
    tema VARCHAR(300) NOT NULL,
    titulo VARCHAR(150),
    texto TEXT NOT NULL,
    modo_envio VARCHAR(30) DEFAULT 'digitado',
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para recuperação de rascunhos do usuário
CREATE INDEX IF NOT EXISTS idx_rascunhos_usuario ON rascunhos(usuario_id);
```

---

## 🔒 4. Integridade & Regras de Negócio

1. **Restrições de Nota (`CHECK Constraints`)**:
   - `nota_final`: Garante valores entre `0` e `1000`.
   - `c1_nota` a `c5_nota`: Impõe obrigatoriamente os valores válidos da escala INEP/ENEM (`0`, `40`, `80`, `120`, `160`, `200`).

2. **Ações em Cascata (`Foreign Keys`)**:
   - `ON DELETE CASCADE` na tabela `desvios_redacao` para limpar desvios ao apagar a redação.
   - `ON DELETE CASCADE` na tabela `rascunhos` para remover rascunhos se o usuário for excluído.
   - `ON DELETE SET NULL` na tabela `redacoes` para preservar os dados estatísticos da redação mesmo que a conta do usuário seja removida.

3. **Performance de Busca**:
   - Índices criados nos campos estratégicos (`email`, `usuario_id`, `redacao_id`) para evitar *Full Table Scans* em relatórios de histórico.
