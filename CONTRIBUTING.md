# 🤝 Contribuindo para o TimeFlow Tracker

Obrigado por considerar contribuir! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Padrões de Código](#padrões-de-código)
- [Estrutura de Commits](#estrutura-de-commits)
- [Pull Requests](#pull-requests)

## 🤗 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/timeflow-tracker.git
cd timeflow-tracker

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-usuario/timeflow-tracker.git
```

### 2. Configurar Ambiente

```bash
# Instale as dependências
npm install

# Configure o banco de dados
npm run db:push

# Configure variáveis de ambiente
cp .env.example .env
# Adicione sua DEEPSEEK_API_KEY
```

### 3. Criar uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma branch descritiva
git checkout -b feature/minha-feature
# ou
git checkout -b fix/correcao-bug
```

### 4. Fazer Mudanças

- Escreva código limpo e documentado
- Siga os padrões do projeto
- Teste suas mudanças localmente
- Adicione comentários quando necessário

### 5. Commit e Push

```bash
# Adicione os arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "Add: Nova funcionalidade X"

# Push para seu fork
git push origin feature/minha-feature
```

### 6. Abrir Pull Request

1. Vá até seu fork no GitHub
2. Clique em "Pull Request"
3. Preencha o template de PR
4. Aguarde review

## 📝 Padrões de Código

### TypeScript

- Use **TypeScript** para todo código
- Defina tipos explícitos sempre que possível
- Evite `any`, prefira `unknown` se necessário

```typescript
// ✅ Bom
interface Activity {
  id: number;
  title: string;
  startedAt: Date;
}

// ❌ Evitar
const activity: any = {...};
```

### Componentes React

- Use **"use client"** apenas quando necessário
- Prefira Server Components quando possível
- Nomeie componentes com PascalCase

```tsx
// ✅ Componente Server (padrão)
export default function MyComponent() {
  return <div>...</div>;
}

// ✅ Componente Client (quando necessário)
"use client";
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### Estilização

- Use **Tailwind CSS** classes
- Mantenha classes organizadas (layout → spacing → colors → outros)
- Extraia componentes quando classes ficarem muito longas

```tsx
// ✅ Bom
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow">

// ❌ Evitar inline styles
<div style={{display: 'flex', padding: '24px'}}>
```

### API Routes

- Valide inputs sempre
- Use try-catch para errors
- Retorne status codes apropriados

```typescript
// ✅ Bom
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    // ... lógica
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
```

## 📦 Estrutura de Commits

Use commits semânticos:

- **Add**: Nova funcionalidade
- **Fix**: Correção de bug
- **Update**: Atualização de feature existente
- **Remove**: Remoção de código/arquivo
- **Refactor**: Refatoração sem mudar comportamento
- **Docs**: Apenas documentação
- **Style**: Formatação, espaços, etc
- **Test**: Adicionar/corrigir testes
- **Chore**: Tarefas de manutenção

Exemplos:

```bash
git commit -m "Add: Exportação de dados em CSV"
git commit -m "Fix: Bug no cálculo de duração"
git commit -m "Update: Melhorar UI do botão de envio"
git commit -m "Refactor: Extrair lógica de IA para service"
git commit -m "Docs: Atualizar README com novas features"
```

## 🔍 Pull Requests

### Checklist antes de abrir PR

- [ ] Código compila sem erros (`npm run build`)
- [ ] Nenhum erro de TypeScript
- [ ] Testado localmente
- [ ] Comentários adicionados quando necessário
- [ ] README atualizado (se aplicável)
- [ ] Commits seguem padrão semântico

### Template de PR

```markdown
## Descrição
[Descreva as mudanças feitas]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
[Passos para testar as mudanças]

## Screenshots (se aplicável)
[Adicione screenshots se houver mudanças visuais]

## Checklist
- [ ] Código testado localmente
- [ ] TypeScript sem erros
- [ ] Documentação atualizada
```

## 🐛 Reportar Bugs

Use a aba **Issues** do GitHub e inclua:

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado vs atual**
4. **Screenshots** (se aplicável)
5. **Ambiente** (OS, Node version, etc)

## 💡 Sugerir Features

Abra uma **Issue** com:

1. **Descrição da feature**
2. **Problema que resolve**
3. **Como deveria funcionar**
4. **Mockups** (se tiver)

## ❓ Dúvidas

Se tiver dúvidas:

1. Verifique a **documentação** (README, ARCHITECTURE.md)
2. Procure em **Issues** existentes
3. Abra uma nova **Issue** com sua dúvida

## 🙏 Agradecimentos

Toda contribuição é valiosa! Obrigado por ajudar a melhorar o TimeFlow Tracker! 💙

---

**Feliz coding!** 🚀
