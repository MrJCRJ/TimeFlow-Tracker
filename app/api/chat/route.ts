import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/lib/chat-service";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Mensagem obrigatória" },
        { status: 400 }
      );
    }

    // Contexto simplificado - a IA pode responder sem precisar de dados locais
    const chatContext = {
      todayStats: { activitiesCount: 0, totalMinutes: 0 },
      currentActivity: undefined,
      lastTheme: undefined,
    };

    console.log("💬 Chat com IA:", message);

    const response = await chatWithAI(message.trim(), chatContext);

    console.log("✅ IA respondeu (chat):", response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erro no chat:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
