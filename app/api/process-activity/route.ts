import { NextRequest, NextResponse } from "next/server";
import { processActivityWithAI } from "@/lib/ai-service";
import { getSmartResponse, saveAIResponseToCache } from "@/lib/smart-responses";

export async function POST(request: NextRequest) {
  try {
    const { title, context, userStats } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    console.log("🤖 Processando atividade:", title);

    // Processa com IA para obter summary e category primeiro
    const aiResult = await processActivityWithAI(title, context);
    const category = aiResult.category || "📝 Outros";

    // Contexto para templates
    const templateContext = {
      previousCategory: context?.previousActivity?.category,
      totalMinutesWorked: context?.todayStats?.totalMinutes || 0,
      sameActivityCount: 0, // TODO: calcular quantas vezes fez atividade similar hoje
    };

    // Obtém resposta inteligente (Cache → IA → Template)
    const smartResponse = await getSmartResponse(
      title,
      category,
      {
        totalActivitiesRegistered: userStats?.totalActivities || 0,
        lastAIResponseDate: userStats?.lastAIDate
          ? new Date(userStats.lastAIDate)
          : null,
        todayActivitiesCount: userStats?.todayCount || 0,
      },
      templateContext
    );

    let response: string;
    let strategyReason: string;

    if (smartResponse.source === "cache") {
      response = smartResponse.response;
      strategyReason = "Cache - resposta similar encontrada";
      console.log(`♻️ ${strategyReason}: "${response}"`);
    } else if (smartResponse.source === "ai") {
      response = aiResult.response;
      strategyReason = "IA - processamento necessário";
      console.log(`🤖 ${strategyReason}: "${response}"`);

      // Salva no cache para reuso futuro
      await saveAIResponseToCache(title, category, response);
    } else {
      response = smartResponse.response;
      strategyReason = "Template - atividade rotineira";
      console.log(`📝 ${strategyReason}: "${response}"`);
    }

    return NextResponse.json({
      summary: aiResult.summary,
      category: aiResult.category,
      response,
      strategy: strategyReason,
    });
  } catch (error) {
    console.error("❌ Erro ao processar atividade:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar com IA",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
