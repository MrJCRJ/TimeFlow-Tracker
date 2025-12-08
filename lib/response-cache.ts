/**
 * Sistema de Cache de Respostas da IA
 * Gerencia armazenamento e recuperação de respostas similares
 */

import { db } from "@/lib/db/indexeddb";
import type { ResponseCache } from "@/lib/db/indexeddb";

/**
 * Normaliza texto para comparação (remove acentos, pontuação, etc)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/g, "") // Remove pontuação
    .replace(
      /\b(o|a|os|as|um|uma|de|da|do|das|dos|em|no|na|nos|nas|para|pra|pro|vou|vamos|estou|tô|indo|fazer)\b/g,
      ""
    ) // Remove artigos/verbos comuns
    .replace(/\s+/g, " ") // Normaliza espaços
    .trim();
}

/**
 * Extrai palavras-chave principais
 */
export function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(" ")
    .filter((word) => word.length > 3) // Apenas palavras com 4+ letras
    .slice(0, 3); // Primeiras 3 palavras-chave
}

/**
 * Calcula similaridade entre dois textos (0-1)
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const keywords1 = new Set(extractKeywords(text1));
  const keywords2 = new Set(extractKeywords(text2));

  if (keywords1.size === 0 || keywords2.size === 0) return 0;

  // Interseção / União (Jaccard similarity)
  const intersection = new Set([...keywords1].filter((x) => keywords2.has(x)))
    .size;
  const union = new Set([...keywords1, ...keywords2]).size;

  return intersection / union;
}

/**
 * Busca resposta similar no cache
 */
export async function findSimilarResponse(
  activityTitle: string,
  category: string,
  similarityThreshold: number = 0.6
): Promise<ResponseCache | null> {
  try {
    // Busca respostas da mesma categoria
    const cachedResponses = await db.responseCache
      .where("category")
      .equals(category)
      .toArray();

    if (cachedResponses.length === 0) return null;

    // Encontra a mais similar
    let bestMatch: ResponseCache | null = null;
    let bestSimilarity = 0;

    for (const cached of cachedResponses) {
      const similarity = calculateSimilarity(
        activityTitle,
        cached.activityPattern
      );

      if (similarity > bestSimilarity && similarity >= similarityThreshold) {
        bestSimilarity = similarity;
        bestMatch = cached;
      }
    }

    // Se encontrou match, atualiza estatísticas
    if (bestMatch && bestMatch.id) {
      await db.responseCache.update(bestMatch.id, {
        usageCount: bestMatch.usageCount + 1,
        lastUsed: new Date(),
      });

      console.log(
        `♻️ Reutilizando resposta (${(bestSimilarity * 100).toFixed(
          0
        )}% similar): "${bestMatch.response}"`
      );
    }

    return bestMatch;
  } catch (error) {
    console.error("Erro ao buscar resposta similar:", error);
    return null;
  }
}

/**
 * Salva nova resposta da IA no cache
 */
export async function cacheAIResponse(
  activityTitle: string,
  category: string,
  response: string
): Promise<void> {
  try {
    const pattern = normalizeText(activityTitle);

    await db.responseCache.add({
      activityPattern: pattern,
      category,
      response,
      usageCount: 1,
      lastUsed: new Date(),
      createdAt: new Date(),
    });

    console.log(`💾 Resposta salva no cache: "${response}"`);
  } catch (error) {
    console.error("Erro ao salvar resposta no cache:", error);
  }
}

/**
 * Limpa cache antigo (respostas não usadas há 30+ dias)
 */
export async function cleanOldCache(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldResponses = await db.responseCache
      .where("lastUsed")
      .below(thirtyDaysAgo)
      .toArray();

    const ids = oldResponses.map((r) => r.id!).filter((id) => id !== undefined);

    if (ids.length > 0) {
      await db.responseCache.bulkDelete(ids);
      console.log(`🧹 ${ids.length} respostas antigas removidas do cache`);
    }

    return ids.length;
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    return 0;
  }
}
