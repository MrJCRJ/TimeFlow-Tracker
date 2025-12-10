/**
 * API Route: /api/goals/discover
 * Melhora o texto do usuário e sugere objetivos personalizados
 */

import { NextRequest, NextResponse } from "next/server";
import { getDeepSeekResponse } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const { selfDescription } = await request.json();

    if (!selfDescription || typeof selfDescription !== "string" || !selfDescription.trim()) {
      return NextResponse.json(
        { error: "Descrição pessoal é obrigatória" },
        { status: 400 }
      );
    }

    // Primeiro: Melhorar o texto do usuário
    const improvePrompt = `Melhore este texto pessoal do usuário, tornando-o mais claro, organizado e inspirador. Mantenha a voz pessoal e autêntica, mas torne-o mais eloquente e motivador:

TEXTO ORIGINAL: "${selfDescription}"

INSTRUÇÕES:
- Mantenha a essência e autenticidade do texto original
- Organize as ideias de forma mais clara e fluida
- Torne-o mais inspirador e motivador
- Corrija erros gramaticais se houver
- Mantenha o tom pessoal e conversacional
- Não adicione informações que não estavam no texto original

Retorne apenas o texto melhorado, sem explicações ou comentários adicionais.`;

    const improvedText = await getDeepSeekResponse(improvePrompt);

    // Segundo: Gerar sugestões de objetivos baseadas no texto melhorado
    const suggestionsPrompt = `Com base neste texto pessoal melhorado, sugira 2-3 objetivos SMART específicos e acionáveis:

TEXTO MELHORADO: "${improvedText}"

OBJETIVOS DEVEM SER:
1. SMART (Específicos, Mensuráveis, Atingíveis, Relevantes, Temporais)
2. Diretamente relacionados ao que a pessoa expressou
3. Motivadores e inspiradores
4. Quebrados em metas específicas quando apropriado

Formate como uma lista numerada de sugestões de objetivos, cada uma começando com um emoji relevante.

EXEMPLO DE FORMATO:
🎯 "Melhorar minha produtividade no trabalho completando 3 tarefas importantes por dia até março"
📚 "Desenvolver habilidades em programação dedicando 2 horas diárias aos estudos até junho"
💪 "Melhorar minha saúde física fazendo exercícios 4 vezes por semana até dezembro"`;

    const suggestions = await getDeepSeekResponse(suggestionsPrompt);

    return NextResponse.json({
      improvedText: improvedText.trim(),
      suggestions: suggestions.trim(),
    });

  } catch (error) {
    console.error("Erro na análise de auto-conhecimento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}