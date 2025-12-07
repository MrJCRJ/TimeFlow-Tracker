"use client";

import { useState } from "react";
import { getAllActivities, db } from "@/lib/db/indexeddb";

/**
 * Componente para gerar análises manuais de dias anteriores
 */
export default function ManualAnalyzer() {
  const [selectedDate, setSelectedDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const generateAnalysis = async () => {
    if (!selectedDate || generating) return;

    setGenerating(true);
    setResult(null);

    try {
      const targetDate = new Date(selectedDate + "T00:00:00");
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const dateStr = targetDate.toISOString().split("T")[0];

      console.log("📊 Gerando análise para:", dateStr);

      // Verifica se já existe análise
      const existingFeedback = await db.feedbacks
        .where("date")
        .equals(dateStr)
        .first();

      if (existingFeedback) {
        setResult(
          `⚠️ Análise já existe para ${targetDate.toLocaleDateString("pt-BR")}`
        );
        setGenerating(false);
        return;
      }

      // Busca atividades do dia no IndexedDB
      const allActivities = await getAllActivities();
      const activities = allActivities.filter((a) => {
        const activityDate = new Date(a.startedAt);
        return activityDate >= targetDate && activityDate < nextDay;
      });

      if (activities.length === 0) {
        setResult(
          `❌ Nenhuma atividade encontrada para ${targetDate.toLocaleDateString(
            "pt-BR"
          )}`
        );
        setGenerating(false);
        return;
      }

      console.log(`📋 ${activities.length} atividades encontradas`);

      // Busca feedbacks anteriores para contexto
      const previousFeedbacks = await db.feedbacks
        .orderBy("date")
        .reverse()
        .limit(7)
        .toArray();

      // Envia para API processar com IA
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activities: activities.map((a) => ({
            title: a.title,
            startedAt: a.startedAt.toISOString(),
            durationMinutes: a.durationMinutes || 0,
          })),
          previousFeedbacks: previousFeedbacks.map((f) => ({
            date: f.date,
            score: f.score,
            theme: f.theme,
            insights: Array.isArray(f.insights) ? f.insights : [],
            suggestion: f.suggestion,
          })),
          dateStr,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Salva feedback no IndexedDB
        await db.feedbacks.add({
          date: dateStr,
          type: "daily",
          theme: data.analysis.theme,
          score: data.analysis.score,
          insights: data.analysis.insights,
          suggestion: data.analysis.suggestion,
          createdAt: new Date(),
        });

        // Deleta atividades analisadas
        const activitiesToDelete = activities
          .map((a) => a.id)
          .filter((id): id is number => id !== undefined);

        for (const id of activitiesToDelete) {
          await db.activities.delete(id);
        }

        console.log(`✅ ${activitiesToDelete.length} atividades deletadas`);

        setResult(
          `✅ Análise gerada com sucesso para ${targetDate.toLocaleDateString(
            "pt-BR"
          )}!`
        );

        // Atualiza a página para mostrar novos insights
        setTimeout(() => {
          window.dispatchEvent(new Event("activityUpdated"));
          setShowModal(false);
          setSelectedDate("");
          setResult(null);
        }, 2000);
      } else {
        const error = await response.json();
        setResult(`❌ Erro: ${error.error || "Falha ao gerar análise"}`);
      }
    } catch (error) {
      console.error("Erro ao gerar análise:", error);
      setResult("❌ Erro ao gerar análise. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const checkDaysWithActivities = async () => {
    const activities = await getAllActivities();
    const daysSet = new Set<string>();

    activities.forEach((activity) => {
      const date = new Date(activity.startedAt);
      const dateStr = date.toISOString().split("T")[0];
      daysSet.add(dateStr);
    });

    return Array.from(daysSet).sort().reverse();
  };

  const [daysWithActivities, setDaysWithActivities] = useState<string[]>([]);

  const loadDays = async () => {
    const days = await checkDaysWithActivities();
    setDaysWithActivities(days);
    setShowModal(true);
  };

  return (
    <>
      {/* Botão para abrir modal */}
      <button
        onClick={loadDays}
        className="fixed bottom-4 right-4 z-40 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg text-xl"
        title="Gerar análise de dia anterior"
      >
        📊
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                📊 Análise Manual
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDate("");
                  setResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Selecione um dia para gerar a análise e insights:
            </p>

            {daysWithActivities.length > 0 ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias com atividades:
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={generating}
                  >
                    <option value="">Selecione um dia...</option>
                    {daysWithActivities.map((date) => {
                      const d = new Date(date + "T00:00:00");
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const isToday = d.getTime() === today.getTime();
                      const label = isToday
                        ? `Hoje - ${d.toLocaleDateString("pt-BR")}`
                        : d.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          });

                      return (
                        <option key={date} value={date}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={generateAnalysis}
                  disabled={!selectedDate || generating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "🚀 Gerar Análise"
                  )}
                </button>

                {result && (
                  <div
                    className={`mt-4 p-3 rounded-lg text-sm ${
                      result.startsWith("✅")
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {result}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Nenhum dia com atividades encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
