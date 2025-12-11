# 🎨 Guia de Uso - Componentes UI

## 🚀 Quick Start

Todos os componentes UI estão disponíveis através de um import centralizado:

```tsx
import { 
  Button, 
  LoadingSpinner, 
  EmptyState,
  StatCard,
  ProgressBar,
  TabBar,
  BottomSheet,
  Input,
  TextArea,
  Alert,
  Badge
} from "@/components/ui";
```

## 📘 Exemplos Práticos

### 1. Criando um Formulário Completo

```tsx
"use client";

import { useState } from "react";
import { Input, TextArea, Button, Alert } from "@/components/ui";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validação e envio...
    
    setLoading(false);
    setSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert type="success" title="Sucesso!">
          Mensagem enviada com sucesso!
        </Alert>
      )}

      <Input
        label="Nome"
        icon="👤"
        placeholder="Seu nome completo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <Input
        label="E-mail"
        type="email"
        icon="📧"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
      />

      <TextArea
        label="Mensagem"
        placeholder="Digite sua mensagem..."
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        rows={5}
        maxLength={500}
        showCount
        error={errors.message}
        required
      />

      <Button 
        type="submit" 
        variant="primary" 
        fullWidth 
        loading={loading}
        icon="📤"
      >
        Enviar Mensagem
      </Button>
    </form>
  );
}
```

### 2. Dashboard com Estatísticas

```tsx
import { StatCard, ProgressBar, Badge } from "@/components/ui";

export default function Dashboard({ stats }) {
  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Usuários Ativos"
          value={stats.activeUsers}
          color="blue"
        />
        <StatCard
          label="Vendas Hoje"
          value={`R$ ${stats.todaySales}`}
          color="green"
        />
        <StatCard
          label="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          color="purple"
        />
        <StatCard
          label="Novos Leads"
          value={stats.newLeads}
          color="orange"
        />
      </div>

      {/* Progresso de Metas */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Meta Mensal</h3>
          <Badge variant="success">Em dia</Badge>
        </div>
        <ProgressBar
          current={stats.currentSales}
          total={stats.monthlySales}
          showLabel
          color="gradient"
        />
      </div>
    </div>
  );
}
```

### 3. Lista com Empty State e Loading

```tsx
import { LoadingSpinner, EmptyState, Button, Badge } from "@/components/ui";

export default function TaskList({ tasks, loading }) {
  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" message="Carregando tarefas..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="✅"
        title="Nenhuma tarefa"
        description="Você está em dia! Crie uma nova tarefa para começar."
        action={
          <Button variant="primary" icon="➕">
            Nova Tarefa
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{task.title}</h4>
            <Badge 
              variant={task.status === "done" ? "success" : "warning"}
            >
              {task.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Modal Mobile-First

```tsx
import { useState } from "react";
import { BottomSheet, Button, Input, Alert } from "@/components/ui";

export default function EditProfileModal({ isOpen, onClose, user }) {
  const [formData, setFormData] = useState(user);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Save logic...
    setSaving(false);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Editar Perfil"
      actions={
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            fullWidth 
            loading={saving}
            onClick={handleSave}
          >
            Salvar
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Alert type="info" icon="💡">
          Suas informações são privadas e seguras.
        </Alert>

        <Input
          label="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="E-mail"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Telefone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
    </BottomSheet>
  );
}
```

### 5. Sistema de Tabs

```tsx
import { useState } from "react";
import { TabBar } from "@/components/ui";

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", icon: "📋", label: "Informações" },
    { id: "activity", icon: "📊", label: "Atividades", count: 12 },
    { id: "settings", icon: "⚙️", label: "Configurações" }
  ];

  return (
    <div>
      <TabBar 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <div className="mt-4">
        {activeTab === "info" && <InfoView />}
        {activeTab === "activity" && <ActivityView />}
        {activeTab === "settings" && <SettingsView />}
      </div>
    </div>
  );
}
```

### 6. Notificações e Alertas

```tsx
import { Alert, Badge } from "@/components/ui";

export default function Notifications({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Alert 
          key={item.id}
          type={item.type}
          title={item.title}
          onClose={() => handleDismiss(item.id)}
        >
          <div className="flex items-center justify-between">
            <p>{item.message}</p>
            <Badge variant={item.priority === "high" ? "danger" : "default"}>
              {item.priority}
            </Badge>
          </div>
        </Alert>
      ))}
    </div>
  );
}
```

### 7. Processo com Múltiplas Etapas

```tsx
import { useState } from "react";
import { ProgressBar, Button, Alert } from "@/components/ui";

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progresso */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">
          Passo {currentStep} de {totalSteps}
        </h2>
        <ProgressBar
          current={currentStep}
          total={totalSteps}
          showLabel={false}
          color="blue"
        />
      </div>

      {/* Conteúdo da Etapa */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
        {currentStep === 4 && <Step4 />}
      </div>

      {/* Navegação */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <Button 
            variant="secondary" 
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            ← Anterior
          </Button>
        )}
        <Button 
          variant="primary" 
          fullWidth
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === totalSteps}
        >
          {currentStep === totalSteps ? "Concluir" : "Próximo →"}
        </Button>
      </div>
    </div>
  );
}
```

### 8. Card de Ação Rápida

```tsx
import { Button, Badge, ProgressBar } from "@/components/ui";

export default function ActionCard({ project }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{project.name}</h3>
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>
        <Badge variant={project.priority === "high" ? "danger" : "default"}>
          {project.priority}
        </Badge>
      </div>

      {/* Progress */}
      <ProgressBar
        current={project.completed}
        total={project.total}
        color="gradient"
      />

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button variant="primary" size="sm" icon="▶️">
          Continuar
        </Button>
        <Button variant="ghost" size="sm" icon="👁️">
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
}
```

## 🎨 Customização de Tema

### Variantes de Cores

Todos os componentes suportam as seguintes variantes de cor:

- **primary** - Azul (ações principais)
- **secondary** - Cinza (ações secundárias)
- **success** - Verde (sucesso, confirmações)
- **warning** - Laranja (avisos, atenção)
- **danger** - Vermelho (erros, exclusões)
- **ghost** - Transparente (ações sutis)

### Tamanhos Padrão

- **sm** - Pequeno (mobile, espaços compactos)
- **md** - Médio (padrão, desktop)
- **lg** - Grande (destaque, CTAs principais)

## 💡 Dicas de Uso

### 1. Combine Componentes
```tsx
<BottomSheet title="Filtros">
  <Input label="Buscar" icon="🔍" />
  <Button variant="primary" fullWidth>Aplicar Filtros</Button>
</BottomSheet>
```

### 2. Use Loading States
```tsx
<Button loading={isSubmitting}>
  {isSubmitting ? "Salvando..." : "Salvar"}
</Button>
```

### 3. Feedback Visual
```tsx
{error && <Alert type="error">{error.message}</Alert>}
{success && <Alert type="success">Operação concluída!</Alert>}
```

### 4. Empty States Informativos
```tsx
<EmptyState
  icon="📭"
  title="Nenhuma mensagem"
  description="Quando alguém te enviar uma mensagem, ela aparecerá aqui."
  action={<Button>Convidar Amigos</Button>}
/>
```

## 📚 Referências

- [Documentação Completa](/REFACTORING.md)
- [Resumo da Refatoração](/REFACTORING_SUMMARY.md)
- [Testes Unitários](/__tests__/ui/)
- [Componentes Goals](/components/goals/)

---

**Pronto para começar!** 🚀

Todos os componentes são mobile-first, acessíveis e totalmente customizáveis.
