import { NextResponse } from "next/server";
import { detectIntent } from "@/lib/intent-detection";

/**
 * POST /api/detect-intent
 * Detecta a intenção do usuário usando IA
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texto inválido" }, { status: 400 });
    }

    const intent = await detectIntent(text);

    return NextResponse.json(intent);
  } catch (error) {
    console.error("Erro ao detectar intenção:", error);
    return NextResponse.json(
      { error: "Erro ao detectar intenção" },
      { status: 500 }
    );
  }
}
