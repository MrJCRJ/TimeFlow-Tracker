/**
 * Calculadora de Estatísticas de Atividades
 */

import type { Activity } from "./db/indexeddb";

export interface DayStats {
  totalActivities: number;
  totalMinutes: number;
  totalHours: string;
  byCategory: Map<string, CategoryStats>;
  longestActivity: Activity | null;
  shortestActivity: Activity | null;
  mostProductiveHour: number | null; // Hora do dia com mais atividades
  averageDuration: number;
}

export interface CategoryStats {
  count: number;
  totalMinutes: number;
  percentage: number;
  emoji: string;
}

/**
 * Calcula estatísticas detalhadas de um conjunto de atividades
 */
export function calculateDayStats(activities: Activity[]): DayStats {
  const finishedActivities = activities.filter(
    (a) => a.endedAt && a.durationMinutes
  );

  if (finishedActivities.length === 0) {
    return {
      totalActivities: 0,
      totalMinutes: 0,
      totalHours: "0h",
      byCategory: new Map(),
      longestActivity: null,
      shortestActivity: null,
      mostProductiveHour: null,
      averageDuration: 0,
    };
  }

  // Total de minutos
  const totalMinutes = finishedActivities.reduce(
    (sum, a) => sum + (a.durationMinutes || 0),
    0
  );

  // Por categoria
  const categoryMap = new Map<string, CategoryStats>();
  finishedActivities.forEach((activity) => {
    const category = activity.category || "📝 Outros";
    const minutes = activity.durationMinutes || 0;

    if (!categoryMap.has(category)) {
      const emoji = category.match(/^[\u{1F300}-\u{1F9FF}]/u)?.[0] || "📝";
      categoryMap.set(category, {
        count: 0,
        totalMinutes: 0,
        percentage: 0,
        emoji,
      });
    }

    const stats = categoryMap.get(category)!;
    stats.count++;
    stats.totalMinutes += minutes;
  });

  // Calcula percentuais
  categoryMap.forEach((stats) => {
    stats.percentage = (stats.totalMinutes / totalMinutes) * 100;
  });

  // Atividade mais longa e mais curta
  const sorted = [...finishedActivities].sort(
    (a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0)
  );
  const longestActivity = sorted[0] || null;
  const shortestActivity = sorted[sorted.length - 1] || null;

  // Hora mais produtiva (hora com mais atividades iniciadas)
  const hourCounts = new Map<number, number>();
  finishedActivities.forEach((activity) => {
    const hour = new Date(activity.startedAt).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  let mostProductiveHour = null;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      mostProductiveHour = hour;
    }
  });

  // Duração média
  const averageDuration = Math.round(totalMinutes / finishedActivities.length);

  // Formata horas
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalHours =
    hours > 0
      ? `${hours}h${minutes > 0 ? minutes + "min" : ""}`
      : `${minutes}min`;

  return {
    totalActivities: finishedActivities.length,
    totalMinutes,
    totalHours,
    byCategory: categoryMap,
    longestActivity,
    shortestActivity,
    mostProductiveHour,
    averageDuration,
  };
}

/**
 * Compara estatísticas de dois dias
 */
export function compareStats(today: DayStats, yesterday: DayStats) {
  return {
    activitiesChange: today.totalActivities - yesterday.totalActivities,
    minutesChange: today.totalMinutes - yesterday.totalMinutes,
    productivityChange:
      ((today.totalMinutes - yesterday.totalMinutes) / yesterday.totalMinutes) *
      100,
  };
}

/**
 * Gera insights automáticos baseados nas estatísticas
 */
export function generateInsights(stats: DayStats): string[] {
  const insights: string[] = [];

  // Insight sobre duração total
  if (stats.totalMinutes > 480) {
    // 8h
    insights.push(`🔥 Dia produtivo! Você trabalhou ${stats.totalHours}`);
  } else if (stats.totalMinutes < 120) {
    // 2h
    insights.push(`💡 Dia leve com ${stats.totalHours} de atividades`);
  }

  // Insight sobre categoria dominante
  const sortedCategories = Array.from(stats.byCategory.entries()).sort(
    (a, b) => b[1].totalMinutes - a[1].totalMinutes
  );

  if (sortedCategories.length > 0) {
    const [topCategory, topStats] = sortedCategories[0];
    if (topStats.percentage > 50) {
      insights.push(
        `${topStats.emoji} Focado em ${topCategory.replace(
          /^.+?\s/,
          ""
        )}: ${topStats.percentage.toFixed(0)}% do dia`
      );
    }
  }

  // Insight sobre hora produtiva
  if (stats.mostProductiveHour !== null) {
    const hour = stats.mostProductiveHour;
    const period = hour < 12 ? "manhã" : hour < 18 ? "tarde" : "noite";
    insights.push(`⏰ Mais ativo na ${period} (${hour}h)`);
  }

  // Insight sobre variedade
  if (stats.byCategory.size >= 5) {
    insights.push(
      `🎨 Dia variado com ${stats.byCategory.size} tipos de atividades`
    );
  }

  return insights;
}
