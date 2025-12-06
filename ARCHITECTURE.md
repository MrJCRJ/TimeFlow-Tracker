# 🏗️ Arquitetura - TimeFlow Tracker

## 📐 Visão Geral

Sistema simples de tracking de atividades baseado em **fluxo contínuo** com análise automática diária.

## 🎯 Princípios de Design

### 1. **Simplicidade Radical**

- Uma única ação: digitar atividade
- Zero cliques para tracking
- Interface minimalista

### 2. **Privacidade First**

- SQLite local
- Nenhum servidor externo obrigatório
- Dados temporários deletados

### 3. **Fluxo Natural**

- Sempre uma atividade em andamento
- Encerramento automático
- Sem timers manuais

### 4. **Análise Inteligente Adaptativa**

- Automática às 23:59
- **IA DeepSeek OBRIGATÓRIA** (sem fallback local)
- **IA aprende com histórico** dos últimos 7 dias
- **IA se adapta** ao comportamento do usuário
- Insights permanentes cada vez mais personalizados
- Quanto mais dias, mais inteligente fica sobre VOCÊ
- Insights permanentes

## 🗂️ Estrutura de Arquivos

```
TimeFlow Tracker/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── flow/route.ts         # Gerencia fluxo de atividades
│   │   ├── today/route.ts        # Lista atividades do dia
│   │   ├── insights/route.ts     # Busca feedbacks salvos
│   │   └── analyze/route.ts      # Executa análise diária
│   ├── layout.tsx                # Layout raiz + PWA register
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globais (Tailwind)
│
├── components/                   # Componentes React
│   ├── ActivityFlow.tsx          # Campo de entrada único
│   ├── TodayActivities.tsx       # Lista + atividade atual
│   ├── InsightsFeed.tsx          # Feedbacks anteriores
│   └── PWARegister.tsx           # Service Worker + agendador
│
├── lib/                          # Lógica de negócio
│   ├── db/
│   │   ├── index.ts              # Conexão SQLite
│   │   └── schema.ts             # Schemas Drizzle ORM
│   └── daily-analysis.ts         # Sistema de análise
│
├── public/                       # Assets estáticos
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   ├── icon-192.svg              # Ícone PWA
│   └── icon-512.svg              # Ícone PWA
│
├── scripts/                      # Utilitários
│   └── test-data.js              # Dados de teste
│
└── local.db                      # Banco SQLite (criado automaticamente)
```

## 🗄️ Banco de Dados

### Schema

```typescript
// Tabela TEMPORÁRIA (deletada após análise)
activities_local {
  id: number (PK, auto)
  title: string
  startedAt: timestamp
  endedAt: timestamp | null
  durationMinutes: number | null
}

// Tabela PERMANENTE (apenas insights)
feedbacks_local {
  id: number (PK, auto)
  date: string (YYYY-MM-DD)
  theme: string
  score: number (0-10)
  insights: JSON (array de strings)
  suggestion: string
  createdAt: timestamp
}
```

### Regras de Dados

1. **Atividades em andamento**: `endedAt = NULL`
2. **Atividades finalizadas**: `endedAt != NULL`
3. **Deleção diária**: Após análise, todas atividades do dia são removidas
4. **Feedbacks eternos**: Nunca deletados automaticamente

## 🔄 Fluxo de Dados

### 1. Nova Atividade

```
Usuário digita "Estudar React" → Enter
          ↓
POST /api/flow {title: "Estudar React"}
          ↓
1. Busca atividade com endedAt = NULL
2. Atualiza endedAt = NOW()
3. Calcula durationMinutes
4. Insere nova atividade com startedAt = NOW()
          ↓
Retorna nova atividade
          ↓
Frontend dispara evento 'activityUpdated'
          ↓
TodayActivities atualiza lista
```

### 2. Visualização em Tempo Real

```
TodayActivities (componente)
          ↓
useEffect → fetch('/api/today')
          ↓
GET /api/today
          ↓
SELECT * FROM activities_local
WHERE startedAt >= TODAY
ORDER BY startedAt DESC
          ↓
Separa: ongoing (endedAt = NULL) + finished
          ↓
setInterval atualiza duração da ongoing
```

### 3. Análise Diária

```
23:59:00 (agendado)
          ↓
POST /api/analyze
          ↓
performDailyAnalysis()
          ↓
1. Busca atividades do dia
2. Prepara resumo textual
3. Chama DeepSeek API (ou local)
4. Recebe JSON {theme, score, insights, suggestion}
5. INSERT INTO feedbacks_local
6. DELETE FROM activities_local WHERE date = TODAY
          ↓
Apenas insights ficam no banco
```

