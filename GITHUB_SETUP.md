# 🚀 Como enviar para o GitHub

## Passo 1: Criar repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New repository" (botão verde no canto superior direito)
3. Preencha:
   - **Repository name**: `timeflow-tracker`
   - **Description**: `🕐 AI-powered activity tracker with continuous flow and intelligent insights`
   - **Visibility**: Public (ou Private, se preferir)
   - ⚠️ **NÃO marque** "Initialize with README" (já temos um)
4. Clique em "Create repository"

## Passo 2: Conectar repositório local ao GitHub

Após criar o repositório no GitHub, copie a URL (será algo como `https://github.com/seu-usuario/timeflow-tracker.git`)

Execute os comandos abaixo no terminal (substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub):

```bash
# Adicione o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/timeflow-tracker.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Envie o código para o GitHub
git push -u origin main
```

## Passo 3: Verificar

Após executar os comandos acima, acesse:
```
https://github.com/SEU_USUARIO/timeflow-tracker
```

Você verá todo o código no GitHub! 🎉

## 📝 Próximos passos (opcional)

### Adicionar tópicos no GitHub

No repositório, clique em ⚙️ (Settings ao lado de About) e adicione tópicos:
- `nextjs`
- `typescript`
- `sqlite`
- `ai`
- `deepseek`
- `activity-tracker`
- `time-tracking`
- `pwa`

### Configurar GitHub Pages (para documentação)

Se quiser hospedar a documentação:
1. Vá em Settings → Pages
2. Source: Deploy from a branch
3. Branch: main → /docs (se criar uma pasta docs)

### Adicionar badges ao README

O README já inclui badges, mas você pode adicionar mais em:
- [shields.io](https://shields.io)

## 🔄 Atualizações futuras

Quando fizer mudanças no código:

```bash
# Adicione as mudanças
git add .

# Faça commit com mensagem descritiva
git commit -m "Add: Nova funcionalidade X"

# Envie para o GitHub
git push
```

## ⚠️ Importante

**Nunca commite:**
- ❌ Arquivo `.env` (com API keys)
- ❌ Arquivos `local.db*` (banco de dados local)
- ❌ Pasta `node_modules`
- ❌ Pasta `.next`

Esses arquivos já estão no `.gitignore` e não serão enviados.

---

**Pronto! Seu projeto está no GitHub!** 🎊
