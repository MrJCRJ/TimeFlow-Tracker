import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activitiesLocal } from "@/lib/db/schema";
import { gte } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activities = await db
      .select()
      .from(activitiesLocal)
      .where(gte(activitiesLocal.startedAt, today));

    // Calcula estatísticas
    const totalActivities = activities.length;
    const totalMinutes = activities.reduce(
      (sum, a) => sum + (a.durationMinutes || 0),
      0
    );

    // Agrupa por categoria
    const byCategory: Record<string, number> = {};
    activities.forEach((activity) => {
      if (activity.category && activity.durationMinutes) {
        byCategory[activity.category] =
          (byCategory[activity.category] || 0) + activity.durationMinutes;
      }
    });

    return NextResponse.json({
      totalActivities,
      totalMinutes,
      byCategory,
      currentStreak: totalActivities,
    });
  } catch (error) {
    console.error("Erro ao buscar stats:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
