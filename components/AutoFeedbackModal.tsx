"use client";

import { useState, useEffect } from "react";
import {
  checkAndGenerateAutoFeedback,
  generateFeedbackForDate,
} from "@/lib/auto-feedback";

interface AutoFeedbackModalProps {
  onComplete: () => void;
}

export default function AutoFeedbackModal({
  onComplete,
}: AutoFeedbackModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startProcessing();
  }, []);

  const startProcessing = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { pendingDates } = await checkAndGenerateAutoFeedback();

      if (pendingDates.length === 0) {
        onComplete();
        return;
      }

      setTotalCount(pendingDates.length);

      for (let i = 0; i < pendingDates.length; i++) {
        const date = pendingDates[i];
        setCurrentDate(date);

        const result = await generateFeedbackForDate(date);

        if (!result.success) {
          setError(`Erro ao processar ${date}: ${result.error}`);
          console.error("Erro:", result.error);
        }

        setProcessedCount(i + 1);

        // Pequeno delay entre processamentos
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Aguarda 1 segundo antes de fechar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete();
    } catch (err) {
      setError(String(err));
      console.error("Erro no processamento:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center">
          {/* Ícone animado */}
          <div className="mb-6">
            {isProcessing ? (
              <div className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : error ? (
              <div className="text-6xl">❌</div>
            ) : (
              <div className="text-6xl">✅</div>
            )}
          </div>

          {/* Título */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {isProcessing
              ? "🤖 Gerando Feedbacks"
              : error
              ? "Erro no Processamento"
              : "Feedbacks Gerados!"}
          </h3>

          {/* Descrição */}
          {isProcessing && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Analisando atividades passadas e gerando insights...
              </p>

              {currentDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-900 font-medium text-sm">
                    📅 {formatDate(currentDate)}
                  </p>
                </div>
              )}

              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${(processedCount / totalCount) * 100}%`,
                  }}
                />
              </div>

              <p className="text-gray-500 text-xs">
                {processedCount} de {totalCount} dias processados
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {!isProcessing && !error && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                {processedCount} {processedCount === 1 ? "dia" : "dias"}{" "}
                analisado{processedCount === 1 ? "" : "s"} com sucesso!
              </p>
              <p className="text-gray-500 text-xs">
                Atividades antigas foram arquivadas como feedbacks
              </p>
            </div>
          )}

          {/* Botão de fechar (só aparece se houver erro) */}
          {error && (
            <button
              onClick={onComplete}
              className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
