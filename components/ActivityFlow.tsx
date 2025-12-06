"use client";

import { useState, FormEvent } from "react";
import { startNewActivity, addPendingInput } from "@/lib/db/indexeddb";
import { processActivityWithAI } from "@/lib/ai-service";
import { useTodayActivities } from "@/lib/hooks/useDatabase";

export default function ActivityFlow() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  const todayActivities = useTodayActivities();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setChatResponse(null);
    setShowChatBubble(false);
    setFallbackWarning(null);

    try {
      const input = title.trim();

      // Detecta intenção usando IA
      const intentResponse = await fetch("/api/detect-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const intent = await intentResponse.json();
      console.log("🤖 IA detectou intenção:", intent);

      // Se IA estiver offline, adiciona à fila e informa usuário
      if (intent.usingFallback) {
        // Adiciona à fila de pendências no IndexedDB
        await addPendingInput(input);

        setFallbackWarning(
          intent.fallbackMessage ||
            "🔌 IA offline - Input salvo para análise posterior"
        );
        setTitle(""); // Limpa o input
        setTimeout(() => setFallbackWarning(null), 8000);
        setIsSubmitting(false);
        return; // Para aqui, não processa mais nada
      }

      // Mostra aviso se estiver usando fallback
      if (intent.fallbackMessage) {
        setFallbackWarning(intent.fallbackMessage);
        setTimeout(() => setFallbackWarning(null), 5000);
      }

      // Se for conversa/pergunta/feedback → modo chat
      if (
        intent.type === "chat" ||
        intent.type === "question" ||
        intent.type === "feedback"
      ) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        });

        if (response.ok) {
          const data = await response.json();
          setChatResponse(data.message);
          setShowChatBubble(true);
          setTitle("");

          // Auto-hide após 8 segundos
          setTimeout(() => setShowChatBubble(false), 8000);
        }
      }
      // Se for atividade → registra localmente com IA
      else {
        // Prepara contexto para IA
        const finishedActivities =
          todayActivities?.filter((a) => a.endedAt) || [];
        const ongoingActivity = todayActivities?.find((a) => !a.endedAt);

        const todayStats = {
          activitiesCount: finishedActivities.length,
          totalMinutes: finishedActivities.reduce(
            (sum, a) => sum + (a.durationMinutes || 0),
            0
          ),
        };

        const previousActivity = ongoingActivity
          ? {
              title: ongoingActivity.title,
              summary: ongoingActivity.summary,
              category: ongoingActivity.category,
              durationMinutes: ongoingActivity.durationMinutes || 0,
            }
          : undefined;

        // Processa com IA
        console.log("🤖 Processando com IA:", input);
        const aiResult = await processActivityWithAI(input, {
          previousActivity,
          todayStats,
        });
        console.log("✅ IA respondeu:", aiResult);

        // Salva no IndexedDB
        console.log("💾 Salvando no IndexedDB...");
        const result = await startNewActivity(
          input,
          aiResult.summary,
          aiResult.category,
          aiResult.response
        );
        console.log("✅ Atividade salva:", result);

        setTitle("");
      }
    } catch (error) {
      console.error("Erro ao processar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Aviso de fallback */}
      {fallbackWarning && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <span>{fallbackWarning}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite sua atividade..."
          disabled={isSubmitting}
          className="flex-1 px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-0"
          autoFocus
        />
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-800 flex-shrink-0"
        >
          {isSubmitting ? "⏳" : "📤"}
        </button>
      </form>

      {/* Modal de processamento */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              🤖 IA Analisando...
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Processando sua entrada e gerando insights personalizados
            </p>
          </div>
        </div>
      )}

      {/* Bubble de resposta do chat */}
      {showChatBubble && chatResponse && (
        <div className="absolute top-full left-0 right-0 mt-3 animate-bounce-in z-50 mx-3 sm:mx-0">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-2xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl">💬</div>
              <div className="flex-1 text-xs sm:text-sm">{chatResponse}</div>
              <button
                onClick={() => setShowChatBubble(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
