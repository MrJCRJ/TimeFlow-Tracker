"use client";

import { useState } from "react";
import ActivityFlow from "@/components/ActivityFlow";
import TodayActivities from "@/components/TodayActivities";
import InsightsFeed from "@/components/InsightsFeed";
import SetupWarning from "@/components/SetupWarning";
import PendingQueueMonitor from "@/components/PendingQueueMonitor";
import DataManager from "@/components/DataManager";
import QuickStats from "@/components/QuickStats";
import CollapsibleSection from "@/components/CollapsibleSection";
import BottomNavigation from "@/components/BottomNavigation";
import DashboardModal from "@/components/DashboardModal";
import GoalsModal from "@/components/GoalsModal";
import PatternsModal from "@/components/PatternsModal";
import SettingsModal from "@/components/SettingsModal";
import { useActivities } from "@/lib/hooks/useDatabase";

// Force rebuild - v5 (Mobile-First UI)
export default function HomePage() {
  // Estados dos modais
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isPatternsOpen, setIsPatternsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dados do banco
  const activities = useActivities();
  const todayActivities = activities.filter((a) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return a.startedAt >= today;
  });

  const currentActivity = todayActivities.find((a) => !a.endedAt) || null;
  const totalMinutes = todayActivities.reduce(
    (acc, a) => acc + (a.durationMinutes || 0),
    0
  );

  // Tempo por categoria (apenas atividades finalizadas)
  const byCategory: Record<string, number> = {};
  todayActivities
    .filter((a) => a.endedAt)
    .forEach((a) => {
      const category = a.category || "Sem categoria";
      byCategory[category] =
        (byCategory[category] || 0) + (a.durationMinutes || 0);
    });

  // Estatísticas para Dashboard
  const dashboardStats = {
    totalActivities: activities.length,
    totalHours: Math.floor(
      activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) / 60
    ),
    mostProductiveCategory: "💼 Trabalho", // Simplificado
    streak: 5, // Simplificado
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Utilitários invisíveis */}
      <SetupWarning />
      <PendingQueueMonitor />
      <DataManager />

      {/* Container Principal */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* SEÇÃO SEMPRE VISÍVEL (270px) */}
        <div className="space-y-4">
          {/* Input de Atividade */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
            <ActivityFlow />
          </div>

          {/* Quick Stats */}
          <QuickStats
            activitiesCount={todayActivities.length}
            totalMinutes={totalMinutes}
            currentActivity={
              currentActivity
                ? {
                    title: currentActivity.title,
                    durationMinutes: currentActivity.durationMinutes || 0,
                    startedAt: currentActivity.startedAt,
                  }
                : null
            }
            byCategory={byCategory}
          />
        </div>

        {/* SEÇÕES EXPANSÍVEIS */}
        <CollapsibleSection
          title="📋 Atividades de Hoje"
          itemCount={todayActivities.length}
          defaultExpanded={true}
        >
          <TodayActivities />
        </CollapsibleSection>

        <CollapsibleSection title="💡 Insights" defaultExpanded={false}>
          <InsightsFeed />
        </CollapsibleSection>
      </div>

      {/* NAVEGAÇÃO INFERIOR FIXA */}
      <BottomNavigation
        onDashboardClick={() => setIsDashboardOpen(true)}
        onGoalsClick={() => setIsGoalsOpen(true)}
        onPatternsClick={() => setIsPatternsOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* MODAIS */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        stats={dashboardStats}
      />
      <GoalsModal isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} />
      <PatternsModal
        isOpen={isPatternsOpen}
        onClose={() => setIsPatternsOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
