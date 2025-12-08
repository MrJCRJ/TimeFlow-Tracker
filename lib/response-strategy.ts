/**
 * Estratégia de Decisão de Resposta
 * Decide quando usar IA, cache ou template local
 */

import { findSimilarResponse, normalizeText } from "./response-cache";

export interface SmartResponseConfig {
  useAI: boolean;
  reason: string;
  cachedResponse?: string;
}

interface UserStats {
  totalActivitiesRegistered: number;
  lastAIResponseDate: Date | null;
  todayActivitiesCount: number;
}

/**
 * Decide quando usar IA vs cache vs template local
 */
export async function shouldUseAI(
  activityTitle: string,
  category: string,
  userStats: UserStats
): Promise<SmartResponseConfig> {
  // PASSO 1: Verifica se tem resposta similar no cache
  const cachedResponse = await findSimilarResponse(activityTitle, category);

  if (cachedResponse) {
    return {
      useAI: false,
      reason: "Cache - resposta similar encontrada",
      cachedResponse: cachedResponse.response,
    };
  }

  // PASSO 2: Primeiras 20 atividades → USA IA (onboarding)
  if (userStats.totalActivitiesRegistered < 20) {
    return {
      useAI: true,
      reason: "Onboarding - motivando usuário novo",
    };
  }

  // PASSO 3: Primeira atividade do dia → USA IA (bom dia personalizado)
  if (userStats.todayActivitiesCount === 0) {
    return {
      useAI: true,
      reason: "Primeira atividade do dia",
    };
  }

  // PASSO 4: Não usou IA há mais de 24h → USA IA (mantém engajamento)
  if (
    !userStats.lastAIResponseDate ||
    Date.now() - userStats.lastAIResponseDate.getTime() > 24 * 60 * 60 * 1000
  ) {
    return {
      useAI: true,
      reason: "Reengajamento após 24h",
    };
  }

  // PASSO 5: Atividade longa/importante → USA IA
  const importantKeywords = [
    "projeto",
    "importante",
    "reuniao",
    "apresentacao",
    "entrevista",
    "prova",
    "exame",
    "urgente",
    "cliente",
  ];
  const hasImportantKeyword = importantKeywords.some((keyword) =>
    normalizeText(activityTitle).includes(keyword)
  );

  if (hasImportantKeyword) {
    return {
      useAI: true,
      reason: "Atividade importante detectada",
    };
  }

  // PASSO 6: Caso contrário → USA TEMPLATE (economiza $$)
  return {
    useAI: false,
    reason: "Atividade rotineira - usando template local",
  };
}

/**
 * Verifica se deve forçar modo atividade
 * (quando usuário explicitamente quer registrar algo)
 */
export function shouldForceActivity(text: string): boolean {
  const normalized = text.toLowerCase();
  const forcePatterns = [
    /^registrar:/,
    /^atividade:/,
    /^task:/,
    /^fazendo:/,
    /^inicio:/,
  ];

  return forcePatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Estatísticas de economia
 */
export interface CostSavings {
  aiCallsSaved: number;
  estimatedSavings: string;
  templateUsagePercent: number;
}

/**
 * Calcula economia de custos
 * DeepSeek: ~$0.001 por request (1000 requests = $1)
 */
export function calculateSavings(
  totalActivities: number,
  aiCalls: number
): CostSavings {
  const templateCalls = totalActivities - aiCalls;
  const costPerCall = 0.001;
  const savedMoney = templateCalls * costPerCall;

  return {
    aiCallsSaved: templateCalls,
    estimatedSavings: `$${savedMoney.toFixed(2)}`,
    templateUsagePercent: (templateCalls / totalActivities) * 100,
  };
}
