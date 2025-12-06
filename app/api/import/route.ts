import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activitiesLocal, feedbacksLocal } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const importData = await request.json();

    // Valida estrutura do arquivo
    if (!importData.version || !importData.data) {
      return NextResponse.json(
        { error: "Formato de arquivo inválido" },
        { status: 400 }
      );
    }

    const data = importData.data;
    let importedActivities = 0;
    let importedFeedbacks = 0;

    // Importa atividades
    if (data.activities && Array.isArray(data.activities)) {
      for (const activity of data.activities) {
        try {
          await db.insert(activitiesLocal).values({
            title: activity.title || activity.activity || "Sem título",
            summary: activity.summary || null,
            category: activity.category || null,
            aiResponse: activity.aiResponse || activity.feedback || null,
            startedAt: activity.startedAt
              ? new Date(activity.startedAt)
              : activity.timestamp
              ? new Date(activity.timestamp)
              : new Date(),
            endedAt: activity.endedAt ? new Date(activity.endedAt) : null,
            durationMinutes: activity.durationMinutes || activity.duration || null,
          });
          importedActivities++;
        } catch (err) {
          console.error("Erro ao importar atividade:", err);
          // Continua importando as outras
        }
      }
    }

    // Importa feedbacks/insights
    if (data.feedbacks && Array.isArray(data.feedbacks)) {
      for (const feedback of data.feedbacks) {
        try {
          await db.insert(feedbacksLocal).values({
            date: feedback.date || new Date().toISOString().split("T")[0],
            type: feedback.type || "daily",
            theme: feedback.theme || null,
            score: feedback.score || null,
            insights: feedback.insights || null,
            suggestion: feedback.suggestion || feedback.suggestions || null,
            createdAt: feedback.createdAt ? new Date(feedback.createdAt) : new Date(),
          });
          importedFeedbacks++;
        } catch (err) {
          console.error("Erro ao importar feedback:", err);
          // Continua importando os outros
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        activities: importedActivities,
        feedbacks: importedFeedbacks,
      },
    });
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return NextResponse.json(
      { error: "Erro ao importar dados: " + (error as Error).message },
      { status: 500 }
    );
  }
}
