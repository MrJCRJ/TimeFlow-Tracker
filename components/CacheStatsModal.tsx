"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db/indexeddb";
import { cleanOldCache } from "@/lib/smart-responses";
import { BottomSheet, LoadingSpinner, StatCard, Button } from "./ui";

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
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title="♻️ Cache de Respostas"
      actions={
        <div className="flex gap-2">
          <Button
            onClick={handleCleanCache}
            disabled={cleaning || !stats || stats.totalResponses === 0}
            loading={cleaning}
            variant="danger"
            fullWidth
            icon="🧹"
          >
            Limpar Antigas
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            fullWidth
          >
            Fechar
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="py-8">
          <LoadingSpinner size="lg" message="Carregando estatísticas..." />
        </div>
      ) : stats ? (
        <div className="space-y-4">
          {/* Resumo com StatCards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Respostas Salvas"
              value={stats.totalResponses}
              color="blue"
              size="sm"
            />
            <StatCard
              label="Reutilizações"
              value={stats.totalReuses}
              color="green"
              size="sm"
            />
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Economia Estimada</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.estimatedSavings}
            </p>
          </div>

          {/* Por Categoria */}
          {stats.byCategory.size > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">
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
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
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
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          Erro ao carregar estatísticas
        </div>
      )}
    </BottomSheet>
  );
}
