/**
 * Funções para gerenciamento de metas
 */

import { db, Goal } from "./database";

/**
 * Criar uma nova meta
 */
export async function createGoal(
  originalText: string,
  improvedText: string,
  objectives: string[],
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<number> {
  const now = new Date();
  
  const goalId = await db.goals.add({
    originalText,
    improvedText,
    objectives,
    status: "active",
    conversationHistory,
    createdAt: now,
    updatedAt: now,
  });

  return goalId;
}

/**
 * Obter todas as metas ativas
 */
export async function getActiveGoals(): Promise<Goal[]> {
  return await db.goals
    .where("status")
    .equals("active")
    .reverse()
    .sortBy("createdAt");
}

/**
 * Obter todas as metas (incluindo completadas e arquivadas)
 */
export async function getAllGoals(): Promise<Goal[]> {
  return await db.goals
    .orderBy("createdAt")
    .reverse()
    .toArray();
}

/**
 * Obter uma meta específica por ID
 */
export async function getGoalById(id: number): Promise<Goal | undefined> {
  return await db.goals.get(id);
}

/**
 * Atualizar uma meta existente
 */
export async function updateGoal(
  id: number,
  updates: Partial<Omit<Goal, "id" | "createdAt">>
): Promise<void> {
  await db.goals.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Marcar meta como completada
 */
export async function completeGoal(id: number): Promise<void> {
  const now = new Date();
  await db.goals.update(id, {
    status: "completed",
    completedAt: now,
    updatedAt: now,
  });
}

/**
 * Arquivar uma meta
 */
export async function archiveGoal(id: number): Promise<void> {
  await db.goals.update(id, {
    status: "archived",
    updatedAt: new Date(),
  });
}

/**
 * Deletar uma meta permanentemente
 */
export async function deleteGoal(id: number): Promise<void> {
  await db.goals.delete(id);
}

/**
 * Adicionar mensagem ao histórico de conversação
 */
export async function addConversationMessage(
  id: number,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const goal = await db.goals.get(id);
  if (!goal) return;

  const updatedHistory = [
    ...goal.conversationHistory,
    { role, content },
  ];

  await db.goals.update(id, {
    conversationHistory: updatedHistory,
    updatedAt: new Date(),
  });
}
