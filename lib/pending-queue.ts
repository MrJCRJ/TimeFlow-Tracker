/**
 * Serviço de Fila de Pendências
 * Gerencia inputs quando a IA está offline
 */

import { db } from "./db";
import { pendingInputs } from "./db/schema";
import { eq } from "drizzle-orm";
import { detectIntent } from "./intent-detection";
import { processActivityWithAI } from "./ai-service";
import { chatWithAI } from "./chat-service";

interface ProcessedResult {
  intent: string;
  category?: string;
  summary?: string;
  response?: string;
}

/**
 * Adiciona input à fila de pendências
 */
export async function addPendingInput(text: string): Promise<void> {
  await db.insert(pendingInputs).values({
    text,
    timestamp: new Date(),
    processed: false,
  });

  console.log("📝 Input adicionado à fila:", text);
}

/**
 * Conta quantos inputs estão pendentes
 */
export async function getPendingCount(): Promise<number> {
  const pending = await db
    .select()
    .from(pendingInputs)
    .where(eq(pendingInputs.processed, false));

  return pending.length;
}

/**
 * Processa todos os inputs pendentes em lote
 */
export async function processPendingInputs(): Promise<{
  processed: number;
  activities: number;
  chats: number;
  summary: string;
}> {
  // Busca todos os inputs não processados
  const pending = await db
    .select()
    .from(pendingInputs)
    .where(eq(pendingInputs.processed, false))
    .orderBy(pendingInputs.timestamp);

  if (pending.length === 0) {
    return { processed: 0, activities: 0, chats: 0, summary: "" };
  }

  console.log(`🔄 Processando ${pending.length} inputs pendentes...`);

  let activitiesCount = 0;
  let chatsCount = 0;
  const results: Array<{ text: string; type: string; timestamp: Date }> = [];

  for (const input of pending) {
    try {
      // Detecta intenção com IA
      const intent = await detectIntent(input.text);

      let result: ProcessedResult = {
        intent: intent.type,
      };

      // Processa de acordo com a intenção
      if (intent.type === "activity") {
        // Registra como atividade (com timestamp original)
        const aiResult = await processActivityWithAI(input.text, {
          todayStats: { activitiesCount: 0, totalMinutes: 0 },
        });
        result = {
          ...result,
          category: aiResult.category,
          summary: aiResult.summary,
          response: aiResult.response,
        };
        activitiesCount++;
      } else {
        // Era uma conversa/pergunta/feedback
        const chatResult = await chatWithAI(input.text, {
          todayStats: { activitiesCount: 0, totalMinutes: 0 },
        });
        result = {
          ...result,
          response: chatResult.message,
        };
        chatsCount++;
      }

      // Marca como processado
      await db
        .update(pendingInputs)
        .set({
          processed: true,
          processedAt: new Date(),
          result: JSON.stringify(result),
        })
        .where(eq(pendingInputs.id, input.id));

      results.push({
        text: input.text,
        type: intent.type,
        timestamp: input.timestamp,
      });

      console.log(`✅ Processado: ${input.text} → ${intent.type}`);
    } catch (error) {
      console.error(`❌ Erro ao processar "${input.text}":`, error);
    }
  }

  // Gera resumo para o usuário
  const summary = generateSummary(results, activitiesCount, chatsCount);

  return {
    processed: pending.length,
    activities: activitiesCount,
    chats: chatsCount,
    summary,
  };
}

/**
 * Gera um resumo amigável do processamento
 */
function generateSummary(
  results: Array<{ text: string; type: string; timestamp: Date }>,
  activitiesCount: number,
  chatsCount: number
): string {
  const total = results.length;

  let summary = `🎉 **Processei ${total} ${
    total === 1 ? "item" : "itens"
  } que você registrou enquanto eu estava offline!**\n\n`;

  if (activitiesCount > 0) {
    summary += `✅ **${activitiesCount} ${
      activitiesCount === 1 ? "atividade" : "atividades"
    }** registradas:\n`;
    const activities = results.filter((r) => r.type === "activity");
    activities.forEach((a) => {
      const time = a.timestamp.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      summary += `• ${time} - ${a.text}\n`;
    });
    summary += "\n";
  }

  if (chatsCount > 0) {
    summary += `💬 **${chatsCount} ${
      chatsCount === 1 ? "conversa" : "conversas"
    }** analisadas:\n`;
    const chats = results.filter((r) => r.type !== "activity");
    chats.forEach((c) => {
      const time = c.timestamp.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      summary += `• ${time} - ${c.text}\n`;
    });
    summary += "\n";
  }

  summary += "Agora estou totalmente operacional! 🚀";

  return summary;
}

/**
 * Verifica se a IA está online e processa pendências automaticamente
 */
export async function checkAndProcessPending(): Promise<boolean> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return false;

    // Testa se a API está respondendo
    const testIntent = await detectIntent("teste");

    if (testIntent.usingFallback) {
      return false; // Ainda offline
    }

    // IA está online! Processa pendências
    const pendingCount = await getPendingCount();

    if (pendingCount > 0) {
      await processPendingInputs();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar IA:", error);
    return false;
  }
}
