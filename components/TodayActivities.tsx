"use client";

import { useEffect, useState } from "react";
import { useTodayActivities } from "@/lib/hooks/useDatabase";

export default function TodayActivities() {
  const allActivities = useTodayActivities();
  const [currentDuration, setCurrentDuration] = useState(0);
  const [lastAIResponse, setLastAIResponse] = useState<{
    response: string;
    category: string;
  } | null>(null);

  // Separa atividades em andamento e finalizadas
  const currentActivity = allActivities?.find((a) => !a.endedAt) || null;
  const activities = (allActivities?.filter((a) => a.endedAt) || []).sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  ); // Mais recente primeiro

  // Verifica se há atividades de dias anteriores sendo mostradas
  const hasOldActivities = activities.some((a) => {
    const activityDate = new Date(a.startedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityDate < today;
  });

  useEffect(() => {
    // Atualiza resposta da IA
    if (currentActivity && currentActivity.aiResponse) {
      setLastAIResponse({
        response: currentActivity.aiResponse,
        category: currentActivity.category || "",
      });
    }
  }, [currentActivity]);

  // Atualiza duração da atividade atual a cada segundo
  useEffect(() => {
    if (!currentActivity) return;

    const interval = setInterval(() => {
      const start = currentActivity.startedAt.getTime();
      const now = Date.now();
      const minutes = Math.floor((now - start) / 60000);
      setCurrentDuration(minutes);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentActivity]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins + "min" : ""}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-3">
      {/* Resposta da IA */}
      {lastAIResponse && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-2.5 shadow-lg">
          <div className="flex items-start gap-2">
            <div className="text-xl">🤖</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs opacity-90 mb-0.5">
                {lastAIResponse.category}
              </div>
              <div className="font-medium text-xs break-words">
                {lastAIResponse.response}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentActivity && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="text-xs text-green-700 font-semibold">
              EM ANDAMENTO
            </div>
            {currentActivity.category && (
              <div className="text-xs font-medium truncate">
                {currentActivity.category}
              </div>
            )}
          </div>
          <div className="text-base font-bold text-green-900 break-words">
            {currentActivity.summary || currentActivity.title}
          </div>
          <div className="text-xs text-green-700 mt-1.5">
            Iniciado às {formatTime(currentActivity.startedAt)} • há{" "}
            {formatDuration(currentDuration)}
          </div>
        </div>
      )}

      {activities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">HOJE</h2>
            {hasOldActivities && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                ⚠️ Contém atividades antigas
              </span>
            )}
          </div>
          <div className="space-y-2">
            {activities.map((activity) => {
              const activityDate = new Date(activity.startedAt);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isOld = activityDate < today;

              return (
                <div
                  key={activity.id}
                  className={`bg-white border rounded-lg p-2.5 hover:shadow-sm transition-shadow ${
                    isOld
                      ? "border-orange-300 bg-orange-50/50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {activity.category && (
                        <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                          {activity.category}
                          {isOld && (
                            <span className="text-orange-600 text-xs">
                              📅 {activityDate.toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="font-medium text-sm text-gray-900 break-words">
                        {activity.summary || activity.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatTime(activity.startedAt)} -{" "}
                        {activity.endedAt && formatTime(activity.endedAt)}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                      {formatDuration(activity.durationMinutes || 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activities.length === 0 && !currentActivity && (
        <div className="text-center text-gray-400 py-6 text-sm">
          Nenhuma atividade registrada hoje
        </div>
      )}
    </div>
  );
}
