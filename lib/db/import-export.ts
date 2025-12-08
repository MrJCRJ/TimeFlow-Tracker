/**
 * Funções de importação/exportação de dados
 */

import { db } from "./database";
import { clearAllData } from "./queries";

/**
 * Exporta todos os dados (atividades, feedbacks, pending inputs)
 */
export async function exportAllData() {
  const activities = await db.activities.toArray();
  const feedbacks = await db.feedbacks.toArray();
  const pending = await db.pendingInputs.toArray();

  // Limpa cache antigo antes de exportar (mantém apenas últimos 30 dias)
  const { cleanOldCache } = await import("@/lib/response-cache");
  await cleanOldCache();

  // Estatísticas do cache
  const cacheSize = await db.responseCache.count();

  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    data: {
      activities,
      feedbacks,
      pendingInputs: pending,
    },
    cacheInfo: {
      responseCacheSize: cacheSize,
      note: "Cache de respostas não é exportado (apenas local)",
    },
  };
}

/**
 * Importa dados (sobrescreve dados existentes)
 */
export async function importAllData(data: any) {
  // Limpa dados existentes
  await clearAllData();

  console.log("📥 Importando dados:", data);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Valida estrutura básica
  if (!data || !data.data) {
    throw new Error("Formato de dados inválido");
  }

  const importData = data.data || data; // Suporta ambos formatos

  // Importa atividades
  if (importData.activities && Array.isArray(importData.activities)) {
    console.log(`📊 Importando ${importData.activities.length} atividades...`);

    for (let i = 0; i < importData.activities.length; i++) {
      const activity = importData.activities[i];
      const nextActivity = importData.activities[i + 1];

      // Valida campos obrigatórios
      if (!activity.title || !activity.startedAt) {
        console.warn(`⚠️ Atividade inválida ignorada:`, activity);
        continue;
      }

      const activityDate = new Date(activity.startedAt);
      const activityDayStart = new Date(activityDate);
      activityDayStart.setHours(0, 0, 0, 0);

      const startedAtDate = new Date(activity.startedAt);
      let endedAtDate: Date | undefined;
      let calculatedDuration: number | undefined;

      // Se não tem endedAt
      if (!activity.endedAt) {
        // Se existe uma próxima atividade, usa o startedAt dela como endedAt
        if (nextActivity) {
          endedAtDate = new Date(nextActivity.startedAt);
          const durationMs = endedAtDate.getTime() - startedAtDate.getTime();
          calculatedDuration = Math.max(1, Math.floor(durationMs / 60000));
          console.log(
            `⚠️ Atividade sem endedAt - usando início da próxima: "${activity.title}" (${calculatedDuration}min)`
          );
        }
        // Se não tem próxima atividade E é de um dia anterior, força finalização com +1min
        else {
          const isOldDay = activityDayStart.getTime() < today.getTime();
          if (isOldDay) {
            endedAtDate = new Date(startedAtDate.getTime() + 60000);
            calculatedDuration = 1;
            console.log(
              `⚠️ Atividade antiga sem endedAt - forçando +1min: "${activity.title}"`
            );
          }
          // Se é de hoje e é a última, deixa sem endedAt (atividade em andamento)
        }
      } else {
        endedAtDate = new Date(activity.endedAt);
        calculatedDuration = activity.durationMinutes;
      }

      const imported = {
        title: activity.title,
        summary: activity.summary || activity.title,
        category: activity.category || "📝 Outros",
        aiResponse: activity.aiResponse,
        startedAt: startedAtDate,
        endedAt: endedAtDate,
        durationMinutes: calculatedDuration,
      };

      console.log("📝 Importando atividade:", imported);
      try {
        await db.activities.add(imported);
      } catch (error) {
        console.error("❌ Erro ao importar atividade:", error, activity);
      }
    }
    console.log("✅ Atividades importadas!");
  }

  // Importa feedbacks
  if (importData.feedbacks && Array.isArray(importData.feedbacks)) {
    console.log(`💡 Importando ${importData.feedbacks.length} feedbacks...`);
    for (const feedback of importData.feedbacks) {
      if (!feedback.date) {
        console.warn("⚠️ Feedback sem data ignorado:", feedback);
        continue;
      }

      try {
        await db.feedbacks.add({
          date: feedback.date,
          type: feedback.type || "daily",
          theme: feedback.theme,
          score: feedback.score,
          insights: feedback.insights,
          suggestion: feedback.suggestion,
          createdAt: feedback.createdAt
            ? new Date(feedback.createdAt)
            : new Date(),
        });
      } catch (error) {
        console.error("❌ Erro ao importar feedback:", error, feedback);
      }
    }
    console.log("✅ Feedbacks importados!");
  }

  // Importa pending inputs
  if (importData.pendingInputs && Array.isArray(importData.pendingInputs)) {
    console.log(
      `⏳ Importando ${importData.pendingInputs.length} pending inputs...`
    );
    for (const pending of importData.pendingInputs) {
      try {
        await db.pendingInputs.add({
          text: pending.text,
          timestamp: new Date(pending.timestamp),
          processed: pending.processed || false,
          processedAt: pending.processedAt
            ? new Date(pending.processedAt)
            : undefined,
          result: pending.result,
        });
      } catch (error) {
        console.error("❌ Erro ao importar pending input:", error, pending);
      }
    }
    console.log("✅ Pending inputs importados!");
  }

  console.log("🎉 Importação concluída!");
}