## 🔌 API Routes

### POST /api/flow

**Entrada:**

```json
{
  "title": "Nome da atividade"
}
```

**Saída:**

```json
{
  "id": 123,
  "title": "Nome da atividade",
  "startedAt": "2024-12-06T10:30:00.000Z",
  "endedAt": null,
  "durationMinutes": null
}
```

**Lógica:**

1. Valida título
2. Encerra atividade anterior (se existir)
3. Cria nova atividade
4. Retorna atividade criada

### GET /api/today

**Saída:**

```json
[
  {
    "id": 123,
    "title": "Estudar React",
    "startedAt": "2024-12-06T09:00:00.000Z",
    "endedAt": "2024-12-06T10:30:00.000Z",
    "durationMinutes": 90
  },
  {
    "id": 124,
    "title": "Fazendo café",
    "startedAt": "2024-12-06T10:30:00.000Z",
    "endedAt": null,
    "durationMinutes": null
  }
]
```

**Lógica:**

1. Define today = 00:00 do dia atual
2. SELECT WHERE startedAt >= today
3. Retorna array ordenado

### GET /api/insights

**Saída:**

```json
[
  {
    "id": 5,
    "date": "2024-12-05",
    "theme": "Foco matinal",
    "score": 8,
    "insights": [
      "Começou cedo com alta produtividade",
      "Tarde com mais dispersão",
      "Média de 45min por tarefa"
    ],
    "suggestion": "Tente blocos de 25min (Pomodoro) à tarde",
    "createdAt": "2024-12-05T23:59:10.000Z"
  }
]
```

**Lógica:**

1. SELECT \* FROM feedbacks_local
2. ORDER BY date DESC
3. LIMIT 30
4. Retorna últimos 30 dias

### POST /api/analyze

**Entrada:** (opcional)

```json
{
  "date": "2024-12-05" // Analisa dia específico
}
```

**Saída:**

```json
{
  "success": true,
  "date": "2024-12-05"
}
```

**Lógica:**

1. Valida se já existe análise para o dia
2. Busca atividades do dia
3. **Busca feedbacks dos últimos 7 dias** (contexto para IA)
4. Prepara prompt inteligente com histórico
5. Chama **DeepSeek API (OBRIGATÓRIA)**
6. Parse JSON da resposta
7. Salva feedback
8. Deleta atividades do dia

## 🤖 Sistema de Análise Inteligente e Adaptativa

### IA DeepSeek (OBRIGATÓRIA - Sem Fallback)

A IA é o CORAÇÃO do sistema. Ela:

- 🧠 **Aprende** com os últimos 7 dias do usuário
- 📊 **Reconhece padrões** de comportamento
- 📈 **Identifica evolução** ou regressão
- 🎯 **Personaliza sugestões** baseadas no histórico
- 💡 **Se adapta** ao estilo de cada pessoa

**Quanto mais dias de uso, mais inteligente fica sobre VOCÊ!**

```typescript
// Busca histórico recente
const previousFeedbacks = await db
  .select()
  .from(feedbacksLocal)
  .orderBy(desc(feedbacksLocal.date))
  .limit(7); // Últimos 7 dias

// Prepara contexto adaptativo
const historyContext = previousFeedbacks.map(f =>
  `${f.date} (${f.score}/10) - ${f.theme}
   Insights: ${f.insights.join(', ')}
   Sugestão dada: ${f.suggestion}`
).join('\n\n');

const prompt = `
Sistema: Você é um coach de produtividade INTELIGENTE que APRENDE com o usuário.

IMPORTANTE: Use o histórico para:
- Identificar padrões de comportamento
- Reconhecer progresso ou regressão
- Adaptar sugestões baseadas no que funcionou antes
- Ser cada vez mais personalizado e específico

Retorne APENAS JSON válido:
{
  "theme": "tema do dia em 2-4 palavras",
  "score": 0-10,
  "insights": ["insight específico 1", "insight específico 2", "insight específico 3"],
  "suggestion": "sugestão PERSONALIZADA baseada no histórico"
}

Seja ADAPTATIVO. Quanto mais dias, mais personalizado.

Usuário - Atividades de hoje:
09:00 - Estudar React (90min)
10:30 - Café (15min)
10:45 - Code review (45min)
...

HISTÓRICO DOS ÚLTIMOS DIAS:
2024-12-05 (8/10) - Foco matinal
  Insights: Começou cedo, Tarde dispersa, 8 atividades
  Sugestão: Tente blocos de 25min à tarde
