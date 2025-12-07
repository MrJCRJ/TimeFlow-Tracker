import { NextRequest, NextResponse } from "next/server";

interface Activity {
  id?: number;
  title: string;
  startedAt: string;
  durationMinutes?: number;
}

interface Feedback {
  date: string;
  score: number;
  theme: string;
  insights: string[];
  suggestion: string;
}

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

export async function POST(request: NextRequest) {
  try {
    const { activities, previousFeedbacks, dateStr } = await request.json();

    if (!activities || activities.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma atividade fornecida", success: false },
        { status: 400 }
      );
    }

    console.log(
      `📊 API Analyze - Analisando ${activities.length} atividades para ${dateStr}`
    );

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

    // Prepara contexto histórico
    const historyContext =
      previousFeedbacks && previousFeedbacks.length > 0
        ? `\n\nHISTÓRICO DOS ÚLTIMOS DIAS (use para aprender padrões do usuário):\n` +
          previousFeedbacks
            .map((f: Feedback) => {
              return `${f.date} (${f.score}/10) - ${
                f.theme
              }\n  Insights: ${f.insights.join(", ")}\n  Sugestão dada: ${
                f.suggestion
              }`;
            })
            .join("\n\n")
        : "\n\n(Primeiro dia de análise - sem histórico ainda)";

    // Chama DeepSeek API
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "DEEPSEEK_API_KEY não configurada no servidor",
          success: false,
        },
        { status: 500 }
      );
    }

    console.log(`🤖 Chamando DeepSeek API...`);

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
          temperature: 0.8,
          max_tokens: 600,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0].message.content;

    // Extrai JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);

    console.log(
      `✅ Análise concluída: ${analysis.theme} (${analysis.score}/10)`
    );

    return NextResponse.json({
      success: true,
      analysis,
      dateStr,
    });
  } catch (error) {
    console.error("Erro ao executar análise:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao executar análise",
        success: false,
      },
      { status: 500 }
    );
  }
}
