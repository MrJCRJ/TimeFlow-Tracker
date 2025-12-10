"use client";

import { useAutoBackup } from "@/lib/hooks/useAutoBackup";
import ToastNotification from "@/components/ToastNotification";

export default function AutoBackupManager() {
  const { showNotification } = useAutoBackup();

  return (
    <ToastNotification
      message="Backup automático realizado com sucesso!"
      isVisible={showNotification}
      onClose={() => {}}
    />
  );
}