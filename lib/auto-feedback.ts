"use client";

import { db } from "@/lib/db/indexeddb";

// Verifica se precisa gerar feedback automático
export async function checkAndGenerateAutoFeedback(): Promise<{
  needsFeedback: boolean;
  pendingDates: string[];
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Busca todas as atividades antigas (antes de hoje)
  const allActivities = await db.activities.toArray();
  const oldActivities = allActivities.filter((a) => {
    const activityDate = new Date(a.startedAt);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate < today;
  });

  if (oldActivities.length === 0) {
    return { needsFeedback: false, pendingDates: [] };
  }

  // Agrupa atividades por data
  const activitiesByDate = new Map<string, typeof oldActivities>();
  oldActivities.forEach((activity) => {
    const date = new Date(activity.startedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split("T")[0];

    if (!activitiesByDate.has(dateKey)) {
      activitiesByDate.set(dateKey, []);
    }
    activitiesByDate.get(dateKey)!.push(activity);
  });

  // Verifica quais datas não têm feedback
  const allFeedbacks = await db.feedbacks.toArray();
  const feedbackDates = new Set(allFeedbacks.map((f) => f.date));

  const pendingDates: string[] = [];
  activitiesByDate.forEach((_, dateKey) => {
    if (!feedbackDates.has(dateKey)) {
      pendingDates.push(dateKey);
    }
  });

  return {
    needsFeedback: pendingDates.length > 0,
    pendingDates: pendingDates.sort(),
  };
}

// Gera feedback para uma data específica
export async function generateFeedbackForDate(
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Busca atividades do dia
    const allActivities = await db.activities.toArray();
    const dayActivities = allActivities.filter((a) => {
      const activityDate = new Date(a.startedAt);
      return activityDate >= targetDate && activityDate < nextDay;
    });

    if (dayActivities.length === 0) {
      return { success: false, error: "Nenhuma atividade encontrada" };
    }

    // Prepara dados para IA
    const activitiesForApi = dayActivities.map((a) => ({
      title: a.summary || a.title,
      startedAt: a.startedAt.toISOString(),
      durationMinutes: a.durationMinutes || 0,
    }));

    // Chama API de análise
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activities: activitiesForApi,
        dateStr: date,
        previousFeedbacks: [], // Podemos buscar feedbacks anteriores depois
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Erro ao chamar API de análise" };
    }

    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error || "Erro desconhecido" };
    }

    const analysis = result.analysis;

    // Salva feedback no IndexedDB
    await db.feedbacks.add({
      date,
      type: "daily",
      theme: analysis.theme,
      score: analysis.score,
      insights: analysis.insights,
      suggestion: analysis.suggestion,
      createdAt: new Date(),
    });

    // Deleta atividades do dia após gerar feedback
    const activityIds = dayActivities.map((a) => a.id!);
    await db.activities.bulkDelete(activityIds);

    console.log(
      `✅ Feedback gerado e ${activityIds.length} atividades deletadas para ${date}`
    );

    return { success: true };
  } catch (error) {
    console.error("Erro ao gerar feedback:", error);
    return { success: false, error: String(error) };
  }
}

// Gera feedback para todas as datas pendentes
export async function generateAllPendingFeedbacks(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const { pendingDates } = await checkAndGenerateAutoFeedback();

  const errors: string[] = [];
  let processed = 0;

  for (const date of pendingDates) {
    const result = await generateFeedbackForDate(date);
    if (result.success) {
      processed++;
    } else {
      errors.push(`${date}: ${result.error}`);
    }
  }

  return { success: errors.length === 0, processed, errors };
}
