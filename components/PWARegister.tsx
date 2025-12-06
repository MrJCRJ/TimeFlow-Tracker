"use client";

import { useEffect, useRef, useState } from "react";

export default function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const waitingWorker = useRef<ServiceWorker | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado:", registration);
          registrationRef.current = registration;

          if (registration.waiting) {
            // Já existe um service worker esperando para ativar
            waitingWorker.current = registration.waiting;
            setUpdateAvailable(true);
          }

          // Detecta novas instalações (updatefound)
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // Nova versão pronta para ativação
                  waitingWorker.current = registration.waiting;
                  setUpdateAvailable(true);
                }
              }
            });
          });
        })
        .catch((error) => {
          console.log("Erro ao registrar Service Worker:", error);
        });

      // Quando o novo SW assumir o controle da página, recarregue
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controllerchange - recarregando");
        window.location.reload();
      });
    }

    // Agenda análise diária às 23:59
    const scheduleDaily = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        0,
        0
      );

      // Se já passou das 23:59, agenda para amanhã
      if (now > night) {
        night.setDate(night.getDate() + 1);
      }

      const timeUntilNight = night.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          console.log("Análise diária executada automaticamente");

          // Reagenda para o próximo dia
          scheduleDaily();
        } catch (error) {
          console.error("Erro na análise automática:", error);
        }
      }, timeUntilNight);

      console.log(
        `Próxima análise agendada para ${night.toLocaleString("pt-BR")}`
      );
    };

    scheduleDaily();
  }, []);

  const applyUpdate = async () => {
    try {
      if (waitingWorker.current && registrationRef.current) {
        // Envia mensagem ao worker para pular waiting
        waitingWorker.current.postMessage({ type: "SKIP_WAITING" });
      }
    } catch (error) {
      console.error("Erro ao aplicar atualização:", error);
    }
  };

  return (
    <>
      {updateAvailable && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white rounded-full px-3 py-2 shadow-lg flex items-center gap-3">
          <div className="text-sm font-medium">Nova versão disponível</div>
          <button
            className="bg-white text-blue-600 rounded-md px-2 py-1 text-xs font-semibold"
            onClick={applyUpdate}
          >
            Atualizar
          </button>
          <button
            className="bg-transparent text-white text-xs px-2 py-1"
            onClick={() => setUpdateAvailable(false)}
          >
            Ignorar
          </button>
        </div>
      )}
    </>
  );
}
