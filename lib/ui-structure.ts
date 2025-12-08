/**
 * Estrutura de Interface Mobile-First para TimeFlow
 * Evita sobrecarga visual mantendo funcionalidades
 */

export interface UISection {
  id: string;
  title: string;
  priority: "always" | "expandable" | "modal";
  icon: string;
  description: string;
}

/**
 * Organização de seções por prioridade
 */
export const UI_STRUCTURE: Record<string, UISection> = {
  // ===== SEMPRE VISÍVEL (Above the fold) =====
  activityInput: {
    id: "activity-input",
    title: "Input de Atividade",
    priority: "always",
    icon: "✏️",
    description: "Campo principal - sempre fixo no topo",
  },

  currentActivity: {
    id: "current-activity",
    title: "Atividade Atual",
    priority: "always",
    icon: "🔄",
    description: "Card verde com atividade em andamento",
  },

  quickStats: {
    id: "quick-stats",
    title: "Stats Rápidas",
    priority: "always",
    icon: "📊",
    description: "1 linha: '5 atividades • 4h30min • 💼 Trabalho 60%'",
  },

  // ===== EXPANSÍVEL (Tabs ou Collapse) =====
  todayActivities: {
    id: "today-activities",
    title: "Hoje",
    priority: "expandable",
    icon: "📋",
    description: "Lista de atividades de hoje (colapsável)",
  },

  insights: {
    id: "insights",
    title: "Insights",
    priority: "expandable",
    icon: "💡",
    description: "Feedbacks dos dias anteriores (scroll infinito)",
  },

  // ===== MODAL/PÁGINA SEPARADA =====
  dashboard: {
    id: "dashboard",
    title: "Dashboard",
    priority: "modal",
    icon: "📈",
    description: "Gráficos e análises - abre modal/página",
  },

  goals: {
    id: "goals",
    title: "Metas",
    priority: "modal",
    icon: "🎯",
    description: "Configurar metas - abre modal",
  },

  patterns: {
    id: "patterns",
    title: "Padrões",
    priority: "modal",
    icon: "🔍",
    description: "Análise semanal/mensal - abre modal",
  },

  settings: {
    id: "settings",
    title: "Configurações",
    priority: "modal",
    icon: "⚙️",
    description: "Config de notificações, export, etc",
  },
};

/**
 * Layout Mobile Proposto (em ordem vertical)
 */
export const MOBILE_LAYOUT = `
┌─────────────────────────┐
│ 🔔 TimeFlow             │ ← Header fixo (50px)
├─────────────────────────┤
│ [Digite atividade...] 📤│ ← Input fixo (60px)
├─────────────────────────┤
│                         │
│ 🔄 EM ANDAMENTO         │ ← Card atual (80px)
│ Corrigir bug            │
│ há 41min                │
│                         │
├─────────────────────────┤
│ 📊 5 atividades • 4h30  │ ← Stats 1 linha (40px)
├─────────────────────────┤
│                         │
│ ▼ HOJE                  │ ← Toggle (40px)
│ -------------------     │
│ [Lista se expandido]    │ ← Scroll se necessário
│                         │
├─────────────────────────┤
│                         │
│ ▼ INSIGHTS              │ ← Toggle (40px)
│ -------------------     │
│ [Feedbacks se expandido]│
│                         │
└─────────────────────────┘
│ 📈 📊 🎯 🔍 ⚙️          │ ← Bottom Nav (60px)
└─────────────────────────┘

Total Above the Fold: ~270px (sem scroll)
Resto: Expansível conforme necessário
`;

/**
 * Bottom Navigation Items
 */
export const BOTTOM_NAV_ITEMS = [
  {
    icon: "📊",
    label: "Dashboard",
    opens: "modal",
    content: "Gráficos de produtividade",
  },
  {
    icon: "🎯",
    label: "Metas",
    opens: "modal",
    content: "Definir e acompanhar metas",
  },
  {
    icon: "🔍",
    label: "Padrões",
    opens: "modal",
    content: "Análise de comportamento",
  },
  {
    icon: "⚙️",
    label: "Config",
    opens: "modal",
    content: "Configurações e export",
  },
];

/**
 * Princípios de Design Mobile
 */
export const DESIGN_PRINCIPLES = {
  priority: "Apenas o essencial sempre visível",
  interaction: "Swipe para expandir/colapsar seções",
  navigation: "Bottom nav para features avançadas",
  feedback: "Toasts/snackbar em vez de alertas grandes",
  loading: "Skeleton screens em vez de spinners",
  touch: "Alvos de toque com mínimo 44x44px",
};

/**
 * Configuração de Collapse/Expand
 */
export interface CollapseState {
  todayActivities: boolean; // Default: true (expandido)
  insights: boolean; // Default: false (colapsado)
}

export const DEFAULT_COLLAPSE_STATE: CollapseState = {
  todayActivities: true,
  insights: false,
};
