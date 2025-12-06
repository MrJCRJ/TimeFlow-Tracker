# 📦 TimeFlow Tracker - Aplicação Local

## 🏠 Decisão de Arquitetura

O **TimeFlow Tracker** foi projetado como uma **aplicação desktop/local** por escolha deliberada:

### Por que Local?

1. **🔒 Privacidade Total**

   - Todos os seus dados ficam no seu computador
   - Nenhuma atividade é enviada para servidores externos (exceto API da IA)
   - Você tem controle total sobre seus dados

2. **💾 Simplicidade**

   - Um único arquivo `local.db` contém tudo
   - Fácil fazer backup (copie o arquivo)
   - Sem dependência de serviços externos

3. **💰 Custo Zero**

   - Não precisa pagar por hospedagem
   - Não precisa pagar por banco de dados em nuvem
   - Apenas o custo da API da IA (muito baixo)

4. **⚡ Performance**
   - SQLite é extremamente rápido para uso local
   - Sem latência de rede
   - Respostas instantâneas

### Por que NÃO funciona na Vercel?

A Vercel (e outras plataformas serverless) tem limitações:

- ❌ Sistema de arquivos **read-only**
- ❌ SQLite não pode criar/modificar arquivos
- ❌ Funções são **efêmeras** (destroem dados)
- ❌ Não há armazenamento persistente de arquivos

**Erro típico:**

```
SqliteError: unable to open database file
Code: SQLITE_CANTOPEN
```

## 🎯 Como Usar

### Desenvolvimento (Local)

```bash
npm run dev
# Acesse: http://localhost:3000
```

### Produção (Local)

```bash
npm run build
npm start
# Acesse: http://localhost:3000
```

### Como App de Desktop (Opcional)

Você pode transformar em um app standalone usando:

**Opção 1: Electron**

```bash
npm install electron electron-builder
# Configure Electron wrapper
```

**Opção 2: Tauri**

```bash
npm install @tauri-apps/cli
# Configure Tauri (menor e mais rápido)
```

**Opção 3: PWA**

- Já está configurado!
- Acesse no Chrome/Edge
- Clique nos 3 pontinhos → "Instalar TimeFlow Tracker"
- Funcionará como um app nativo

## 📊 Alternativas para Deploy em Nuvem

Se você **realmente** quiser hospedar online (não recomendado para privacidade):

### 1. Migrar para PostgreSQL

Substitua SQLite por Postgres e use:

- **Neon** (Serverless Postgres - Grátis)
- **Supabase** (Postgres + Auth - Grátis)
- **Railway** (Hospedagem simples - Grátis com limites)

### 2. Usar VPS

Host a aplicação inteira em um servidor:

- **DigitalOcean** ($4/mês)
- **Linode** ($5/mês)
- **Hetzner** (€4/mês)

### 3. Docker + Self-hosted

```bash
docker build -t timeflow .
docker run -p 3000:3000 -v ./data:/app/data timeflow
```

## 🎨 Filosofia do Projeto

> "Seus dados de produtividade são **pessoais**. Eles devem ficar no **seu computador**, sob **seu controle**."

TimeFlow Tracker segue a filosofia de **local-first software**:

- Dados locais por padrão
- Funciona offline
- Você é dono dos seus dados
- Sem dependência de serviços terceiros

## 💡 Recomendações

### ✅ Para você se:

- Quer privacidade total
- Trabalha em um computador fixo
- Prefere controle total sobre dados
- Não precisa acessar de múltiplos dispositivos

### ⚠️ Considere alternativas se:

- Precisa acessar de vários dispositivos
- Quer sincronização em nuvem
- Trabalha em equipe
- Precisa acesso via mobile/tablet

---

**TimeFlow Tracker: Local, Privado, Seu.** 🏠🔒

## 🔴 Problema

A Vercel usa um ambiente **serverless** onde:

- ❌ Sistema de arquivos é **read-only**
- ❌ SQLite não pode criar/modificar arquivos
- ❌ `SQLITE_CANTOPEN` error em produção

## ✅ Soluções

### Opção 1: Vercel Postgres (Recomendado) 🟢

**Prós:**

- ✅ Gratuito (Hobby plan)
- ✅ Gerenciado pela Vercel
- ✅ Fácil setup
- ✅ Compatível com Drizzle ORM

**Passos:**

1. **Instalar dependências:**

```bash
npm install @vercel/postgres
npm install -D pg @types/pg
```

2. **Adicionar database na Vercel:**

   - Dashboard → Storage → Create Database
   - Escolha "Postgres"
   - Copie as variáveis de ambiente geradas

3. **Atualizar Drizzle config:**

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Mudança aqui
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config;
```

4. **Atualizar schema para Postgres:**

```typescript
// lib/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core";

export const activitiesLocal = pgTable("activities_local", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  category: text("category"),
  aiResponse: text("ai_response"),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes"),
});

export const feedbacksLocal = pgTable("feedbacks_local", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  type: text("type").notNull().default("daily"),
  theme: text("theme"),
  score: integer("score"),
  insights: json("insights").$type<string[]>(),
  suggestion: text("suggestion"),
  createdAt: timestamp("created_at").notNull(),
});

export const pendingInputs = pgTable("pending_inputs", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  processed: boolean("processed").notNull().default(false),
  processedAt: timestamp("processed_at"),
  result: text("result"),
});
```

5. **Atualizar conexão do banco:**

```typescript
// lib/db/index.ts
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

export const db = drizzle(sql);
```

6. **Push schema para Postgres:**

```bash
npm run db:push
```

---

### Opção 2: Vercel KV (Redis) 🟡

**Prós:**

- ✅ Muito rápido
- ✅ Gratuito

**Contras:**

- ⚠️ NoSQL (precisa reescrever queries)
- ⚠️ Não tem Drizzle ORM

---

### Opção 3: Neon (Postgres Serverless) 🟢

**Prós:**

- ✅ Gratuito (500 MB)
- ✅ PostgreSQL completo
- ✅ Funciona com Drizzle

**Passos:**

1. Crie conta em [neon.tech](https://neon.tech)
2. Copie a connection string
3. Adicione em `.env`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
```

4. Siga mesmos passos da Opção 1

---

### Opção 4: PlanetScale (MySQL) 🟡

**Prós:**

- ✅ Gratuito
- ✅ Funciona com Drizzle

**Contras:**

- ⚠️ MySQL (não Postgres)
- ⚠️ Precisa adaptar queries

---

## 🎯 Recomendação

**Use Vercel Postgres** pela integração nativa!

## 📦 Migration Guide Completo

Vou criar um branch separado com a migration completa para Postgres.

Quer que eu:

1. ✅ Crie o código para Vercel Postgres?
2. ✅ Configure tudo para você?
3. ✅ Mantenha SQLite para desenvolvimento local?

**Responda**: Qual opção você prefere? (Recomendo Opção 1: Vercel Postgres)
