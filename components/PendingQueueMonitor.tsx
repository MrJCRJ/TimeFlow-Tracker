"use client";

import { useEffect, useState } from "react";
import {
  getPendingInputs,
  markPendingAsProcessed,
  deletePendingInput,
  startNewActivity,
} from "@/lib/db/indexeddb";

/**
 * Componente que monitora a fila de pendências
 * Verifica a cada 10 segundos se há itens para processar
 */
export default function PendingQueueMonitor() {
  const [pendingCount, setPendingCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // Verifica pendências periodicamente
  useEffect(() => {
    const checkPending = async () => {
      try {
        const pending = await getPendingInputs(false);
        setPendingCount(pending.length);

        // Se tem pendentes e não está processando, tenta processar
        if (pending.length > 0 && !processing) {
          const now = Date.now();
          // Evita processar muito rápido (mínimo 5 segundos entre tentativas)
          if (now - lastCheckTime > 5000) {
            setLastCheckTime(now);
            await tryProcess();
          }
        } else if (pending.length === 0) {
          setPendingCount(0);
        }
      } catch (error) {
        console.error("Erro ao verificar pendências:", error);
      }
    };

    // Verifica a cada 10 segundos (mais frequente)
    const interval = setInterval(checkPending, 10000);

    // Verifica imediatamente ao montar
    checkPending();

    return () => clearInterval(interval);
  }, [processing, lastCheckTime]);

  const tryProcess = async () => {
    if (processing) return;

    setProcessing(true);

    try {
      const pendingItems = await getPendingInputs(false);

      if (pendingItems.length === 0) {
        setProcessing(false);
        setPendingCount(0);
        return;
      }

      console.log(`🔄 Processando ${pendingItems.length} itens...`);

      let processed = 0;
      let failed = 0;
      const results: string[] = [];

      // Processa apenas o primeiro item por vez (mais rápido e confiável)
      const item = pendingItems[0];

      try {
        // Tenta detectar intenção com timeout maior
        const intentController = new AbortController();
        const intentTimeout = setTimeout(() => intentController.abort(), 15000); // 15s timeout

        const intentResponse = await fetch("/api/detect-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: item.text }),
          signal: intentController.signal,
        });

        clearTimeout(intentTimeout);

        if (!intentResponse.ok) {
          throw new Error("Falha ao detectar intenção");
        }

        const intent = await intentResponse.json();

        // Se IA ainda está offline, para de tentar
        if (intent.usingFallback) {
          console.log("⚠️ IA offline - aguardando conexão...");
          setProcessing(false);
          return;
        }

        // Processa baseado na intenção
        if (intent.type === "activity") {
          // Processa como atividade com timeout maior
          const activityController = new AbortController();
          const activityTimeout = setTimeout(
            () => activityController.abort(),
            20000
          ); // 20s timeout

          const aiResponse = await fetch("/api/process-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.text,
              context: { todayStats: { activitiesCount: 0, totalMinutes: 0 } },
            }),
            signal: activityController.signal,
          });

          clearTimeout(activityTimeout);

          if (!aiResponse.ok) throw new Error("Falha ao processar atividade");

          const aiResult = await aiResponse.json();

          // Cria atividade (não encerra a atual se for do passado)
          await startNewActivity(
            item.text,
            aiResult.summary,
            aiResult.category,
            aiResult.response
          );

          results.push(`✅ ${aiResult.summary || item.text}`);
        } else {
          // Era chat/pergunta - apenas remove
          results.push(`💬 ${item.text.substring(0, 50)}...`);
        }

        // Remove da fila
        if (item.id) {
          await deletePendingInput(item.id);
        }

        processed++;
      } catch (error: any) {
        console.error("Erro ao processar item:", error);

        if (error.name === "AbortError") {
          console.log("⏱️ Timeout - IA muito lenta");
        }

        failed++;
        // Mantém na fila para tentar depois
      }

      // Atualiza contador
      const remaining = await getPendingInputs(false);
      setPendingCount(remaining.length);

      if (processed > 0) {
        // Mostra resultado brevemente
        setSummary(
          `✅ Processado: ${results[0]}${
            remaining.length > 0
              ? `\n\n⏳ ${remaining.length} restantes...`
              : ""
          }`
        );
        setShowSummary(true);

        // Dispara evento para atualizar lista
        window.dispatchEvent(new Event("activityUpdated"));

        // Auto-hide rápido
        setTimeout(() => setShowSummary(false), 3000);

        // Se ainda há mais, processa o próximo após 2s
        if (remaining.length > 0) {
          setTimeout(() => tryProcess(), 2000);
        }
      } else if (failed > 0) {
        setSummary("⚠️ Erro ao processar. Tentando novamente em 30s...");
        setShowSummary(true);
        setTimeout(() => setShowSummary(false), 3000);
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
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-sm font-medium">
              {pendingCount} {pendingCount === 1 ? "item" : "itens"} na fila
            </span>
            {processing && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      )}

      {/* Botão manual de processar */}
      {pendingCount > 0 && !processing && (
        <button
          onClick={tryProcess}
          className="fixed bottom-24 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
        >
          🔄 Processar Agora
        </button>
      )}

      {/* Modal de processamento */}
      {processing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              🤖 Processando Pendentes...
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Aguarde enquanto a IA processa seus inputs da fila
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {pendingCount} {pendingCount === 1 ? "item" : "itens"} na fila
            </div>
          </div>
        </div>
      )}

      {/* Modal de resumo */}
      {showSummary && summary && !processing && (
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
