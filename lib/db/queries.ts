/**
 * Funções de consulta ao banco de dados
 */

import { db } from "./database";
import type { Activity, Feedback, PendingInput } from "./database";

// ================== ATIVIDADES ==================

export async function getAllActivities(): Promise<Activity[]> {
  return await db.activities.toArray();
}

export async function getTodayActivities(): Promise<Activity[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await db.activities.where("startedAt").above(today).toArray();
}

export async function addActivity(
  activity: Omit<Activity, "id">
): Promise<number> {
  return await db.activities.add(activity);
}

export async function updateActivity(
  id: number,
  changes: Partial<Activity>
): Promise<number> {
  return await db.activities.update(id, changes);
}

export async function deleteActivity(id: number): Promise<void> {
  await db.activities.delete(id);
}

export async function getOngoingActivity() {
  return await db.activities.filter((a) => !a.endedAt).first();
}

export async function endOngoingActivity() {
  console.log("🔍 Buscando atividade em andamento...");
  const ongoing = await getOngoingActivity();
  console.log("📋 Atividade encontrada:", ongoing);

  if (!ongoing || !ongoing.id) {
    console.log("⚠️ Nenhuma atividade em andamento para encerrar");
    return null;
  }

  const endedAt = new Date();
  const durationMinutes = Math.round(
    (endedAt.getTime() - ongoing.startedAt.getTime()) / 60000
  );

  console.log(
    "⏱️ Atualizando atividade com duração:",
    durationMinutes,
    "minutos"
  );
  await db.activities.update(ongoing.id, {
    endedAt,
    durationMinutes,
  });

  console.log("✅ Atividade encerrada com sucesso");
  return {
    ...ongoing,
    endedAt,
    durationMinutes,
  };
}

export async function startNewActivity(
  title: string,
  summary?: string,
  category?: string,
  aiResponse?: string
) {
  console.log("🔄 startNewActivity chamado:", {
    title,
    summary,
    category,
    aiResponse,
  });

  // Verifica se há atividade em andamento
  console.log("🔚 Verificando atividade em andamento...");
  const ongoing = await getOngoingActivity();

  if (ongoing) {
    console.log("📋 Atividade em andamento encontrada:", {
      id: ongoing.id,
      title: ongoing.title,
      startedAt: ongoing.startedAt,
      startedAtISO: ongoing.startedAt.toISOString(),
    });

    // Encerra apenas se for do HOJE (não de dias anteriores importados)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityDate = new Date(ongoing.startedAt);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === today.getTime()) {
      console.log("✅ Atividade é de hoje - encerrando...");
      await endOngoingActivity();
    } else {
      console.log("⚠️ Atividade é de dia anterior - NÃO encerrando");
      console.log("   Data da atividade:", activityDate.toISOString());
      console.log("   Data de hoje:", today.toISOString());
    }
  } else {
    console.log("✅ Nenhuma atividade em andamento");
  }

  // Cria nova atividade
  console.log("➕ Criando nova atividade...");
  const id = await db.activities.add({
    title,
    summary,
    category,
    aiResponse,
    startedAt: new Date(),
  });
  console.log("✅ Nova atividade criada com ID:", id);

  return {
    id,
    previousActivity: ongoing,
  };
}

// ================== FEEDBACKS ==================

export async function getAllFeedbacks(): Promise<Feedback[]> {
  return await db.feedbacks.orderBy("createdAt").reverse().toArray();
}

export async function addFeedback(
  feedback: Omit<Feedback, "id">
): Promise<number> {
  return await db.feedbacks.add(feedback);
}

// ================== PENDING INPUTS ==================

export async function addPendingInput(text: string) {
  const id = await db.pendingInputs.add({
    text,
    timestamp: new Date(),
    processed: false,
  });
  return id;
}

export async function getPendingInputs(processedOnly: boolean = false) {
  if (processedOnly) {
    return await db.pendingInputs.filter((p) => p.processed === true).toArray();
  }
  return await db.pendingInputs.filter((p) => p.processed === false).toArray();
}

export async function markPendingAsProcessed(id: number, result?: string) {
  await db.pendingInputs.update(id, {
    processed: true,
    processedAt: new Date(),
    result,
  });
}

export async function deletePendingInput(id: number) {
  await db.pendingInputs.delete(id);
}

// ================== UTILITÁRIOS ==================

export async function clearAllData() {
  await db.activities.clear();
  await db.feedbacks.clear();
  await db.pendingInputs.clear();
}
