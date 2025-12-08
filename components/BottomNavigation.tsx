/**
 * BottomNavigation - Navegação inferior fixa
 * 4 botões: Dashboard | Metas | Padrões | Configurações
 * Mobile-first: sempre fixado na parte inferior (80px)
 */

"use client";

interface BottomNavigationProps {
  onDashboardClick: () => void;
  onGoalsClick: () => void;
  onPatternsClick: () => void;
  onSettingsClick: () => void;
}

export default function BottomNavigation({
  onDashboardClick,
  onGoalsClick,
  onPatternsClick,
  onSettingsClick,
}: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto h-full px-4">
        <div className="grid grid-cols-4 h-full items-center">
          {/* Dashboard */}
          <button
            onClick={onDashboardClick}
            className="flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-2 transition-colors"
            aria-label="Dashboard - Visualizar estatísticas"
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Dashboard
            </span>
          </button>

          {/* Metas */}
          <button
            onClick={onGoalsClick}
            className="flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-2 transition-colors"
            aria-label="Metas - Gerenciar objetivos"
          >
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Metas
            </span>
          </button>

          {/* Padrões */}
          <button
            onClick={onPatternsClick}
            className="flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-2 transition-colors"
            aria-label="Padrões - Ver insights de comportamento"
          >
            <span className="text-2xl">📈</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Padrões
            </span>
          </button>

          {/* Configurações */}
          <button
            onClick={onSettingsClick}
            className="flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-2 transition-colors"
            aria-label="Configurações - Ajustar preferências"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Config
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
