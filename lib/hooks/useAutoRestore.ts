"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { importAllData } from "@/lib/db/indexeddb";
import { getAllFeedbacks } from "@/lib/db/queries";

export function useAutoRestore() {
  const { data: session } = useSession();
  const [hasBackupData, setHasBackupData] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Verificar se há dados de backup no Drive mais recentes
  const checkForBackup = async () => {
    if (!session?.accessToken) return;

    // Verificar se o usuário já rejeitou este backup específico
    const lastCheckedTimestamp = localStorage.getItem("lastBackupCheckDismissed");

    try {
      const response = await fetch("/api/drive/sync");
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.timestamp) {
          const cloudTimestamp = new Date(data.data.timestamp);
          
          // Se o usuário já dispensou este backup específico, não mostrar novamente
          if (lastCheckedTimestamp && new Date(lastCheckedTimestamp) >= cloudTimestamp) {
            console.log("⏭️ Backup já foi dispensado anteriormente");
            setHasBackupData(false);
            return;
          }

          // Obter a data mais recente dos dados locais
          const localFeedbacks = await getAllFeedbacks();
          const localLatest = localFeedbacks.length > 0 
            ? new Date(Math.max(...localFeedbacks.map(f => new Date(f.createdAt).getTime())))
            : new Date(0); // Se não há dados locais, considerar muito antigo

          // Mostrar prompt apenas se os dados da nuvem são mais recentes
          const shouldShow = cloudTimestamp > localLatest;
          console.log("🔍 Comparação de datas:", {
            cloudTimestamp: cloudTimestamp.toISOString(),
            localLatest: localLatest.toISOString(),
            shouldShow
          });
          setHasBackupData(shouldShow);
        } else {
          setHasBackupData(false);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar backup:", error);
    }
  };

  // Função para restaurar dados
  const performRestore = async () => {
    if (!session?.accessToken || isRestoring) return;

    setIsRestoring(true);
    try {
      const response = await fetch("/api/drive/sync");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          await importAllData(data.data);

          console.log("✅ Restauração automática realizada");
          setHasBackupData(false);

          // Recarregar a página para atualizar os dados
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("❌ Erro na restauração automática:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  // Verificar backup quando o usuário faz login
  useEffect(() => {
    if (session?.accessToken) {
      // Aguardar um pouco para garantir que a sessão está completamente carregada
      setTimeout(() => {
        checkForBackup();
      }, 2000);
    }
  }, [session?.accessToken]);

  return {
    hasBackupData,
    isRestoring,
    performRestore,
    checkForBackup,
  };
}