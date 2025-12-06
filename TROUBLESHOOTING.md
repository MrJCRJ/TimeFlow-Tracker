# 🔧 Troubleshooting - TimeFlow Tracker

## ❌ Erro: "Unexpected token '<', "<!DOCTYPE"... is not valid JSON"

Este erro ocorre quando o navegador ainda tem cache antigo do Service Worker tentando acessar APIs que foram removidas.

### ✅ Solução:

#### 1. **Limpar Cache do Service Worker (Recomendado)**

1. Abra o **DevTools** (F12)
2. Vá para a aba **Application** (Chrome) ou **Storage** (Firefox)
3. Na barra lateral esquerda, clique em **Service Workers**
4. Clique em **Unregister** ao lado do Service Worker
5. Volte para **Storage** → **Cache Storage**
6. Clique com botão direito em `timeflow-v1` → **Delete**
7. Recarregue a página com **Ctrl+Shift+R** (hard refresh)

#### 2. **Limpar Todo o Site (Alternativa)**

1. Abra o **DevTools** (F12)
2. Vá para **Application** → **Storage**
3. Clique em **Clear site data**
4. Marque todas as opções
5. Clique em **Clear site data**
6. Recarregue a página

#### 3. **Limpar Cache pelo Navegador**

**Chrome:**

- Ctrl+Shift+Delete
- Marque "Cached images and files"
- Selecione "All time"
- Clique em "Clear data"

**Firefox:**

- Ctrl+Shift+Delete
- Marque "Cache"
- Selecione "Everything"
- Clique em "OK"

---

## 📊 Dados importados não aparecem

### Causas Comuns:

1. **Dados de data antiga** - Atividades antigas não aparecem em "HOJE"
2. **Cache do navegador** - Precisa fazer hard refresh
3. **IndexedDB não carregou** - Verificar console para erros

### ✅ Como Verificar:

1. Clique no botão de **Gerenciar Dados** (canto inferior esquerdo)
2. Clique em **🔍 Debug**
3. Veja quantas atividades estão salvas
4. Abra o Console (F12) para ver detalhes

### ✅ Solução:

1. Use o botão **Debug** para confirmar que os dados foram importados
2. Se os dados estão lá mas não aparecem:

   - Faça hard refresh: **Ctrl+Shift+R**
   - Limpe o cache do navegador
   - Reabra o navegador

3. Se as atividades são antigas (não de hoje):
   - Elas aparecem em **Insights Anteriores** no feed
   - Não em "HOJE" (que mostra só atividades do dia atual)

---

## 🔌 IA offline / Sem resposta da IA

### Causas:

- API Key não configurada ou inválida
- DeepSeek API fora do ar
- Limite de requisições atingido

### ✅ Solução:

1. Verifique se a **DEEPSEEK_API_KEY** está configurada no `.env`
2. Teste a API em: https://platform.deepseek.com/
3. Quando a IA está offline:
   - Inputs são salvos na **fila de pendências**
   - Serão processados quando a IA voltar
   - Você receberá notificação automática

---

## 🗑️ Como apagar todos os dados

⚠️ **ATENÇÃO**: Esta ação não pode ser desfeita!

1. **Recomendação**: Faça backup primeiro
   - Clique em **Gerenciar Dados** → **💾 Exportar**
2. Clique em **Gerenciar Dados** → **🗑️ Apagar Tudo**
3. Confirme duas vezes (segurança)
4. Todos os dados serão removidos do IndexedDB

---

## 📱 PWA não instala / Não funciona offline

### Requisitos para PWA funcionar:

- **HTTPS**: Precisa estar em produção (Vercel, Netlify, etc.)
- **Service Worker**: Deve estar registrado
- **Manifest**: Deve estar presente

### ✅ Verificar:

1. Abra DevTools → Application → Service Workers
2. Deve aparecer um Service Worker ativo
3. Teste offline:
   - DevTools → Network → Marque "Offline"
   - Recarregue a página
   - App deve funcionar

