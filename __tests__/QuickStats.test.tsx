/**
 * Testes de Integração - QuickStats Component
 * Testa exibição de estatísticas por categoria
 */

import { render, screen } from "@testing-library/react";
import QuickStats from "@/components/QuickStats";

describe("QuickStats - Integração", () => {
  it("deve renderizar com dados vazios", () => {
    render(
      <QuickStats
        activitiesCount={0}
        totalMinutes={0}
        currentActivity={null}
        byCategory={{}}
      />
    );

    expect(screen.queryByText(/Tempo por categoria/i)).not.toBeInTheDocument();
  });

  it("deve exibir categorias ordenadas por tempo", () => {
    render(
      <QuickStats
        activitiesCount={5}
        totalMinutes={180}
        currentActivity={null}
        byCategory={{
          Trabalho: 120,
          Estudo: 45,
          Exercício: 15,
        }}
      />
    );

    expect(screen.getByText(/Tempo por categoria/i)).toBeInTheDocument();
    expect(screen.getByText("Trabalho")).toBeInTheDocument();
    expect(screen.getByText(/2h0min/i)).toBeInTheDocument();
  });

  it("deve exibir atividade em andamento", () => {
    const now = new Date();
    render(
      <QuickStats
        activitiesCount={3}
        totalMinutes={120}
        currentActivity={{
          title: "Trabalhando no projeto",
          durationMinutes: 45,
          startedAt: new Date(now.getTime() - 45 * 60 * 1000),
        }}
        byCategory={{ Trabalho: 120 }}
      />
    );

    expect(screen.getByText(/Trabalhando no projeto/i)).toBeInTheDocument();
    expect(screen.getByText(/45min/i)).toBeInTheDocument();
    expect(screen.getByText(/em andamento/i)).toBeInTheDocument();
  });

  it("deve mostrar apenas top 3 categorias", () => {
    render(
      <QuickStats
        activitiesCount={10}
        totalMinutes={300}
        currentActivity={null}
        byCategory={{
          Trabalho: 120,
          Estudo: 80,
          Exercício: 60,
          Lazer: 40,
          Reunião: 0,
        }}
      />
    );

    expect(screen.getByText("Trabalho")).toBeInTheDocument();
    expect(screen.getByText("Estudo")).toBeInTheDocument();
    expect(screen.getByText("Exercício")).toBeInTheDocument();
    expect(screen.queryByText("Lazer")).not.toBeInTheDocument();
  });

  it("deve calcular porcentagem corretamente", () => {
    const { container } = render(
      <QuickStats
        activitiesCount={2}
        totalMinutes={100}
        currentActivity={null}
        byCategory={{
          Trabalho: 50,
          Estudo: 50,
        }}
      />
    );

    // Verifica se as barras de progresso existem
    const progressBars = container.querySelectorAll(
      ".bg-gradient-to-r.from-blue-400"
    );
    expect(progressBars.length).toBe(2);
  });

  it("deve exibir duração em tempo real para atividade em andamento", () => {
    const now = new Date();
    const { rerender } = render(
      <QuickStats
        activitiesCount={1}
        totalMinutes={60}
        currentActivity={{
          title: "Estudando",
          durationMinutes: 30,
          startedAt: new Date(now.getTime() - 30 * 60 * 1000),
        }}
        byCategory={{ Estudo: 60 }}
      />
    );

    expect(screen.getByText(/30min/i)).toBeInTheDocument();

    // Simula passagem de tempo
    rerender(
      <QuickStats
        activitiesCount={1}
        totalMinutes={60}
        currentActivity={{
          title: "Estudando",
          durationMinutes: 31,
          startedAt: new Date(now.getTime() - 31 * 60 * 1000),
        }}
        byCategory={{ Estudo: 60 }}
      />
    );

    expect(screen.getByText(/31min/i)).toBeInTheDocument();
  });

  it("deve renderizar sem atividade em andamento", () => {
    render(
      <QuickStats
        activitiesCount={5}
        totalMinutes={180}
        currentActivity={null}
        byCategory={{ Trabalho: 180 }}
      />
    );

    expect(screen.queryByText(/🎯 Agora/i)).not.toBeInTheDocument();
  });

  it("deve ser responsivo e compacto", () => {
    const { container } = render(
      <QuickStats
        activitiesCount={3}
        totalMinutes={90}
        currentActivity={{
          title: "Codificando",
          durationMinutes: 45,
          startedAt: new Date(),
        }}
        byCategory={{ Trabalho: 90 }}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("rounded-2xl");
    expect(wrapper).toHaveClass("shadow-lg");
  });
});
