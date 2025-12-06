import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbacksLocal } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const feedbacks = await db
      .select()
      .from(feedbacksLocal)
      .orderBy(desc(feedbacksLocal.date))
      .limit(30); // Últimos 30 dias

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Erro ao buscar feedbacks:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
