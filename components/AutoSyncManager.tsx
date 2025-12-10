"use client";

import { useState, useEffect } from "react";
import { useAutoBackup } from "@/lib/hooks/useAutoBackup";
import { useAutoRestore } from "@/lib/hooks/useAutoRestore";

export default function AutoSyncManager() {
  const { performBackup } = useAutoBackup();
  const { hasBackupData, isRestoring, performRestore } = useAutoRestore();
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Mostrar prompt de restauração quando há dados de backup
  useEffect(() => {
    if (hasBackupData && !isRestoring) {
      setShowRestorePrompt(true);
    }
  }, [hasBackupData, isRestoring]);

  const handleRestore = async () => {
    setShowRestorePrompt(false);
    await performRestore();
  };

  const handleSkipRestore = () => {
    setShowRestorePrompt(false);
    // Salvar timestamp do backup dispensado para não mostrar novamente
    const now = new Date().toISOString();
    localStorage.setItem("lastBackupCheckDismissed", now);
    console.log("⏭️ Backup dispensado em:", now);
  };

  if (!showRestorePrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔄 Dados encontrados na nuvem
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Encontramos dados de backup no Google Drive. Deseja restaurá-los para este dispositivo?
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isRestoring ? "🔄 Restaurando..." : "✅ Sim, restaurar"}
          </button>
          <button
            onClick={handleSkipRestore}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ❌ Não, obrigado
          </button>
        </div>
      </div>
    </div>
  );
}