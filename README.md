# 🕐 TimeFlow Tracker

> **Rastreador de atividades inteligente com IA** - 100% Browser, Privado e Automático.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Browser-green)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-AI-purple)](https://deepseek.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✅ ATUALIZAÇÃO: Agora funciona na Vercel!

> **🎉 Migrado para IndexedDB!**
>
> Dados armazenados no navegador - funciona online E offline!
>
> **Deploy na Vercel funcionando perfeitamente.**

---

## 💾 Armazenamento no Navegador

**TimeFlow Tracker usa IndexedDB** - banco de dados nativo do navegador.

- 💾 **Dados no navegador**: Tudo armazenado localmente no seu navegador
- 🔒 **Privacidade Total**: Nada enviado para servidor (exceto IA)
- 🌐 **Funciona online**: Deploy na Vercel/Netlify OK
- 📱 **PWA Completo**: Funciona offline após primeira visita
- 📦 **Exportar/Importar**: Faça backup em JSON quando quiser
- 🔄 **Multi-dispositivo**: Use em qualquer navegador (dados separados por navegador)

## ✨ O que torna o TimeFlow único?

Diferente de outros time trackers que exigem botões start/stop e timers manuais:

- 🎯 **Zero fricção**: Apenas digite o que está fazendo
- 🤖 **IA integrada**: Análise automática com aprendizado contínuo
- 📊 **Auto-análise**: Insights diários, semanais e mensais automáticos
- 💾 **100% Local**: Dados privados no seu computador (SQLite)
- 🔄 **Fluxo contínuo**: Nova atividade = anterior encerrada automaticamente
- 📱 **PWA**: Funciona offline e pode ser instalado como app

## 🚀 Início Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/MrJCRJ/TimeFlow-Tracker.git
cd TimeFlow-Tracker

# 2. Instale as dependências
npm install

# 3. Configure o banco de dados
npm run db:push

# 4. Configure a API DeepSeek (OBRIGATÓRIO)
cp .env.example .env
# Edite .env e adicione: DEEPSEEK_API_KEY=sk-sua-key-aqui

# 5. Inicie o servidor
npm run dev
```

Acesse: **http://localhost:3000**

> ⚠️ **IMPORTANTE**:
>
> - A API DeepSeek é obrigatória para análises inteligentes
> - Mantenha o terminal rodando enquanto usa o app
> - Seus dados ficam salvos em `local.db`

## 🎯 Como Funciona

### 1️⃣ Registre suas atividades

Simplesmente digite o que está fazendo:

```
"Estudando React"       → Enter
"Fazendo café"          → Enter
"Respondendo e-mails"   → Enter
```

✅ Cada nova atividade encerra a anterior automaticamente!

### 2️⃣ IA detecta sua intenção

A IA analisa o que você digitou e classifica como:

- **📋 Atividade**: Registra e cronometra
- **💬 Chat**: Conversa natural com a IA
- **❓ Pergunta**: Responde dúvidas específicas
- **📝 Feedback**: Registra observações

### 3️⃣ Análises automáticas

O sistema gera análises automaticamente:

| Tipo           | Quando              | O que analisa        |
| -------------- | ------------------- | -------------------- |
| 📊 **Diária**  | 23:59 todos os dias | Padrões do dia       |
| 📅 **Semanal** | Domingos às 23:59   | Tendências da semana |
| 📆 **Mensal**  | Último dia às 23:59 | Evolução mensal      |

### 4️⃣ IA aprende com você

A cada análise, a IA:

- 🧠 Aprende seus padrões de trabalho
- 📈 Reconhece sua evolução
- 🎯 Ajusta sugestões ao SEU perfil
- 💡 Fica mais inteligente a cada dia

## 🛠️ Tecnologias

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[SQLite](https://www.sqlite.org/)** - Banco de dados local
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe ORM
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utility-first
- **[DeepSeek API](https://platform.deepseek.com/)** - IA para análises

## 📦 Estrutura do Projeto

```
timeflow-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # Endpoints da API
│   │   ├── analyze/       # Análises automáticas
│   │   ├── chat/          # Chat com IA
│   │   ├── detect-intent/ # Detecção de intenção
│   │   ├── flow/          # Fluxo de atividades
│   │   ├── export-all/    # Exportar dados
│   │   ├── import/        # Importar dados
│   │   └── ...
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/             # Componentes React
│   ├── ActivityFlow.tsx   # Input principal
│   ├── TodayActivities.tsx # Lista de atividades
│   ├── InsightsFeed.tsx   # Feed de insights
│   ├── AutoAnalyzer.tsx   # Análises automáticas
│   ├── DataManager.tsx    # Exportar/Importar
│   └── ...
├── lib/                   # Lógica de negócio
│   ├── db/               # Database
│   │   ├── schema.ts     # Schema do banco
│   │   └── index.ts      # Conexão
│   ├── ai-service.ts     # Serviços de IA
│   ├── intent-detection.ts # Detecção de intenção
│   ├── pending-queue.ts  # Fila offline
│   └── daily-analysis.ts # Análises diárias
├── public/                # Arquivos estáticos
└── ...
```

## 🔑 Configuração DeepSeek API

1. **Criar conta**: Acesse [platform.deepseek.com](https://platform.deepseek.com)
2. **Gerar API Key**: Navegue até API Keys e crie uma nova
3. **Configurar**: Adicione ao `.env`:

```env
DEEPSEEK_API_KEY=sk-sua-key-aqui
```

### Por que DeepSeek?

- ✅ **Custo-benefício**: Muito mais barato que GPT-4
- ✅ **Performance**: Respostas rápidas e precisas
- ✅ **Privacidade**: Seus dados não treinam o modelo
- ✅ **Confiável**: Alta disponibilidade

## 💾 Exportar/Importar Dados

O TimeFlow permite fazer backup completo dos seus dados:

1. **Exportar**: Clique no botão de dados (canto inferior esquerdo) → Exportar
2. **Importar**: Clique no botão de dados → Importar → Selecione o arquivo JSON

O backup inclui:

- ✅ Todas as atividades
- ✅ Todos os insights (diários, semanais, mensais)
- ✅ Inputs pendentes (offline queue)

## 🔒 Privacidade e Segurança

- **Dados locais**: Tudo armazenado em SQLite local
- **Sem cloud**: Nenhum dado enviado para servidores externos (exceto IA)
- **Auto-limpeza**: Atividades brutas deletadas após análise diária
- **Apenas insights**: Somente resumos e análises são mantidos
- **Você controla**: Exportar, importar ou apagar tudo quando quiser

## 📊 Schema do Banco

### `activities_local` (Temporário - deletado diariamente)

```typescript
{
  id: number;
  title: string; // Texto original
  summary: string; // Resumo pela IA
  category: string; // Categoria (ex: 🏠 Casa)
  aiResponse: string; // Resposta motivacional
  startedAt: timestamp;
  endedAt: timestamp;
  durationMinutes: number;
}
```

### `feedbacks_local` (Permanente)

```typescript
{
  id: number
  date: string            // YYYY-MM-DD
  type: "daily"|"weekly"|"monthly"
  theme: string           // Tema principal
  score: number           // 0-10
  insights: string[]      // Array de insights
  suggestion: string      // Sugestão
  createdAt: timestamp
}
```

### `pending_inputs` (Fila offline)

```typescript
{
  id: number;
  text: string; // Input do usuário
  timestamp: timestamp; // Quando digitou
  processed: boolean; // Já processado?
  processedAt: timestamp;
  result: string; // JSON com resultado
}
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pelo incrível framework
- [DeepSeek](https://deepseek.com/) pela IA poderosa e acessível
- [Drizzle ORM](https://orm.drizzle.team/) pelo ORM type-safe
- Comunidade open source! 💙

---

**Desenvolvido com ❤️ para pessoas produtivas**

## 📊 Banco de Dados

### Tabela 1: `activities_local` (TEMPORÁRIA)

Armazena atividades do dia atual. **DELETADA** após análise diária.

### Tabela 2: `feedbacks_local` (PERMANENTE)

Armazena apenas os insights da IA. Guardado para sempre.

## 🔧 Scripts Disponíveis

```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run start      # Iniciar produção
npm run db:push    # Atualizar banco de dados
npm run db:studio  # Visualizar banco (Drizzle Studio)
```

## 📱 PWA (Progressive Web App)

O app funciona offline e pode ser instalado:

- **Desktop**: Botão de instalação no navegador
- **Mobile**: "Adicionar à tela inicial"

## 🛠️ Estrutura do Projeto

```
TimeFlow Tracker/
├── app/
│   ├── api/
│   │   ├── flow/route.ts      # POST nova atividade
│   │   ├── today/route.ts     # GET atividades do dia
│   │   ├── insights/route.ts  # GET feedbacks salvos
│   │   └── analyze/route.ts   # POST análise manual
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ActivityFlow.tsx       # Campo de entrada
│   ├── TodayActivities.tsx    # Lista do dia
│   ├── InsightsFeed.tsx       # Feedbacks anteriores
│   └── PWARegister.tsx        # Service Worker
├── lib/
│   ├── db/
│   │   ├── index.ts          # Conexão SQLite
│   │   └── schema.ts         # Schemas Drizzle
│   └── daily-analysis.ts     # Lógica de análise
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker
└── local.db                  # SQLite (criado automaticamente)
```

## 🎯 Funcionalidades Principais

### ✅ Fluxo Contínuo

- Uma atividade sempre em andamento
- Nova entrada = encerra anterior
- Sem necessidade de "parar" manualmente

### ✅ Análise Diária Automática

- Executa às 23:59
- Chama IA ou análise local
- Gera insights construtivos
- **Deleta atividades brutas**

### ✅ Interface Minimalista

- Campo de texto único
- Atividade atual destacada
- Lista do dia
- Feedbacks anteriores

### ✅ Offline-First

- Funciona sem internet
- SQLite local
- Service Worker para cache

## 💡 Conceitos de Design

1. **Zero Fricção**: Apenas digite e tecle Enter
2. **Fluxo Natural**: Reflita como você realmente trabalha
3. **Privacidade**: Tudo local, nada em servidor externo
4. **Minimalismo**: Sem features desnecessárias

## 🔐 Privacidade & Dados

- ✅ **100% Local**: SQLite no seu computador
- ✅ **Sem Login**: Sem contas, sem autenticação
- ✅ **Dados Temporários**: Atividades deletadas após análise
- ⚠️ **API Externa**: Apenas se configurar DeepSeek (opcional)

## 🐛 Debug

### Executar Análise Manualmente

Clique no botão flutuante azul (canto inferior direito) para forçar análise do dia.

### Visualizar Banco

```bash
npm run db:studio
```

Abre interface visual em `http://localhost:4983`

## 📝 Licença

MIT - Use como quiser!

## 🤝 Contribuições

PRs são bem-vindos! Mantenha a simplicidade.

---

**Feito com ❤️ para quem ama produtividade simples**
