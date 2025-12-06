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
  const activities = allActivities?.filter((a) => a.endedAt) || [];

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
    <div className="space-y-6">
      {/* Resposta da IA */}
      {lastAIResponse && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <div className="text-xs opacity-90 mb-1">
                {lastAIResponse.category}
              </div>
              <div className="font-medium">{lastAIResponse.response}</div>
            </div>
          </div>
        </div>
      )}

      {currentActivity && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-green-700 font-semibold">
              EM ANDAMENTO
            </div>
            {currentActivity.category && (
              <div className="text-sm font-medium">
                {currentActivity.category}
              </div>
            )}
          </div>
          <div className="text-xl font-bold text-green-900">
            {currentActivity.summary || currentActivity.title}
          </div>
          <div className="text-sm text-green-700 mt-2">
            Iniciado às {formatTime(currentActivity.startedAt)} • há{" "}
            {formatDuration(currentDuration)}
          </div>
        </div>
      )}

      {activities.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-700">HOJE</h2>
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {activity.category && (
                      <div className="text-xs text-gray-500 mb-1">
                        {activity.category}
                      </div>
                    )}
                    <div className="font-medium text-gray-900">
                      {activity.summary || activity.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTime(activity.startedAt)} -{" "}
                      {activity.endedAt && formatTime(activity.endedAt)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600 ml-4">
                    {formatDuration(activity.durationMinutes || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activities.length === 0 && !currentActivity && (
        <div className="text-center text-gray-400 py-8">
          Nenhuma atividade registrada hoje
        </div>
      )}
    </div>
  );
}
