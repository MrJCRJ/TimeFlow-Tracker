import ActivityFlow from "@/components/ActivityFlow";
import TodayActivities from "@/components/TodayActivities";
import InsightsFeed from "@/components/InsightsFeed";
import SetupWarning from "@/components/SetupWarning";
import DayFeedback from "@/components/DayFeedback";
import PendingQueueMonitor from "@/components/PendingQueueMonitor";
import AutoAnalyzer from "@/components/AutoAnalyzer";
import ManualAnalyzer from "@/components/ManualAnalyzer";
import HistoryViewer from "@/components/HistoryViewer";
import DataManager from "@/components/DataManager";

// Force rebuild - v3
export default function HomePage() {
  return (
    <main className="min-h-screen pb-20">
      <SetupWarning />
      <PendingQueueMonitor />
      <AutoAnalyzer />
      <ManualAnalyzer />
      <HistoryViewer />
      <DataManager />

      {/* Header fixo com campo de input */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            TimeFlow Tracker
          </h1>
          <ActivityFlow />
        </div>
      </div>

      {/* Conteúdo com padding para mobile */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        <DayFeedback />
        <TodayActivities />

        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <InsightsFeed />
        </div>
      </div>
    </main>
  );
}
