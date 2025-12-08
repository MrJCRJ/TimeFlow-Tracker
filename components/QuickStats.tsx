/**
 * QuickStats - Estatísticas rápidas em 1 linha
 * Exibe: atividades do dia + tempo total + atividade atual
 * Mobile-first: sempre visível (270px altura)
 */

interface QuickStatsProps {
  activitiesCount: number;
  totalMinutes: number;
  currentActivity: {
    title: string;
    durationMinutes: number;
  } | null;
}

export default function QuickStats({
  activitiesCount,
  totalMinutes,
  currentActivity,
}: QuickStatsProps) {
  // Converte minutos em horas e minutos
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Trunca título longo
  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  return (
    <div className="h-[270px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          📊 Hoje
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 my-4">
        {/* Atividades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Atividades
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {activitiesCount}
              </p>
            </div>
          </div>
        </div>

        {/* Tempo Total */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tempo</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {hours}h {minutes}min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Atividade Atual */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-90 mb-1">🎯 Agora</p>
            <p className="font-semibold truncate">
              {currentActivity
                ? truncateTitle(currentActivity.title)
                : "Nenhuma atividade em andamento"}
            </p>
          </div>
          {currentActivity && (
            <div className="ml-3 text-right">
              <p className="text-lg font-bold">
                {currentActivity.durationMinutes}min
              </p>
              <div className="flex items-center gap-1 text-xs opacity-80">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <span>em andamento</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
