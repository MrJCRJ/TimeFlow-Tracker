/**
 * Serviço de Chat com a IA
 * Para conversas, perguntas e feedback (não registra atividade)
 */

interface ChatResponse {
  message: string;
  type: "empathy" | "motivation" | "answer" | "acknowledgment";
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

  const prompt = `Você é um coach de produtividade empático e humano. O usuário quer CONVERSAR com você, não registrar atividade.

Mensagem do usuário: "${userMessage}"

${contextInfo}

Responda de forma:
- EMPÁTICA se usuário expressar emoção negativa
- MOTIVADORA se usuário estiver desanimado
- COMPREENSIVA se usuário criticar o sistema
- NATURAL e HUMANA (como um amigo)
- CURTA (máximo 3 frases)

Retorne APENAS JSON:
{
  "message": "sua resposta empática e natural",
  "type": "empathy|motivation|answer|acknowledgment",
  "suggestion": "opcional: sugestão leve de atividade se fizer sentido"
}

IMPORTANTE:
- NÃO force o usuário a trabalhar
- Valide os sentimentos dele
- Se ele criticar você, aceite com humildade
- Se ele estiver cansado, reconheça isso
- Seja um AMIGO, não um chefe`;

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
