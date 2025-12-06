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
- Se mencionou MÚLTIPLAS atividades (ex: "banho e descansar", "treinar enquanto escuta música"):
  * Escolha a atividade PRINCIPAL (a que leva mais tempo ou é o foco)
  * Exemplos: "banho e descansar" → 🚿 Higiene (banho é a ação principal)
  * "treinar enquanto escuta música" → 🧘 Saúde (treino é principal, música é secundária)
  * "cozinhar e assistir série" → 🍳 Alimentação (cozinhar é a ação, série é acompanhamento)

- Se mencionou FINALIZAR uma coisa e fazer OUTRA depois:
  * Foque na PRÓXIMA atividade, não na que finalizou
  * Exemplo: "finalizei projeto, vou tomar banho" → 🚿 Higiene

CATEGORIAS:
- 💼 Trabalho: projetos, reuniões, tarefas profissionais, programação, desenvolvimento
- 🏠 Casa: limpeza, organização, arrumar casa, tarefas domésticas
- 🚿 Higiene: banho, escovar dentes, lavar rosto, barbear, cuidados pessoais
- 🧘 Saúde: exercícios, treino, descanso, meditação, dormir, alongamento, relaxar
- 🍳 Alimentação: cozinhar, comer, preparar comida, almoço, jantar, lanche
- 🎮 Lazer: jogos, séries, filmes, hobby, diversão, entretenimento
- 📚 Estudos: cursos, leitura, aprendizado, faculdade, pesquisa

IMPORTANTE:
- Summary: use a atividade PRINCIPAL (ex: "Treinar" não "Treinar e ouvir música")
- Category: baseie na ação que leva mais tempo/esforço
- Response: reconheça TODAS as ações mencionadas, mas foque na principal
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
