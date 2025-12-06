import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  activitiesLocal,
  feedbacksLocal,
  pendingInputs,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function DELETE() {
  try {
    // Apaga todas as atividades
    await db.delete(activitiesLocal);

    // Apaga todos os feedbacks
    await db.delete(feedbacksLocal);

    // Apaga todos os inputs pendentes
    await db.delete(pendingInputs);

    // Reseta os auto-increment IDs (SQLite)
    await db.run(
      sql`DELETE FROM sqlite_sequence WHERE name IN ('activities_local', 'feedbacks_local', 'pending_inputs')`
    );

    return NextResponse.json({
      success: true,
      message: "Todos os dados foram apagados",
    });
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    return NextResponse.json(
      { error: "Erro ao limpar dados" },
      { status: 500 }
    );
  }
}