...
`;

→ DeepSeek API com contexto histórico
→ IA identifica padrões e evolução
→ Parse JSON da resposta adaptativa
→ Salva no banco

**Sem API Key = Sistema NÃO funciona**
A IA é essencial, não opcional!
```

**Exemplo de Evolução da IA:**

- **Dia 1:** "Você registrou 8 atividades"
- **Dia 7:** "Você mantém média de 8 atividades, mas hoje focou mais em tarefas longas"
- **Dia 30:** "Percebi que terças você é mais produtivo. Continue esse padrão!"

## ⏰ Sistema de Agendamento

### PWARegister.tsx

```typescript
useEffect(() => {
  // Calcula tempo até 23:59
  const now = new Date();
  const night = new Date(now);
  night.setHours(23, 59, 0, 0);

  if (now > night) {
    night.setDate(night.getDate() + 1);
  }

  const timeUntil = night.getTime() - now.getTime();

  // Agenda execução
  setTimeout(async () => {
    await fetch("/api/analyze", { method: "POST" });
    scheduleDaily(); // Reagenda para próximo dia
  }, timeUntil);
}, []);
```

**Limitações:**

- Funciona apenas com app aberto
- Se fechado, não executa
- Solução: executar manualmente ou integrar com cron job

## 📱 PWA (Progressive Web App)

### Service Worker (sw.js)

```javascript
// Cache estratégico
const CACHE_NAME = "timeflow-v1";
const urlsToCache = ["/", "/manifest.json"];

// Install: pré-cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch: cache-first strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Manifest (manifest.json)

```json
{
  "name": "TimeFlow Tracker",
  "short_name": "TimeFlow",
  "display": "standalone",
  "start_url": "/",
  "icons": [...]
}
```

## 🎨 Interface

### Componente Principal (page.tsx)

```
┌─────────────────────────────────┐
│ TimeFlow Tracker         [FIXO] │
│ [Digite sua atividade...] ──────│ ← ActivityFlow
├─────────────────────────────────┤
│                                 │
│ EM ANDAMENTO                    │
│ 📍 Estudando React              │ ← TodayActivities
│    há 45min                     │   (currentActivity)
│                                 │
│ HOJE                            │
│ • 09:00-10:30 Café (1h30)      │ ← TodayActivities
│ • 08:00-09:00 Exercício (1h)   │   (finished)
│                                 │
├─────────────────────────────────┤
│ INSIGHTS ANTERIORES             │
│                                 │
│ ONTEM                     8/10  │
│ Foco matinal                    │ ← InsightsFeed
│ • Começou cedo                  │
│ • Tarde dispersa                │
│ 💡 Tente blocos de 25min        │
│                                 │
└─────────────────────────────────┘
         [🔵] ← Botão análise manual
```

## 🔐 Segurança & Privacidade

1. **Dados Locais**: SQLite no filesystem
2. **Sem Autenticação**: Não precisa login
3. **API Key Opcional**: DeepSeek apenas se configurada
4. **CORS**: Apenas localhost em desenvolvimento
5. **Validação**: Input sanitizado no backend

## 🚀 Performance

- **SSR**: Componentes client-side apenas onde necessário
- **Cache**: Service Worker para assets
- **Polling**: Evitado - usa eventos customizados
- **Real-time**: setInterval apenas para duração da atividade atual
- **Bundle**: ~300KB (Next.js otimizado)

## 🔧 Melhorias Futuras

1. **Cron Job Real**: Usar node-cron para análise diária confiável
2. **IndexedDB**: Backup adicional no browser
3. **Export/Import**: JSON backup dos dados
4. **Categorias**: Tags para atividades
5. **Estatísticas**: Gráficos semanais/mensais
6. **Multi-device**: Sync opcional com backend

## 📚 Dependências Principais

```json
{
  "next": "^15.0.4", // Framework React
  "react": "^18.3.1", // UI library
  "drizzle-orm": "^0.36.4", // ORM SQLite
  "better-sqlite3": "^11.7.0", // Driver SQLite
  "tailwindcss": "^3.4.15", // CSS utility
  "typescript": "^5.7.2" // Type safety
}
```

## 🎓 Conceitos Aplicados

- ✅ **Server Components**: Layout e metadata
- ✅ **Client Components**: Interatividade
- ✅ **API Routes**: Backend serverless
- ✅ **SQLite**: Banco relacional local
- ✅ **ORM**: Drizzle para type-safety
- ✅ **PWA**: Instalável e offline
- ✅ **Real-time UI**: React hooks + intervals
- ✅ **Event-driven**: Custom events para comunicação

---

**Arquitetura focada em simplicidade, privacidade e usabilidade.**
