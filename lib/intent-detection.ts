/**
 * Serviço de Detecção de Intenção com IA
 * A IA detecta automaticamente se o usuário quer conversar ou registrar atividade
 */

export type IntentType = "activity" | "chat" | "question" | "feedback";

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
            content: `Você é um classificador de intenção. Analise o texto do usuário e determine se ele quer:
- "activity": registrar uma atividade/tarefa (ex: "limpeza casa", "jogar", "trabalhar", "estudando")
- "chat": conversar ou desabafar (ex: "estou desanimado", "tô cansado", "não sei o que fazer")
- "question": fazer uma pergunta (ex: "como funciona?", "por que preciso disso?")
- "feedback": dar feedback sobre o sistema (ex: "você é chato", "isso é legal", "não gostei")

Responda APENAS com um JSON no formato:
{"type": "activity"|"chat"|"question"|"feedback", "confidence": 0.0-1.0, "reasoning": "breve explicação"}

Seja preciso e direto. Textos muito curtos como "jogar", "limpeza" são atividades. Emoções e desabafos são chat.`,
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

    // Parse do JSON retornado pela IA
    const result = JSON.parse(content) as IntentResult;
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

  // Pergunta óbvia
  if (normalized.includes("?")) {
    return {
      type: "question",
      confidence: 0.9,
      reasoning: "Contém interrogação",
    };
  }

  // Palavras de emoção/desabafo
  const emotionWords = [
    "desanimado",
    "triste",
    "cansado",
    "chato",
    "feliz",
    "estressado",
  ];
  if (emotionWords.some((word) => normalized.includes(word))) {
    return {
      type: "chat",
      confidence: 0.8,
      reasoning: "Contém palavra emocional",
    };
  }

  // Feedback sobre o sistema
  if (
    normalized.includes("você") ||
    normalized.match(/\b(legal|ruim|bom|útil)\b/)
  ) {
    return {
      type: "feedback",
      confidence: 0.8,
      reasoning: "Parece feedback sobre o sistema",
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
