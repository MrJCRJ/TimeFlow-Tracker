/**
 * Serviço de Chat com a IA
 * Para perguntas FOCADAS em produtividade (não conversa geral)
 */

interface ChatResponse {
  message: string;
  type: "answer" | "motivation" | "acknowledgment" | "empathy";
  suggestion?: string; // Sugestão opcional de atividade
}

interface ChatContext {
  todayStats: {
    activitiesCount: number;
    totalMinutes: number;
  };
  currentActivity?: {
    title: string;
    durationMinutes: number;
  };
  lastFeedback?: {
    score: number;
    theme: string;
  };
}

export async function chatWithAI(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return {
      message:
        "Desculpe, preciso estar configurado para conversar com você! 😊",
      type: "acknowledgment",
    };
  }

  // Monta contexto da conversa
  const contextInfo = `
CONTEXTO DO DIA:
- ${context.todayStats.activitiesCount} atividades registradas hoje
- ${Math.floor(context.todayStats.totalMinutes / 60)}h${
    context.todayStats.totalMinutes % 60
  }min trabalhados
${
  context.currentActivity
    ? `- Atividade atual: ${context.currentActivity.title} (há ${context.currentActivity.durationMinutes}min)`
    : "- Nenhuma atividade em andamento"
}
${
  context.lastFeedback
    ? `- Último feedback: ${context.lastFeedback.theme} (${context.lastFeedback.score}/10)`
    : ""
}
`;

  const prompt = `Você é um coach de produtividade focado. O usuário fez uma PERGUNTA sobre produtividade/progresso.

Mensagem do usuário: "${userMessage}"

${contextInfo}

Responda de forma:
- OBJETIVA e DIRETA para perguntas sobre dados (ex: "quanto trabalhei?")
- MOTIVADORA para pedidos de dica/sugestão
- BREVE (máximo 2-3 frases)
- FOCADA EM PRODUTIVIDADE

Retorne APENAS JSON:
{
  "message": "sua resposta direta e focada",
  "type": "answer|motivation",
  "suggestion": "opcional: sugestão prática se relevante"
}

IMPORTANTE:
- Responda APENAS sobre produtividade/progresso
- Use os dados do contexto quando relevante
- Seja prático e acionável`;

  try {
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
              content:
                "Você é um coach empático e humano. Priorize compreensão sobre produtividade.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.9, // Mais criativo e humano
          max_tokens: 250,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta sem JSON");
    }

    const chatResponse: ChatResponse = JSON.parse(jsonMatch[0]);
    return chatResponse;
  } catch (error) {
    console.error("Erro ao conversar com IA:", error);

    // Fallback empático
    if (
      userMessage.toLowerCase().includes("desanimado") ||
      userMessage.toLowerCase().includes("cansado")
    ) {
      return {
        message:
          "Entendo como você se sente. Às vezes precisamos de uma pausa. Está tudo bem! 💙",
        type: "empathy",
        suggestion: "Que tal uma pausa de 10min?",
      };
    }

    if (userMessage.toLowerCase().includes("chato")) {
      return {
        message:
          "Desculpa se estou sendo chato! Meu objetivo é ajudar, não pressionar. Como posso melhorar? 😊",
        type: "acknowledgment",
      };
    }

    return {
      message: "Estou aqui para conversar! Como você está se sentindo? 💬",
      type: "answer",
    };
  }
}