---

## 🚀 Deploy na Vercel/Netlify

O TimeFlow Tracker **agora funciona perfeitamente** na Vercel e outras plataformas serverless!

### ✅ Pré-requisitos:

1. Configure a variável de ambiente:

   ```
   DEEPSEEK_API_KEY=sua-chave-aqui
   ```

2. Faça o deploy normalmente:
   ```bash
   vercel --prod
   # ou
   netlify deploy --prod
   ```

### 🔍 Verificar se o deploy funcionou:

1. Acesse o site
2. Abra o Console (F12)
3. **NÃO** deve haver erros de "SqliteError"
4. **NÃO** deve haver erros de "404" nas APIs antigas

---

## 🆘 Ainda com problemas?

1. **Verifique o Console** (F12) para erros detalhados
2. **Use o botão Debug** para ver o estado do IndexedDB
3. **Limpe o cache** completamente e tente novamente
4. **Abra uma issue** no GitHub com:
   - Print do erro no console
   - Passos para reproduzir
   - Navegador e versão

---

## 📚 Mais Ajuda

- [README.md](./README.md) - Documentação completa
- [MIGRATION.md](./MIGRATION.md) - Guia de migração SQLite → IndexedDB
- [GitHub Issues](https://github.com/MrJCRJ/TimeFlow-Tracker/issues) - Reporte bugs

---

## 📱 Como limpar cache no celular (Passo-a-passo)

Se você está usando o app no celular e vê conteúdo antigo (bundle antigo ou comportamento estranho), siga as instruções abaixo conforme o seu navegador:

- Chrome (Android):

  1.  Abra o site no Chrome.
  2.  Toque no menu (três pontos) → "Informações do site" ou "Configurações do site".
  3.  Toque em "Armazenamento" ou "Limpar e redefinir" e confirme.
  4.  Feche o Chrome (force stop se necessário) e reabra o site.

- Chrome (iOS):

  1.  Abra o app "Ajustes" → Chrome → "Dados do site" → "Limpar dados".
  2.  Ou abra o Chrome → menu → Histórico → Limpar dados de navegação → marque "Imagens e arquivos em cache" → Limpar dados.

- Safari (iOS):

  1.  Abra o app "Ajustes" → Safari → Avançado → Dados dos sites.
  2.  Localize o domínio do app (ex: timeflow-tracker...) e remova os dados do site.
  3.  Em alternativa, em "Safari" → "Limpar Histórico e Dados do Site" (limpa para todos os sites).

- Firefox (Android):
  1.  Abra o site no Firefox.
  2.  Toque no menu → Configurações do site → Armazenamento → Limpar dados.

Se você instalou o PWA (Adicionar à tela inicial):

- No Android: vá em Ajustes do sistema → Apps → TimeFlow (ou Chrome se instalado via Chrome) → Armazenamento → Limpar cache / limpar dados. Depois abra o PWA novamente.
- No iOS (quando PWA é adicionado via Safari): remova o Web App (pressione e segure e remova) e adicione novamente.

---

## 🚨 Recursos no app para limpar cache automaticamente

Implementamos opções para ajudar o usuário a atualizar e limpar caches:

- Atualização automática: quando há uma nova versão do Service Worker, o app mostrará um aviso "Nova versão disponível" e um botão "Atualizar". Ao confirmar, o app aplica a nova versão imediatamente.
- Limpar Cache: no menu "Gerenciar Dados" há uma opção "Limpar Cache" que:
  - Remove todos os caches do Service Worker
  - Desregistra o Service Worker
  - Recarrega a página (garante que você terá a versão atual do app)

Se o seu navegador ainda estiver exibindo o bundle antigo após as ações acima, experimente:

1. Recarregar completamente a página / PWA.
2. Fechar todas as abas do navegador e abrir novamente.
3. Desinstalar e reinstalar o PWA.
