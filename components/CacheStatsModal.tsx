"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db/indexeddb";
import { cleanOldCache } from "@/lib/smart-responses";

interface CacheStats {
  totalResponses: number;
  totalReuses: number;
  oldestResponse: Date | null;
  newestResponse: Date | null;
  byCategory: Map<string, number>;
  estimatedSavings: string;
}

export default function CacheStatsModal({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const responses = await db.responseCache.toArray();

      if (responses.length === 0) {
        setStats({
          totalResponses: 0,
          totalReuses: 0,
          oldestResponse: null,
          newestResponse: null,
          byCategory: new Map(),
          estimatedSavings: "$0.00",
        });
        setLoading(false);
        return;
      }

      const totalReuses = responses.reduce(
        (sum, r) => sum + (r.usageCount - 1),
        0
      ); // -1 pois primeira vez não é reuso

      const sorted = [...responses].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      const byCategory = new Map<string, number>();
      responses.forEach((r) => {
        byCategory.set(r.category, (byCategory.get(r.category) || 0) + 1);
      });

      // Economia: cada reuso economiza ~$0.001
      const savings = totalReuses * 0.001;

      setStats({
        totalResponses: responses.length,
        totalReuses,
        oldestResponse: sorted[0].createdAt,
        newestResponse: sorted[sorted.length - 1].createdAt,
        byCategory,
        estimatedSavings: `$${savings.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Erro ao carregar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanCache = async () => {
    if (
      !confirm(
        "Limpar respostas antigas (30+ dias)? Isso não pode ser desfeito."
      )
    ) {
      return;
    }

    setCleaning(true);
    try {
      const deleted = await cleanOldCache();
      alert(`${deleted} respostas antigas removidas!`);
      await loadStats();
    } catch (error) {
      alert("Erro ao limpar cache");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            ♻️ Cache de Respostas
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600">Respostas Salvas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalResponses}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Reutilizações</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalReuses}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">Economia Estimada</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.estimatedSavings}
                </p>
              </div>
            </div>

            {/* Por Categoria */}
            {stats.byCategory.size > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Por Categoria
                </h4>
                <div className="space-y-2">
                  {Array.from(stats.byCategory.entries()).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{category}</span>
                        <span className="font-semibold text-gray-900">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-900">
              <p className="font-semibold mb-1">💡 Como funciona?</p>
              <p>
                O sistema reutiliza respostas similares para economizar chamadas
                à API. Atividades parecidas recebem a mesma resposta
                motivacional.
              </p>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <button
                onClick={handleCleanCache}
                disabled={cleaning || stats.totalResponses === 0}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cleaning ? "Limpando..." : "🧹 Limpar Antigas"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            Erro ao carregar estatísticas
          </div>
        )}
      </div>
    </div>
  );
}
