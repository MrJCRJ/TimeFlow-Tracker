/**
 * Serviço de IA em Tempo Real
 * Processa atividades instantaneamente: resumo, categoria e resposta motivacional
 */

interface AIActivityResponse {
  summary: string; // Nome resumido da atividade
  category: string; // Categoria/emoji
  response: string; // Resposta motivacional da IA
  originalTitle: string; // Título original do usuário
}

interface ActivityContext {
  previousActivity?: {
    title: string;
    summary?: string;
    category?: string;
    durationMinutes: number;
  };
  todayStats: {
    activitiesCount: number;
    totalMinutes: number;
  };
}

export async function processActivityWithAI(
  title: string,
  context: ActivityContext
): Promise<AIActivityResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY não configurada");
  }

  // Monta contexto para a IA
  const contextInfo = context.previousActivity
    ? `\n\nATIVIDADE ANTERIOR: "${context.previousActivity.title}" (${
        context.previousActivity.durationMinutes
      }min)
CATEGORIA: ${context.previousActivity.category || "N/A"}`
    : "\n\n(Primeira atividade do dia)";

  const statsInfo = `\n\nESTATÍSTICAS DE HOJE:
- ${context.todayStats.activitiesCount} atividades registradas
- ${Math.round(context.todayStats.totalMinutes / 60)}h${
    context.todayStats.totalMinutes % 60
  }min trabalhados`;

  const prompt = `Você é um assistente de produtividade que responde INSTANTANEAMENTE ao usuário.

O usuário acabou de dizer: "${title}"

Retorne APENAS um JSON válido (sem markdown):
{
  "summary": "nome curto e claro (max 4 palavras)",
  "category": "emoji + categoria (ex: 🏠 Casa, 💼 Trabalho, 🎮 Lazer, 🍳 Alimentação, 🚿 Higiene, 🧘 Saúde, 📚 Estudos)",
  "response": "resposta motivacional CURTA (1 frase, max 15 palavras, use emoji)"
}

REGRAS DE CATEGORIZAÇÃO:
- Se mencionou FINALIZAR/CONCLUIR projeto/trabalho E algo pessoal depois (banho, descansar, etc), use a categoria da NOVA atividade pessoal
- 💼 Trabalho: projetos, reuniões, tarefas profissionais, programação, desenvolvimento
- 🏠 Casa: limpeza, organização, arrumar casa, tarefas domésticas
- 🚿 Higiene: banho, escovar dentes, lavar rosto, barbear, cuidados pessoais
- 🧘 Saúde: exercícios, descanso, meditação, dormir, alongamento, relaxar
- 🍳 Alimentação: cozinhar, comer, preparar comida, almoço, jantar, lanche
- 🎮 Lazer: jogos, séries, filmes, hobby, diversão, entretenimento
- 📚 Estudos: cursos, leitura, aprendizado, faculdade, pesquisa

IMPORTANTE:
- Summary: foque na PRÓXIMA ação se houver transição (ex: "Banho" se disse "finalizei X agora vou tomar banho")
- Category: escolha baseado na PRÓXIMA atividade, não na anterior mencionada
- Response: reconheça a conquista E incentive a próxima ação
${contextInfo}${statsInfo}

Seja natural e humano!`;

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
                "Você é um coach de produtividade empático e motivador. Responda sempre em JSON válido.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200, // Resposta curta e rápida
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extrai JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA sem JSON válido");
    }

    const aiResponse: AIActivityResponse = JSON.parse(jsonMatch[0]);

    return {
      ...aiResponse,
      originalTitle: title,
    };
  } catch (error) {
    console.error("Erro ao processar com IA:", error);

    // Fallback simples (sem IA) só para não quebrar
    return {
      summary: title.slice(0, 50),
      category: "📝 Geral",
      response: "Registrado! Continue assim! 💪",
      originalTitle: title,
    };
  }
}
