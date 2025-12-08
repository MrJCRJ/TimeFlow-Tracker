/**
 * Utilitários para Import de dados
 */

import { importAllData } from "@/lib/db/indexeddb";

export async function importDataFromFile(): Promise<{
  activitiesCount: number;
  feedbacksCount: number;
}> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("Nenhum arquivo selecionado"));
        return;
      }

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.version || !importData.data) {
          throw new Error(
            "Formato de arquivo inválido. Use um arquivo exportado pelo TimeFlow."
          );
        }

        // Importa dados diretamente no IndexedDB
        await importAllData(importData.data);

        const activitiesCount = importData.data.activities?.length || 0;
        const feedbacksCount = importData.data.feedbacks?.length || 0;

        resolve({ activitiesCount, feedbacksCount });
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}
