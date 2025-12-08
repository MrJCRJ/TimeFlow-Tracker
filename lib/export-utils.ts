/**
 * Utilitários para Export de dados
 */

import { exportAllData } from "@/lib/db/indexeddb";

export async function exportDataToFile(): Promise<void> {
  // Exporta TODOS os dados do IndexedDB
  const exportData = await exportAllData();

  // Cria arquivo para download
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timeflow-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
