import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activitiesLocal } from "@/lib/db/schema";
import { gte, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Pega atividades do dia atual (desde 00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activities = await db
      .select()
      .from(activitiesLocal)
      .where(gte(activitiesLocal.startedAt, today))
      .orderBy(desc(activitiesLocal.startedAt));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
