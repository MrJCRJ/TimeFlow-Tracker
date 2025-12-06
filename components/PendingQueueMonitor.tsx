"use client";

import { useEffect, useState } from "react";

/**
 * Componente que monitora a fila de pendências
 * Verifica a cada 30 segundos se há itens para processar
 */
export default function PendingQueueMonitor() {
  const [pendingCount, setPendingCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Verifica pendências periodicamente
  useEffect(() => {
    const checkPending = async () => {
      try {
        const response = await fetch("/api/pending-queue");
        const data = await response.json();

        if (data.pendingCount > 0 && !processing) {
          setPendingCount(data.pendingCount);
          // Tenta processar automaticamente
          await tryProcess();
        }
      } catch (error) {
        console.error("Erro ao verificar pendências:", error);
      }
    };

    // Verifica a cada 30 segundos
    const interval = setInterval(checkPending, 30000);

    // Verifica imediatamente ao montar
    checkPending();

    return () => clearInterval(interval);
  }, [processing]);

  const tryProcess = async () => {
    if (processing) return;

    setProcessing(true);

    try {
      const response = await fetch("/api/pending-queue", {
        method: "PUT",
      });

      const result = await response.json();

      if (result.processed > 0) {
        setSummary(result.summary);
        setShowSummary(true);
        setPendingCount(0);

        // Auto-hide após 15 segundos
        setTimeout(() => setShowSummary(false), 15000);

        // Atualiza a página
        window.dispatchEvent(new Event("activityUpdated"));
      }
    } catch (error) {
      console.error("Erro ao processar pendências:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Badge de pendências */}
      {pendingCount > 0 && !showSummary && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {pendingCount} {pendingCount === 1 ? "item" : "itens"} na fila
            </span>
          </div>
        </div>
      )}

      {/* Modal de resumo */}
      {showSummary && summary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-bounce-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                ✨ IA voltou online!
              </h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="prose prose-sm max-w-none">
              {summary.split("\n").map((line, i) => (
                <p key={i} className="text-gray-700 mb-2">
                  {line}
                </p>
              ))}
            </div>

            <button
              onClick={() => setShowSummary(false)}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Entendi! 🎉
            </button>
          </div>
        </div>
      )}
    </>
  );
}
