import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.DEEPSEEK_API_KEY;

  return NextResponse.json({
    hasApiKey,
    message: hasApiKey
      ? "API configurada corretamente"
      : "DEEPSEEK_API_KEY não encontrada no .env",
  });
}
