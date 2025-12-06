import { NextRequest, NextResponse } from "next/server";
import { processActivityWithAI } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const { title, context } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    console.log("🤖 Processando atividade com IA:", title);
    const result = await processActivityWithAI(title, context);
    console.log("✅ IA respondeu:", result);

    return NextResponse.json(result);
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
