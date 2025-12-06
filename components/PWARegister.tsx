"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado:", registration);
        })
        .catch((error) => {
          console.log("Erro ao registrar Service Worker:", error);
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

  return null;
}
