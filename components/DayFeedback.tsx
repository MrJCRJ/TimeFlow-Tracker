"use client";

import { useTodayActivities } from "@/lib/hooks/useDatabase";
import { useMemo } from "react";

interface DayStats {
  totalActivities: number;
  totalMinutes: number;
  byCategory: Record<string, number>; // categoria → minutos
  currentStreak: number; // atividades consecutivas
}

export default function DayFeedback() {
  const activities = useTodayActivities();

  const stats = useMemo<DayStats | null>(() => {
    if (!activities || activities.length === 0) return null;

    const finishedActivities = activities.filter((a) => a.endedAt);
    const totalMinutes = finishedActivities.reduce(
      (sum, a) => sum + (a.durationMinutes || 0),
      0
    );

    const byCategory: Record<string, number> = {};
    finishedActivities.forEach((a) => {
      const category = a.category || "Sem categoria";
      byCategory[category] =
        (byCategory[category] || 0) + (a.durationMinutes || 0);
    });

    return {
      totalActivities: finishedActivities.length,
      totalMinutes,
      byCategory,
      currentStreak: finishedActivities.length,
    };
  }, [activities]);

  if (!stats || stats.totalActivities === 0) return null;

  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
        📊 SEU DIA HOJE
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-white rounded-lg p-2">
          <div className="text-lg font-bold text-blue-600">
            {stats.totalActivities}
          </div>
          <div className="text-xs text-gray-600">atividades</div>
        </div>

        <div className="bg-white rounded-lg p-2">
          <div className="text-lg font-bold text-green-600">
            {hours > 0 && `${hours}h`}
            {minutes}min
          </div>
          <div className="text-xs text-gray-600">registrados</div>
        </div>
      </div>

      {Object.keys(stats.byCategory).length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-gray-600 mb-1.5">
            Por categoria:
          </div>
          {Object.entries(stats.byCategory).map(([category, mins]) => {
            const catHours = Math.floor(mins / 60);
            const catMins = mins % 60;
            const percentage = (mins / stats.totalMinutes) * 100;

            return (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="text-xs flex-shrink-0 w-20 truncate"
                  title={category}
                >
                  {category}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden min-w-0">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 flex-shrink-0 w-12 text-right">
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
