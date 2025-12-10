import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const { goalText, conversationHistory } = await request.json();

    const systemPrompt = `Você é um assistente especializado em ajudar pessoas a definir e estruturar objetivos de forma SMART (Específica, Mensurável, Atingível, Relevante, Temporal).

Seu papel é:
1. **Melhorar a redação** do objetivo do usuário, tornando-o mais claro e objetiva
2. **Criar metas específicas** e mensuráveis para alcançar o objetivo maior
3. **Fazer perguntas esclarecedoras** quando o objetivo for vago ou amplo
4. **Sugerir prazos** realistas se não foram mencionados
5. **Identificar recursos necessários** e possíveis obstáculos

DIRETRIZES:
- Se o objetivo for vago, faça 2-3 perguntas para entender melhor
- Se o objetivo for claro, melhore a redação e crie 3-5 metas específicas
- Use linguagem motivadora mas realista
- Sempre forneça uma versão melhorada do objetivo original
- Numere as metas claramente

FORMATO DE RESPOSTA:
Se precisar de mais informações:
"""
📝 META ORIGINAL: [meta do usuário]

🤔 PERGUNTAS PARA CLARIFICAR:
1. [Pergunta específica sobre prazo/escopo]
2. [Pergunta sobre recursos/contexto]
3. [Pergunta sobre prioridade/motivação]
"""

Se a meta estiver clara:
"""
📝 OBJETIVO ORIGINAL: [objetivo do usuário]

✨ OBJETIVO MELHORADO:
[Versão SMART do objetivo com prazo e critérios de sucesso]

🎯 METAS ESPECÍFICAS:
1. [Meta específica e mensurável]
2. [Meta específica e mensurável]
3. [Meta específica e mensurável]
...

💡 DICA: [Sugestão prática para começar]
"""`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: goalText },
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na API DeepSeek:", errorData);
      return NextResponse.json(
        { error: "Erro ao processar meta" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "Erro ao processar resposta";

    return NextResponse.json({
      response: aiResponse,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: "user", content: goalText },
        { role: "assistant", content: aiResponse },
      ],
    });
  } catch (error) {
    console.error("Erro ao processar meta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
