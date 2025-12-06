"use client";

import { useFeedbacks } from "@/lib/hooks/useDatabase";
import { useState } from "react";

export default function InsightsFeed() {
  const feedbacks = useFeedbacks();
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">(
    "all"
  );

  const filteredFeedbacks =
    filter === "all"
      ? feedbacks
      : feedbacks?.filter((f) => f.type === filter) || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) return "HOJE";
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return "ONTEM";

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-700";
    if (score >= 8) return "bg-green-100 text-green-700";
    if (score >= 6) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getTypeLabel = (type: string) => {
    if (type === "weekly") return "📅 Semanal";
    if (type === "monthly") return "📆 Mensal";
    return "📊 Diária";
  };

  const getTypeColor = (type: string) => {
    if (type === "weekly") return "bg-purple-100 text-purple-700";
    if (type === "monthly") return "bg-orange-100 text-orange-700";
    return "bg-blue-100 text-blue-700";
  };

  if (!feedbacks) {
    return (
      <div className="text-center text-gray-400 py-8">
        Carregando insights...
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Nenhum feedback ainda. Continue registrando atividades!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">
          INSIGHTS ANTERIORES
        </h2>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("daily")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === "daily"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Diárias
          </button>
          <button
            onClick={() => setFilter("weekly")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === "weekly"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semanais
          </button>
          <button
            onClick={() => setFilter("monthly")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === "monthly"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Mensais
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-gray-700">
                  {formatDate(feedback.date)}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                    feedback.type || "daily"
                  )}`}
                >
                  {getTypeLabel(feedback.type || "daily")}
                </span>
              </div>
              {feedback.score !== undefined && feedback.score !== null && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                    feedback.score ?? 0
                  )}`}
                >
                  {feedback.score}/10
                </div>
              )}
            </div>

            {feedback.theme && (
              <div className="text-sm text-gray-500 mb-3">{feedback.theme}</div>
            )}

            {feedback.insights && feedback.insights.length > 0 && (
              <ul className="space-y-1 mb-3">
                {feedback.insights.map((insight, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-700 flex items-start"
                  >
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            )}

            {feedback.suggestion && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm font-medium text-blue-700">
                  💡 {feedback.suggestion}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
