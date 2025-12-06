import ActivityFlow from "@/components/ActivityFlow";
import TodayActivities from "@/components/TodayActivities";
import InsightsFeed from "@/components/InsightsFeed";
import SetupWarning from "@/components/SetupWarning";
import DayFeedback from "@/components/DayFeedback";
import PendingQueueMonitor from "@/components/PendingQueueMonitor";
import AutoAnalyzer from "@/components/AutoAnalyzer";
import DataManager from "@/components/DataManager";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SetupWarning />
      <PendingQueueMonitor />
      <AutoAnalyzer />
      <DataManager />

      {/* Header fixo com campo de input */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            TimeFlow Tracker
          </h1>
          <ActivityFlow />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        <DayFeedback />
        <TodayActivities />

        <div className="border-t border-gray-200 pt-8">
          <InsightsFeed />
        </div>
      </div>
    </main>
  );
}
