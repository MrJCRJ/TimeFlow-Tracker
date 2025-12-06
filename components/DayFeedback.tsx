"use client";

import { useEffect, useState } from "react";

interface DayStats {
  totalActivities: number;
  totalMinutes: number;
  byCategory: Record<string, number>; // categoria → minutos
  currentStreak: number; // atividades consecutivas
}

export default function DayFeedback() {
  const [stats, setStats] = useState<DayStats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/day-stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleUpdate = () => fetchStats();
    window.addEventListener("activityUpdated", handleUpdate);

    // Atualiza a cada minuto
    const interval = setInterval(fetchStats, 60000);

    return () => {
      window.removeEventListener("activityUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  if (!stats || stats.totalActivities === 0) return null;

  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3">📊 SEU DIA HOJE</h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalActivities}
          </div>
          <div className="text-xs text-gray-600">atividades</div>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {hours > 0 && `${hours}h`}
            {minutes}min
          </div>
          <div className="text-xs text-gray-600">registrados</div>
        </div>
      </div>

      {Object.keys(stats.byCategory).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Por categoria:
          </div>
          {Object.entries(stats.byCategory).map(([category, mins]) => {
            const catHours = Math.floor(mins / 60);
            const catMins = mins % 60;
            const percentage = (mins / stats.totalMinutes) * 100;

            return (
              <div key={category} className="flex items-center gap-2">
                <div className="text-sm flex-shrink-0 w-32">{category}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 flex-shrink-0 w-16 text-right">
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
