/**
 * Testes de Integração - QuickStats Component
 * Testa exibição de estatísticas em uma linha
 */

import { render, screen } from "@testing-library/react";
import QuickStats from "@/components/QuickStats";

describe("QuickStats - Integração", () => {
  it("deve renderizar com dados vazios", () => {
    render(
      <QuickStats activitiesCount={0} totalMinutes={0} currentActivity={null} />
    );

    expect(screen.getByText("Atividades")).toBeInTheDocument();
    expect(screen.getByText("0", { selector: ".text-xl" })).toBeInTheDocument();
    expect(screen.getByText(/0h 0min/i)).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma atividade/i)).toBeInTheDocument();
  });

  it("deve exibir estatísticas do dia corretamente", () => {
    render(
      <QuickStats
        activitiesCount={5}
        totalMinutes={180}
        currentActivity={null}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/3h 0min/i)).toBeInTheDocument();
  });

  it("deve exibir atividade em andamento", () => {
    render(
      <QuickStats
        activitiesCount={3}
        totalMinutes={120}
        currentActivity={{
          title: "Trabalhando no projeto",
          durationMinutes: 45,
        }}
      />
    );

    expect(screen.getByText(/Trabalhando no projeto/i)).toBeInTheDocument();
    expect(screen.getByText(/45min/i)).toBeInTheDocument();
  });

  it("deve converter minutos em horas corretamente", () => {
    render(
      <QuickStats
        activitiesCount={10}
        totalMinutes={245}
        currentActivity={null}
      />
    );

    // 245min = 4h 5min
    expect(screen.getByText(/4h 5min/i)).toBeInTheDocument();
  });

  it("deve truncar título longo da atividade", () => {
    render(
      <QuickStats
        activitiesCount={1}
        totalMinutes={30}
        currentActivity={{
          title:
            "Esta é uma atividade com um título muito muito muito longo que precisa ser truncado",
          durationMinutes: 30,
        }}
      />
    );

    const activityText = screen.getByText(/Esta é uma atividade/i);
    expect(activityText.textContent?.length).toBeLessThan(100);
  });

  it("deve exibir ícones corretos para cada seção", () => {
    const { container } = render(
      <QuickStats
        activitiesCount={2}
        totalMinutes={60}
        currentActivity={{
          title: "Teste",
          durationMinutes: 15,
        }}
      />
    );

    // Verifica se tem pelo menos 2 emojis/ícones
    const text = container.textContent || "";
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    expect(emojiCount).toBeGreaterThanOrEqual(2);
  });

  it("deve ser responsivo em mobile (270px altura)", () => {
    const { container } = render(
      <QuickStats
        activitiesCount={5}
        totalMinutes={180}
        currentActivity={{
          title: "Estudando React",
          durationMinutes: 60,
        }}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("h-[270px]");
  });

  it("deve manter layout visível sempre", () => {
    const { container } = render(
      <QuickStats activitiesCount={0} totalMinutes={0} currentActivity={null} />
    );

    // Verifica que não tem display: none
    const wrapper = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(wrapper);
    expect(styles.display).not.toBe("none");
  });
});
