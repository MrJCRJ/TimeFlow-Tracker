/**
 * QuickStats - Estatísticas do dia com categorias
 * Exibe: tempo por categoria + atividade atual
 * Mobile-first: sempre visível
 */

"use client";

import { useState, useEffect } from "react";

interface QuickStatsProps {
  activitiesCount: number;
  totalMinutes: number;
  currentActivity: {
    title: string;
    durationMinutes: number;
    startedAt?: Date;
  } | null;
  byCategory: Record<string, number>; // categoria → minutos
}

export default function QuickStats({
  totalMinutes,
  currentActivity,
  byCategory,
}: QuickStatsProps) {
  // Estado para duração em tempo real
  const [liveMinutes, setLiveMinutes] = useState(
    currentActivity?.durationMinutes || 0
  );

  // Atualiza duração da atividade em andamento a cada segundo
  useEffect(() => {
    if (!currentActivity?.startedAt) {
      setLiveMinutes(0);
      return;
    }

    const updateDuration = () => {
      const start = currentActivity.startedAt!.getTime();
      const now = Date.now();
      const minutes = Math.floor((now - start) / 60000);
      setLiveMinutes(minutes);
    };

    updateDuration(); // Atualiza imediatamente
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [currentActivity]);

  // Top 3 categorias
  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 space-y-4">
      {/* Atividade Atual */}
      {currentActivity && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs opacity-90 mb-0.5">🎯 Agora</p>
              <p className="font-semibold text-sm truncate">
                {currentActivity.title}
              </p>
            </div>
            <div className="ml-3 text-right">
              <p className="text-xl font-bold">{liveMinutes}min</p>
              <div className="flex items-center gap-1 text-xs opacity-80">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <span>em andamento</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tempo por Categoria */}
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Tempo por categoria:
          </p>
          {topCategories.map(([category, mins]) => {
            const catHours = Math.floor(mins / 60);
            const catMins = mins % 60;
            const percentage =
              totalMinutes > 0 ? (mins / totalMinutes) * 100 : 0;

            return (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="text-xs flex-shrink-0 w-20 truncate text-gray-700 dark:text-gray-300"
                  title={category}
                >
                  {category}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden min-w-0">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0 w-12 text-right font-medium">
                  {catHours > 0 && `${catHours}h`}
                  {catMins}min
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
