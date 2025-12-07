"use client";

import { useEffect, useState } from "react";
import { getAllActivities, db } from "@/lib/db/indexeddb";

/**
 * Componente que executa análises automáticas
 * - Diária: às 23:50 (10 min antes da meia-noite para garantir)
 * - Semanal: domingo 23:50
 * - Mensal: último dia do mês 23:50
 */
export default function AutoAnalyzer() {
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string | null>(null);

  useEffect(() => {
    // Carrega última análise do localStorage
    const stored = localStorage.getItem("lastAnalysisDate");
    if (stored) setLastAnalysisDate(stored);

    const checkAndAnalyze = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const dateStr = now.toISOString().split("T")[0];

      // Evita análises duplicadas no mesmo dia
      if (lastAnalysisDate === dateStr) {
        return;
      }

      // Verifica se é 23:50 ou depois (até 23:59)
      if (hours === 23 && minutes >= 50) {
        console.log("⏰ Hora da análise automática!");

        // Análise diária (sempre) - do dia atual que está terminando
        const success = await runAnalysis(now);

        if (success) {
          // Marca como analisado
          localStorage.setItem("lastAnalysisDate", dateStr);
          setLastAnalysisDate(dateStr);

          // Análise semanal (domingo)
          if (now.getDay() === 0) {
            console.log("📅 Domingo - análise semanal");
          }

          // Análise mensal (último dia do mês)
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (tomorrow.getMonth() !== now.getMonth()) {
            console.log("📆 Último dia do mês - análise mensal");
          }
        }
      }
    };

    // Verifica a cada minuto
    const interval = setInterval(checkAndAnalyze, 60000);

    // Verifica imediatamente
    checkAndAnalyze();

    return () => clearInterval(interval);
  }, [lastAnalysisDate]);

  const runAnalysis = async (targetDate: Date): Promise<boolean> => {
    try {
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const dateStr = targetDate.toISOString().split("T")[0];

      console.log(`📊 Executando análise automática para ${dateStr}...`);

      // Verifica se já existe análise
      const existingFeedback = await db.feedbacks
        .where("date")
        .equals(dateStr)
        .first();

      if (existingFeedback) {
        console.log(`✅ Análise já existe para ${dateStr}`);
        return true;
      }

      // Busca atividades do dia
      const allActivities = await getAllActivities();
      const activities = allActivities.filter((a) => {
        const activityDate = new Date(a.startedAt);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        return activityDate >= dayStart && activityDate < nextDay;
      });

      if (activities.length === 0) {
        console.log(`❌ Sem atividades para ${dateStr}`);
        return false;
      }

      // Busca feedbacks anteriores
      const previousFeedbacks = await db.feedbacks
        .orderBy("date")
        .reverse()
        .limit(7)
        .toArray();

      // Chama API
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

        // Salva feedback
        await db.feedbacks.add({
          date: dateStr,
          type: "daily",
          theme: data.analysis.theme,
          score: data.analysis.score,
          insights: data.analysis.insights,
          suggestion: data.analysis.suggestion,
          createdAt: new Date(),
        });

        // Deleta atividades
        const activitiesToDelete = activities
          .map((a) => a.id)
          .filter((id): id is number => id !== undefined);

        for (const id of activitiesToDelete) {
          await db.activities.delete(id);
        }

        console.log(`✅ Análise automática concluída para ${dateStr}!`);
        window.dispatchEvent(new Event("activityUpdated"));
        return true;
      } else {
        const error = await response.json();
        console.error(`❌ Erro na análise:`, error);
        return false;
      }
    } catch (error) {
      console.error(`Erro na análise:`, error);
      return false;
    }
  };

  // Componente invisível - apenas executa lógica
  return null;
}
