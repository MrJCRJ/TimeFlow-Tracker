import { db } from "@/lib/db";
import { activitiesLocal, feedbacksLocal, Activity } from "@/lib/db/schema";
import { gte, lt, eq, and, desc } from "drizzle-orm";

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnalysisResult {
  theme: string;
  score: number;
  insights: string[];
  suggestion: string;
}

export async function performDailyAnalysis(targetDate?: Date): Promise<void> {
  const date = targetDate || new Date();
  date.setHours(0, 0, 0, 0);

  const dateStr = date.toISOString().split("T")[0];

  // Verifica se já existe análise para o dia
  const existingFeedback = await db
    .select()
    .from(feedbacksLocal)
    .where(eq(feedbacksLocal.date, dateStr))
    .limit(1);

  if (existingFeedback.length > 0) {
    console.log(`Análise já existe para ${dateStr}`);
    return;
  }

  // Pega todas as atividades do dia
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const activities = await db
    .select()
    .from(activitiesLocal)
    .where(
      and(
        gte(activitiesLocal.startedAt, date),
        lt(activitiesLocal.startedAt, nextDay)
      )
    );

  if (activities.length === 0) {
    console.log(`Sem atividades para analisar em ${dateStr}`);
    return;
  }

  // Prepara o resumo para a IA
  const summary = activities
    .map((a: Activity) => {
      const start = new Date(a.startedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const duration = a.durationMinutes || 0;
      return `${start} - ${a.title} (${duration}min)`;
    })
    .join("\n");

  try {
    // Chama DeepSeek API (OBRIGATÓRIA - Sem fallback)
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      const errorMsg =
        "⚠️ DEEPSEEK_API_KEY não configurada! A análise inteligente é OBRIGATÓRIA. Configure no arquivo .env";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Busca feedbacks anteriores para contexto (IA aprende com histórico)
    const previousFeedbacks = await db
      .select()
      .from(feedbacksLocal)
      .orderBy(desc(feedbacksLocal.date))
      .limit(7); // Últimos 7 dias

    // Prepara contexto histórico para a IA
    const historyContext =
      previousFeedbacks.length > 0
        ? `\n\nHISTÓRICO DOS ÚLTIMOS DIAS (use para aprender padrões do usuário):\n` +
          previousFeedbacks
            .map((f) => {
              const insights =
                typeof f.insights === "string"
                  ? JSON.parse(f.insights)
                  : f.insights || [];
              return `${f.date} (${f.score}/10) - ${
                f.theme
              }\n  Insights: ${insights.join(", ")}\n  Sugestão dada: ${
                f.suggestion
              }`;
            })
            .join("\n\n")
        : "\n\n(Primeiro dia de análise - sem histórico ainda)";

    console.log(
      `📊 Analisando com IA - Contexto: ${previousFeedbacks.length} dias anteriores`
    );

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Você é um coach de produtividade INTELIGENTE que APRENDE com o usuário ao longo do tempo.

IMPORTANTE: Use o histórico dos dias anteriores para:
- Identificar padrões de comportamento
- Reconhecer progresso ou regressão
- Adaptar sugestões baseadas no que funcionou antes
- Ser cada vez mais personalizado e específico

Retorne APENAS um JSON válido (sem markdown):
{
  "theme": "tema principal do dia em 2-4 palavras",
  "score": número de 0 a 10,
  "insights": ["insight específico 1", "insight específico 2", "insight específico 3"],
  "suggestion": "sugestão PERSONALIZADA para amanhã baseada no histórico"
}

Seja direto, honesto, construtivo e ADAPTATIVO. Quanto mais dias, mais personalizado você deve ser.`,
            },
            {
              role: "user",
              content: `Atividades de hoje:\n\n${summary}${historyContext}`,
            },
          ],
          temperature: 0.8, // Aumentado para respostas mais criativas e adaptativas
          max_tokens: 600,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0].message.content;

    // Extrai JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);

    // Salva feedback
    await saveFeedback(dateStr, analysis);

    console.log(
      `✅ Análise IA concluída para ${dateStr}: ${analysis.theme} (${analysis.score}/10)`
    );
  } catch (error) {
    console.error("❌ ERRO CRÍTICO ao chamar DeepSeek API:", error);
    // SEM FALLBACK - IA é obrigatória
    throw new Error(
      `Falha na análise inteligente: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }

  // DELETA as atividades do dia (REGRA DE OURO)
  await deleteActivities(date, nextDay);
}

// Função removida - Análise LOCAL não é mais usada
// IA DeepSeek é OBRIGATÓRIA para análises inteligentes e adaptativas

async function saveFeedback(dateStr: string, analysis: AnalysisResult) {
  await db.insert(feedbacksLocal).values({
    date: dateStr,
    theme: analysis.theme,
    score: analysis.score,
    insights: JSON.stringify(analysis.insights) as any,
    suggestion: analysis.suggestion,
    createdAt: new Date(),
  });

  console.log(`Feedback salvo para ${dateStr}`);
}

async function deleteActivities(startDate: Date, endDate: Date) {
  await db
    .delete(activitiesLocal)
    .where(
      and(
        gte(activitiesLocal.startedAt, startDate),
        lt(activitiesLocal.startedAt, endDate)
      )
    );

  console.log(`Atividades deletadas do dia`);
}
