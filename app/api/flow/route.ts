import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activitiesLocal } from "@/lib/db/schema";
import { desc, isNull, gte } from "drizzle-orm";
import { processActivityWithAI } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Título obrigatório" },
        { status: 400 }
      );
    }

    // 1. Busca atividade anterior e estatísticas do dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ongoingActivities = await db
      .select()
      .from(activitiesLocal)
      .where(isNull(activitiesLocal.endedAt))
      .orderBy(desc(activitiesLocal.startedAt))
      .limit(1);

    const todayActivities = await db
      .select()
      .from(activitiesLocal)
      .where(gte(activitiesLocal.startedAt, today));

    const todayStats = {
      activitiesCount: todayActivities.length,
      totalMinutes: todayActivities.reduce(
        (sum, a) => sum + (a.durationMinutes || 0),
        0
      ),
    };

    // 2. Encerra atividade anterior (se existir)
    let previousActivity = undefined;

    if (ongoingActivities.length > 0) {
      const ongoing = ongoingActivities[0];
      const endedAt = new Date();
      const durationMinutes = Math.round(
        (endedAt.getTime() - ongoing.startedAt.getTime()) / 60000
      );

      await db
        .update(activitiesLocal)
        .set({
          endedAt,
          durationMinutes,
        })
        .where(isNull(activitiesLocal.endedAt));

      previousActivity = {
        title: ongoing.title,
        summary: ongoing.summary || undefined,
        category: ongoing.category || undefined,
        durationMinutes,
      };
    }

    // 3. Processa com IA em tempo real
    console.log("🤖 Processando com IA:", title);

    const aiResult = await processActivityWithAI(title.trim(), {
      previousActivity,
      todayStats,
    });

    console.log("✅ IA respondeu:", aiResult);

    // 4. Cria nova atividade com dados da IA
    const newActivity = await db
      .insert(activitiesLocal)
      .values({
        title: title.trim(),
        summary: aiResult.summary,
        category: aiResult.category,
        aiResponse: aiResult.response,
        startedAt: new Date(),
        endedAt: null,
        durationMinutes: null,
      })
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao processar fluxo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
