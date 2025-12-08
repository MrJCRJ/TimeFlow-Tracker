/**
 * IndexedDB - Facade Principal
 * Re-exporta tudo de forma organizada para compatibilidade
 */

// Re-exporta tipos e database
export { db } from "./database";
export type {
  Activity,
  Feedback,
  PendingInput,
  ResponseCache,
} from "./database";

// Re-exporta queries
export {
  getAllActivities,
  getTodayActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  getOngoingActivity,
  endOngoingActivity,
  startNewActivity,
  getAllFeedbacks,
  addFeedback,
  addPendingInput,
  getPendingInputs,
  markPendingAsProcessed,
  deletePendingInput,
  clearAllData,
} from "./queries";

// Re-exporta import/export
export { exportAllData, importAllData } from "./import-export";
