import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activitiesLocal, feedbacksLocal } from "@/lib/db/schema";
import { gte, isNull, desc } from "drizzle-orm";
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

    // Busca contexto para a conversa
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await db
      .select()
      .from(activitiesLocal)
      .where(gte(activitiesLocal.startedAt, today));

    const ongoingActivity = todayActivities.find((a) => a.endedAt === null);

    const todayStats = {
      activitiesCount: todayActivities.length,
      totalMinutes: todayActivities.reduce(
        (sum, a) => sum + (a.durationMinutes || 0),
        0
      ),
    };

    // Busca último feedback
    const lastFeedbacks = await db
      .select()
      .from(feedbacksLocal)
      .orderBy(desc(feedbacksLocal.date))
      .limit(1);

    const chatContext = {
      todayStats,
      currentActivity: ongoingActivity
        ? {
            title: ongoingActivity.summary || ongoingActivity.title,
            durationMinutes: Math.floor(
              (Date.now() - new Date(ongoingActivity.startedAt).getTime()) /
                60000
            ),
          }
        : undefined,
      lastFeedback: lastFeedbacks[0]
        ? {
            score: lastFeedbacks[0].score || 0,
            theme: lastFeedbacks[0].theme || "",
          }
        : undefined,
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
