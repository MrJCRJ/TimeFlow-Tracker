/**
 * Serviço de Detecção de Intenção com IA
 * A IA detecta automaticamente se o usuário quer registrar atividade ou fazer pergunta focada
 */

export type IntentType = "activity" | "question" | "off-topic";

interface IntentResult {
  type: IntentType;
  confidence: number;
  reasoning?: string;
  usingFallback?: boolean; // Indica se está usando fallback
  fallbackMessage?: string; // Mensagem para o usuário
}

/**
 * Usa IA para detectar intenção do usuário
 */
export async function detectIntent(text: string): Promise<IntentResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    // SEM fallback - apenas informa que está offline
    return {
      type: "activity", // Default temporário
      confidence: 0,
      usingFallback: true,
      fallbackMessage:
        "🔌 IA offline - Seus inputs estão sendo salvos para análise posterior",
    };
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
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
            content: `Você é um classificador de intenção para um app de produtividade. Analise o texto do usuário e determine se ele quer:

- "activity": registrar uma atividade/tarefa (ex: "limpeza casa", "jogar", "trabalhar", "estudando", "vou fazer X")
- "question": fazer pergunta SOBRE PRODUTIVIDADE (ex: "quanto trabalhei?", "qual meu progresso?", "me dê dicas")
- "off-topic": conversa geral não relacionada (ex: "quem é você?", "conte uma piada", "o que é vida?")

IMPORTANTE: 
- Chat geral = "off-topic" (você vai recusar educadamente)
- Perguntas sobre o app/produtividade = "question" (você responde)
- Emoções relacionadas ao trabalho = "question" (ex: "tô cansado do trabalho" → dê dica de descanso)
- Emoções gerais = "off-topic" (ex: "tô triste com a vida" → recuse)

Responda APENAS com JSON:
{"type": "activity"|"question"|"off-topic", "confidence": 0.0-1.0, "reasoning": "breve explicação"}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3, // Baixa temperatura para respostas consistentes
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error("Erro na API DeepSeek:", response.status);
      return {
        type: "activity",
        confidence: 0,
        usingFallback: true,
        fallbackMessage:
          "🔌 IA offline - Seus inputs estão sendo salvos para análise posterior",
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      return {
        type: "activity",
        confidence: 0,
        usingFallback: true,
        fallbackMessage:
          "🔌 IA offline - Seus inputs estão sendo salvos para análise posterior",
      };
    }

    // Limpa markdown code blocks se houver (```json ... ```)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    // Parse do JSON retornado pela IA
    const result = JSON.parse(cleanContent) as IntentResult;
    console.log("🤖 IA detectou intenção:", result);
    return {
      ...result,
      usingFallback: false,
    };
  } catch (error) {
    console.error("Erro ao detectar intenção com IA:", error);
    return {
      type: "activity",
      confidence: 0,
      usingFallback: true,
      fallbackMessage:
        "🔌 IA offline - Seus inputs estão sendo salvos para análise posterior",
    };
  }
}

/**
 * Fallback simples (regras básicas) caso a IA não esteja disponível
 */
function detectIntentFallback(text: string): IntentResult {
  const normalized = text.toLowerCase().trim();

  // Pergunta sobre produtividade
  const productivityQuestions = [
    "quanto",
    "progresso",
    "dica",
    "sugestão",
    "melhorar",
    "produtividade",
  ];
  if (
    normalized.includes("?") &&
    productivityQuestions.some((word) => normalized.includes(word))
  ) {
    return {
      type: "question",
      confidence: 0.8,
      reasoning: "Pergunta sobre produtividade",
    };
  }

  // Perguntas gerais = off-topic
  if (normalized.includes("?")) {
    return {
      type: "off-topic",
      confidence: 0.9,
      reasoning: "Pergunta não relacionada",
    };
  }

  // Default: assume atividade
  return {
    type: "activity",
    confidence: 0.7,
    reasoning: "Assumindo atividade (fallback)",
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
