"use client";

import { useState, useEffect } from "react";
import { getAllActivities, type Activity } from "@/lib/db/indexeddb";

interface DayGroup {
  date: string;
  activities: Activity[];
  totalMinutes: number;
}

/**
 * Componente para visualizar atividades de dias anteriores
 */
export default function HistoryViewer() {
  const [showModal, setShowModal] = useState(false);
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const allActivities = await getAllActivities();

      // Agrupa por dia
      const groups = new Map<string, Activity[]>();

      allActivities.forEach((activity) => {
        const date = new Date(activity.startedAt);
        const dateStr = date.toISOString().split("T")[0];

        if (!groups.has(dateStr)) {
          groups.set(dateStr, []);
        }
        groups.get(dateStr)!.push(activity);
      });

      // Converte para array e calcula totais
      const dayGroupsArray: DayGroup[] = Array.from(groups.entries())
        .map(([date, activities]) => {
          const finishedActivities = activities.filter((a) => a.endedAt);
          const totalMinutes = finishedActivities.reduce(
            (sum, a) => sum + (a.durationMinutes || 0),
            0
          );

          return {
            date,
            activities: activities.sort(
              (a, b) =>
                new Date(a.startedAt).getTime() -
                new Date(b.startedAt).getTime()
            ),
            totalMinutes,
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // Mais recente primeiro

      setDayGroups(dayGroupsArray);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    await loadHistory();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return "HOJE";
    if (date.getTime() === yesterday.getTime()) return "ONTEM";

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  return (
    <>
      {/* Botão para abrir histórico */}
      <button
        onClick={openModal}
        className="fixed bottom-4 left-4 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg text-xl"
        title="Ver histórico de atividades"
      >
        📅
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  📅 Histórico de Atividades
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando histórico...</p>
                </div>
              ) : dayGroups.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma atividade registrada ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {dayGroups.map((dayGroup) => (
                    <div
                      key={dayGroup.date}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setSelectedDate(
                            selectedDate === dayGroup.date
                              ? null
                              : dayGroup.date
                          )
                        }
                        className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 flex justify-between items-center hover:from-indigo-100 hover:to-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {selectedDate === dayGroup.date ? "📂" : "📁"}
                          </span>
                          <div className="text-left">
                            <div className="font-bold text-gray-900">
                              {formatDate(dayGroup.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {dayGroup.activities.length}{" "}
                              {dayGroup.activities.length === 1
                                ? "atividade"
                                : "atividades"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">
                            {formatDuration(dayGroup.totalMinutes)}
                          </div>
                          <div className="text-xs text-gray-500">total</div>
                        </div>
                      </button>

                      {selectedDate === dayGroup.date && (
                        <div className="bg-white p-4 space-y-3">
                          {dayGroup.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-1">
                                    {activity.title}
                                  </div>
                                  {activity.summary &&
                                    activity.summary !== activity.title && (
                                      <div className="text-sm text-gray-600 mb-1">
                                        {activity.summary}
                                      </div>
                                    )}
                                  {activity.category && (
                                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      {activity.category}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  ⏰ {formatTime(activity.startedAt)}
                                  {activity.endedAt &&
                                    ` - ${formatTime(activity.endedAt)}`}
                                </span>
                                {activity.durationMinutes !== undefined && (
                                  <span className="font-medium text-indigo-600">
                                    {formatDuration(activity.durationMinutes)}
                                  </span>
                                )}
                              </div>

                              {activity.aiResponse && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="text-sm text-gray-700 italic">
                                    💬 {activity.aiResponse}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
