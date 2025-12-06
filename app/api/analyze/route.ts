import { NextRequest, NextResponse } from "next/server";
import { performDailyAnalysis } from "@/lib/daily-analysis";

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();

    const targetDate = date ? new Date(date) : new Date();

    await performDailyAnalysis(targetDate);

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Erro ao executar análise:", error);
    return NextResponse.json(
      { error: "Erro ao executar análise" },
      { status: 500 }
    );
  }
}
