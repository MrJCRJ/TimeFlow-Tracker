import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  activitiesLocal,
  feedbacksLocal,
  pendingInputs,
} from "@/lib/db/schema";

export async function GET() {
  try {
    // Busca TODAS as atividades (não apenas hoje)
    const activities = await db.select().from(activitiesLocal);

    // Busca TODOS os feedbacks/insights
    const feedbacks = await db.select().from(feedbacksLocal);

    // Busca TODOS os inputs pendentes
    const pending = await db.select().from(pendingInputs);

    return NextResponse.json({
      activities,
      feedbacks,
      pending,
    });
  } catch (error) {
    console.error("Erro ao buscar dados para exportação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
