"use client";

import { useEffect, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/db/database";
import { useLiveQuery } from "dexie-react-hooks";

export function useAutoBackup() {
  const { data: session } = useSession();
  const [showNotification, setShowNotification] = useState(false);

  // Monitorar mudanças nas atividades
  const activities = useLiveQuery(() => db.activities.toArray());
  const feedbacks = useLiveQuery(() => db.feedbacks.toArray());

  // Função para fazer backup
  const performBackup = useCallback(async () => {
    if (!session?.accessToken || !activities || !feedbacks) return;

    try {
      // Verificar se há dados para fazer backup
      if (activities.length === 0 && feedbacks.length === 0) return;

      const response = await fetch("/api/drive/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activities,
          feedbacks,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backup automático realizado:", data.fileId);

        // Salvar timestamp do último backup
        localStorage.setItem("lastAutoBackup", new Date().toISOString());

        // Mostrar notificação
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        console.warn("⚠️ Falha no backup automático");
      }
    } catch (error) {
      console.error("❌ Erro no backup automático:", error);
    }
  }, [session?.accessToken, activities, feedbacks]);

  // Efeito para backup automático quando há mudanças
  useEffect(() => {
    if (!session?.accessToken) return;

    // Verificar se já fez backup recentemente (nos últimos 5 minutos)
    const lastBackup = localStorage.getItem("lastAutoBackup");
    if (lastBackup) {
      const timeSinceLastBackup = Date.now() - new Date(lastBackup).getTime();
      if (timeSinceLastBackup < 5 * 60 * 1000) { // 5 minutos
        return; // Não fazer backup ainda
      }
    }

    // Aguardar 2 segundos antes de fazer backup (para evitar backups excessivos)
    const timeoutId = setTimeout(() => {
      performBackup();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [activities, feedbacks, session?.accessToken, performBackup]);

  return { performBackup, showNotification };
}