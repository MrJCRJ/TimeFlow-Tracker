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

  const prompt = `Você é um coach de produtividade que analisa atividades e responde de forma PERSONALIZADA.

O usuário acabou de dizer: "${title}"
${contextInfo}${statsInfo}

ANÁLISE CONTEXTUAL:
1. Se está FINALIZANDO algo → parabenize o resultado
2. Se está COMEÇANDO algo → motive para fazer bem
3. Se está DESCANSANDO após trabalho → valide o merecimento
4. Se está fazendo algo REPETITIVO → varie a resposta, reconheça o padrão
5. Se passou MUITO TEMPO na mesma coisa → sugira pausa (sutilmente)

Retorne APENAS JSON válido (sem markdown):
{
  "summary": "nome curto e claro (max 4 palavras)",
  "category": "emoji + categoria",
  "response": "resposta personalizada (1-2 frases, max 20 palavras, use emoji relevante)"
}

CATEGORIAS DISPONÍVEIS:
💼 Trabalho - projetos, código, reuniões, tarefas profissionais
🏠 Casa - limpeza, organização, tarefas domésticas
🚿 Higiene - banho, dentes, cuidados pessoais
🧘 Saúde - exercícios, sono, descanso, meditação
🍳 Alimentação - cozinhar, comer, preparar refeição
🎮 Lazer - jogos, séries, hobby, diversão, viagem
📚 Estudos - cursos, leitura, faculdade, aprendizado
🛒 Compras - mercado, shopping, delivery
🚗 Transporte - dirigir, viagem, deslocamento
👥 Social - encontro, conversa, família, amigos

REGRAS DE CATEGORIZAÇÃO:
- Múltiplas ações → escolha a PRINCIPAL (mais tempo/esforço)
- "banho e descansar" → 🚿 Higiene (banho é ação principal)
- "treinar ouvindo música" → 🧘 Saúde (treino é foco)
- "finalizei X, vou Y" → categoria de Y (próxima ação)

REGRAS DE RESPOSTA:
✅ FAÇA:
- Reconheça o contexto (ex: 3ª vez que toma banho hoje? comente!)
- Varie respostas para mesma categoria
- Use dados do contexto (tempo trabalhado, atividade anterior)
- Seja específico sobre a atividade (ex: "Código limpo é código feliz!" para programação)
- Parabenize conquistas (finalizou algo importante)
- Valide descanso após trabalho intenso

❌ NÃO FAÇA:
- Respostas genéricas ("Continue assim!")
- Sempre mesma frase para mesma categoria
- Ignorar contexto temporal (trabalhou 6h? reconheça!)
- Forçar produtividade em momentos de descanso
- Ser chato/repetitivo

EXEMPLOS DE BOAS RESPOSTAS:
"trabalhando no projeto TimeFlow" (primeira do dia)
→ "Bom dia! Começar focado é meio caminho andado! 💼✨"

"trabalhando no projeto TimeFlow" (já trabalhou 4h)
→ "4h de foco! Você tá voando hoje! 🚀"

"vou descansar" (após 6h de trabalho)
→ "6h bem trabalhadas! Descanso merecido! 😌"

"tomar banho" (3ª vez hoje)
→ "Terceiro banho? Refrescando bastante hoje! 🚿"

"Netflix" (após trabalho)
→ "Hora de relaxar com uma boa série! 🍿"

"Netflix" (sem trabalhar antes)
→ "Momento de lazer! Aproveite! 🎬"

Seja natural, humano e CONTEXTUAL!`;

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
                "Você é um coach de produtividade empático, observador e CONTEXTUAL. Varie suas respostas baseando-se no histórico. Responda sempre em JSON válido.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8, // Aumentado para mais variedade
          max_tokens: 250,
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
