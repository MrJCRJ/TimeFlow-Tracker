import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activitiesLocal, feedbacksLocal } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Importa atividades
    if (data.activities && Array.isArray(data.activities)) {
      for (const activity of data.activities) {
        await db.insert(activitiesLocal).values({
          title: activity.title || activity.activity,
          summary: activity.summary,
          category: activity.category,
          aiResponse: activity.aiResponse || activity.feedback,
          startedAt: activity.startedAt || new Date(activity.timestamp),
          endedAt: activity.endedAt,
          durationMinutes: activity.durationMinutes || activity.duration,
        });
      }
    }

    // Importa feedbacks/insights
    if (data.feedbacks && Array.isArray(data.feedbacks)) {
      for (const feedback of data.feedbacks) {
        await db.insert(feedbacksLocal).values({
          date: feedback.date,
          type: feedback.type || "daily",
          theme: feedback.theme,
          score: feedback.score,
          insights: feedback.insights,
          suggestion: feedback.suggestion || feedback.suggestions,
          createdAt: feedback.createdAt || new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        activities: data.activities?.length || 0,
        feedbacks: data.feedbacks?.length || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return NextResponse.json(
      { error: "Erro ao importar dados" },
      { status: 500 }
    );
  }
}
