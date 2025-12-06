import { NextResponse } from "next/server";
import {
  addPendingInput,
  getPendingCount,
  processPendingInputs,
} from "@/lib/pending-queue";

/**
 * POST /api/pending-queue
 * Adiciona input à fila de pendências
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texto inválido" }, { status: 400 });
    }

    await addPendingInput(text);
    const count = await getPendingCount();

    return NextResponse.json({
      success: true,
      message: "Input adicionado à fila",
      pendingCount: count,
    });
  } catch (error) {
    console.error("Erro ao adicionar à fila:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar à fila" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pending-queue
 * Retorna quantidade de inputs pendentes
 */
export async function GET() {
  try {
    const count = await getPendingCount();
    return NextResponse.json({ pendingCount: count });
  } catch (error) {
    console.error("Erro ao buscar fila:", error);
    return NextResponse.json({ error: "Erro ao buscar fila" }, { status: 500 });
  }
}

/**
 * PUT /api/pending-queue
 * Processa todos os inputs pendentes
 */
export async function PUT() {
  try {
    const result = await processPendingInputs();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao processar fila:", error);
    return NextResponse.json(
      { error: "Erro ao processar fila" },
      { status: 500 }
    );
  }
}
