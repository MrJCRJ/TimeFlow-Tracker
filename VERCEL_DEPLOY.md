# 🚀 Deploy na Vercel - Configuração

## ⚠️ ATENÇÃO: Variáveis de Ambiente

O deploy na Vercel vai **FALHAR** se você não configurar as variáveis de ambiente!

## 🔧 Como Configurar

### 1. Acesse o Dashboard da Vercel

Vá para: https://vercel.com/dashboard

### 2. Selecione seu projeto

Clique em `timeflow-tracker`

### 3. Configurar Environment Variables

1. Vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

| Name               | Value                      | Environment                      |
| ------------------ | -------------------------- | -------------------------------- |
| `DEEPSEEK_API_KEY` | `sk-sua-key-aqui`          | Production, Preview, Development |
| `DEEPSEEK_URL`     | `https://api.deepseek.com` | Production, Preview, Development |
| `DEEPSEEK_MODEL`   | `deepseek-chat`            | Production, Preview, Development |

3. Clique em **Save**

### 4. Redeploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**

## 🔒 Segurança

**NUNCA commite seu arquivo `.env` com API keys!**

✅ O `.gitignore` já está protegendo o `.env`
✅ Sempre use variáveis de ambiente na Vercel
✅ Cada desenvolvedor deve ter seu próprio `.env` local

## 📝 Para desenvolvedores do projeto

Se alguém clonar o repositório:

1. Copie o `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Edite o `.env` e adicione suas próprias keys:
   ```env
   DEEPSEEK_API_KEY=sk-sua-key-aqui
   DEEPSEEK_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-chat
   ```

## 🐛 Troubleshooting

### Deploy falha com erro de "Missing environment variables"

**Solução**: Configure as variáveis no dashboard da Vercel (passo 3 acima)

### Build funciona local mas falha na Vercel

**Causa comum**: Diferenças nas variáveis de ambiente

**Solução**:

1. Verifique se todas as variáveis estão configuradas na Vercel
2. Certifique-se que os nomes das variáveis estão EXATAMENTE iguais

### API DeepSeek retorna erro 401

**Causa**: API Key inválida ou expirada

**Solução**:

1. Gere uma nova key em https://platform.deepseek.com
2. Atualize no dashboard da Vercel
3. Redeploy

## 🎯 Checklist de Deploy

Antes de fazer deploy:

- [ ] `.env` está no `.gitignore`
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build local funciona (`npm run build`)
- [ ] Sem erros de TypeScript
- [ ] README atualizado com link do deploy

## 🌐 Após Deploy Bem-Sucedido

Sua aplicação estará disponível em:

```
https://timeflow-tracker.vercel.app
```

(ou o domínio que a Vercel gerar)

Atualize o README com o link:

```markdown
## 🌐 Demo Online

Acesse: [https://timeflow-tracker.vercel.app](https://timeflow-tracker.vercel.app)
```

---

**Lembre-se**: Proteja suas API keys! 🔒
