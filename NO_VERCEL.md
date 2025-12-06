# ⚠️ AVISO IMPORTANTE

Este projeto **NÃO funciona na Vercel** ou outras plataformas serverless.

## Por quê?

- Usa **SQLite** (banco de dados em arquivo)
- Vercel tem sistema de arquivos **read-only**
- SQLite precisa **escrever** no arquivo

## Como usar?

**Apenas localmente:**

```bash
git clone https://github.com/MrJCRJ/TimeFlow-Tracker.git
cd TimeFlow-Tracker
npm install
npm run db:push
npm run dev
```

Acesse: http://localhost:3000

---

**Se você quer deploy online, precisa migrar para PostgreSQL primeiro.**

Veja: [VERCEL_DATABASE.md](VERCEL_DATABASE.md)
