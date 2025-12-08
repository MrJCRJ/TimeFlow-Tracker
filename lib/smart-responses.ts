/**
 * Sistema Híbrido de Respostas (IA + Cache + Templates)
 *
 * ESTRATÉGIA:
 * 1. CACHE: Busca resposta similar já processada pela IA (reutiliza se ≥60% similar)
 * 2. IA: Processa com DeepSeek se:
 *    - Primeiras 20 atividades (onboarding)
 *    - Primeira atividade do dia
 *    - Não usou IA há 24h+
 *    - Atividade importante/complexa
 * 3. TEMPLATE: Usa resposta local (sem custo) para atividades rotineiras
 *
 * ECONOMIA ESTIMADA: 70-80% de redução de custos
 */

import {
  findSimilarResponse,
  cacheAIResponse,
  cleanOldCache,
} from "./response-cache";
import { getLocalTemplate } from "./response-templates";
import {
  shouldUseAI,
  shouldForceActivity,
  calculateSavings,
  type SmartResponseConfig,
} from "./response-strategy";

// Re-exporta para compatibilidade
export { cleanOldCache };
export type { SmartResponseConfig };

interface TemplateContext {
  previousCategory?: string;
  totalMinutesWorked?: number;
  sameActivityCount?: number;
}

interface UserStats {
  totalActivitiesRegistered: number;
  lastAIResponseDate: Date | null;
  todayActivitiesCount: number;
}

/**
 * Orquestra resposta inteligente (Cache → IA → Template)
 */
export async function getSmartResponse(
  activityTitle: string,
  category: string,
  userStats: UserStats,
  context?: TemplateContext
): Promise<{ response: string; source: "cache" | "ai" | "template" }> {
  // Decide estratégia
  const decision = await shouldUseAI(activityTitle, category, userStats);

  // CACHE: Resposta já processada
  if (decision.cachedResponse) {
    return {
      response: decision.cachedResponse,
      source: "cache",
    };
  }

  // IA: Processa com DeepSeek (custo: $0.001)
  if (decision.useAI) {
    return {
      response: "", // Será processado pela API
      source: "ai",
    };
  }

  // TEMPLATE: Resposta local (custo: $0)
  const templateResponse = getLocalTemplate(category, context);
  return {
    response: templateResponse,
    source: "template",
  };
}

/**
 * Salva resposta da IA no cache para reutilização futura
 */
export async function saveAIResponseToCache(
  activityTitle: string,
  category: string,
  response: string
): Promise<void> {
  await cacheAIResponse(activityTitle, category, response);
}

/**
 * Verifica se deve forçar modo atividade
 */
export { shouldForceActivity };

/**
 * Calcula economia de custos
 */
export { calculateSavings };
