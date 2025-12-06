"use client";

import { useEffect } from "react";

/**
 * Componente que executa análises automáticas
 * - Diária: às 23:59
 * - Semanal: domingo 23:59
 * - Mensal: último dia do mês 23:59
 */
export default function AutoAnalyzer() {
  useEffect(() => {
    const checkAndAnalyze = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Verifica se é 23:59
      if (hours === 23 && minutes === 59) {
        console.log("⏰ Hora da análise automática!");

        // Análise diária (sempre)
        await runAnalysis("daily");

        // Análise semanal (domingo)
        if (now.getDay() === 0) {
          await runAnalysis("weekly");
        }

        // Análise mensal (último dia do mês)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (tomorrow.getMonth() !== now.getMonth()) {
          await runAnalysis("monthly");
        }
      }
    };

    // Verifica a cada minuto
    const interval = setInterval(checkAndAnalyze, 60000);

    // Verifica imediatamente
    checkAndAnalyze();

    return () => clearInterval(interval);
  }, []);

  const runAnalysis = async (type: "daily" | "weekly" | "monthly") => {
    try {
      console.log(`📊 Executando análise ${type}...`);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        console.log(`✅ Análise ${type} concluída!`);
        // Atualiza a página para mostrar novos insights
        window.dispatchEvent(new Event("activityUpdated"));
      }
    } catch (error) {
      console.error(`Erro na análise ${type}:`, error);
    }
  };

  // Componente invisível - apenas executa lógica
  return null;
}
