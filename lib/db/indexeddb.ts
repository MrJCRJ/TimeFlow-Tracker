import Dexie, { Table } from "dexie";

// Tipos
export interface Activity {
  id?: number;
  title: string;
  summary?: string;
  category?: string;
  aiResponse?: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
}

export interface Feedback {
  id?: number;
  date: string;
  type: "daily" | "weekly" | "monthly";
  theme?: string;
  score?: number;
  insights?: string[];
  suggestion?: string;
  createdAt: Date;
}

export interface PendingInput {
  id?: number;
  text: string;
  timestamp: Date;
  processed: boolean;
  processedAt?: Date;
  result?: string;
}

// Database
class TimeFlowDB extends Dexie {
  activities!: Table<Activity>;
  feedbacks!: Table<Feedback>;
  pendingInputs!: Table<PendingInput>;

  constructor() {
    super("TimeFlowDB");
    this.version(1).stores({
      activities: "++id, title, startedAt, endedAt, category",
      feedbacks: "++id, date, type, createdAt",
      pendingInputs: "++id, timestamp, processed",
    });
  }
}

// Instância única (singleton)
export const db = new TimeFlowDB();

// Helper functions
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

export async function getAllFeedbacks(): Promise<Feedback[]> {
  return await db.feedbacks.orderBy("createdAt").reverse().toArray();
}

export async function addFeedback(
  feedback: Omit<Feedback, "id">
): Promise<number> {
  return await db.feedbacks.add(feedback);
}

export async function clearAllData() {
  await db.activities.clear();
  await db.feedbacks.clear();
  await db.pendingInputs.clear();
}

// Funções específicas para fluxo de atividades
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

// Funções para pending inputs
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

export async function exportAllData() {
  const activities = await db.activities.toArray();
  const feedbacks = await db.feedbacks.toArray();
  const pending = await db.pendingInputs.toArray();

  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    data: {
      activities,
      feedbacks,
      pendingInputs: pending,
    },
  };
}

export async function importAllData(data: any) {
  // Limpa dados existentes
  await clearAllData();

  console.log("📥 Importando dados:", data);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Importa atividades
  if (data.activities && Array.isArray(data.activities)) {
    console.log(`📊 Importando ${data.activities.length} atividades...`);
    for (const activity of data.activities) {
      const activityDate = new Date(activity.startedAt);
      const activityDayStart = new Date(activityDate);
      activityDayStart.setHours(0, 0, 0, 0);

      // Se a atividade é de um dia anterior E não tem endedAt, força finalização
      const isOldDay = activityDayStart.getTime() < today.getTime();
      const needsEndDate = !activity.endedAt && isOldDay;

      const imported = {
        title: activity.title,
        summary: activity.summary,
        category: activity.category,
        aiResponse: activity.aiResponse,
        startedAt: new Date(activity.startedAt),
        endedAt: needsEndDate
          ? new Date(activity.startedAt.getTime() + 60000) // +1 min se não tinha duração
          : activity.endedAt
          ? new Date(activity.endedAt)
          : undefined,
        durationMinutes: needsEndDate ? 1 : activity.durationMinutes,
      };

      if (needsEndDate) {
        console.log(
          "⚠️ Atividade antiga sem endedAt - forçando finalização:",
          imported.title
        );
      }

      console.log("📝 Importando atividade:", imported);
      await db.activities.add(imported);
    }
    console.log("✅ Atividades importadas!");
  }

  // Importa feedbacks
  if (data.feedbacks && Array.isArray(data.feedbacks)) {
    console.log(`💡 Importando ${data.feedbacks.length} feedbacks...`);
    for (const feedback of data.feedbacks) {
      await db.feedbacks.add({
        date: feedback.date,
        type: feedback.type || "daily",
        theme: feedback.theme,
        score: feedback.score,
        insights: feedback.insights,
        suggestion: feedback.suggestion,
        createdAt: new Date(feedback.createdAt),
      });
    }
    console.log("✅ Feedbacks importados!");
  }

  // Importa pending inputs
  if (data.pendingInputs && Array.isArray(data.pendingInputs)) {
    console.log(`⏳ Importando ${data.pendingInputs.length} pending inputs...`);
    for (const pending of data.pendingInputs) {
      await db.pendingInputs.add({
        text: pending.text,
        timestamp: new Date(pending.timestamp),
        processed: pending.processed || false,
        processedAt: pending.processedAt
          ? new Date(pending.processedAt)
          : undefined,
        result: pending.result,
      });
    }
    console.log("✅ Pending inputs importados!");
  }

  console.log("🎉 Importação concluída!");
}
