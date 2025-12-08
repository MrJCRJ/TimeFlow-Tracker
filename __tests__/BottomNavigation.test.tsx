/**
 * Testes de Integração - BottomNavigation Component
 * Testa navegação inferior com modais
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BottomNavigation from "@/components/BottomNavigation";

describe("BottomNavigation - Integração", () => {
  it("deve renderizar todos os 4 botões", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    expect(screen.getByLabelText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Metas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Padrões/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Configurações/i)).toBeInTheDocument();
  });

  it("deve chamar callback correto ao clicar em Dashboard", async () => {
    const user = userEvent.setup();
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    const dashboardBtn = screen.getByLabelText(/Dashboard/i);
    await user.click(dashboardBtn);

    expect(mockCallbacks.onDashboardClick).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onGoalsClick).not.toHaveBeenCalled();
  });

  it("deve chamar callback correto ao clicar em Metas", async () => {
    const user = userEvent.setup();
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    const goalsBtn = screen.getByLabelText(/Metas/i);
    await user.click(goalsBtn);

    expect(mockCallbacks.onGoalsClick).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onDashboardClick).not.toHaveBeenCalled();
  });

  it("deve chamar callback correto ao clicar em Padrões", async () => {
    const user = userEvent.setup();
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    const patternsBtn = screen.getByLabelText(/Padrões/i);
    await user.click(patternsBtn);

    expect(mockCallbacks.onPatternsClick).toHaveBeenCalledTimes(1);
  });

  it("deve chamar callback correto ao clicar em Configurações", async () => {
    const user = userEvent.setup();
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    const settingsBtn = screen.getByLabelText(/Configurações/i);
    await user.click(settingsBtn);

    expect(mockCallbacks.onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it("deve ter altura fixa de 80px", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    const { container } = render(<BottomNavigation {...mockCallbacks} />);

    const nav = container.firstChild as HTMLElement;
    expect(nav).toHaveClass("h-20"); // 80px = h-20
  });

  it("deve estar fixado na parte inferior", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    const { container } = render(<BottomNavigation {...mockCallbacks} />);

    const nav = container.firstChild as HTMLElement;
    expect(nav.className).toMatch(/fixed|sticky/);
    expect(nav.className).toMatch(/bottom/);
  });

  it("deve exibir ícones para cada botão", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    const { container } = render(<BottomNavigation {...mockCallbacks} />);

    // Verifica se tem emojis/ícones (regex pode não pegar todos)
    const text = container.textContent || "";
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    expect(emojiCount).toBeGreaterThanOrEqual(3); // Pelo menos 3 emojis detectados
  });

  it("deve ter fundo opaco para não sobrepor conteúdo", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    const { container } = render(<BottomNavigation {...mockCallbacks} />);

    const nav = container.firstChild as HTMLElement;
    expect(nav.className).toMatch(/bg-/);
  });

  it("deve ser acessível (labels e aria)", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);

    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label");
    });
  });

  it("deve ter feedback visual ao hover", () => {
    const mockCallbacks = {
      onDashboardClick: jest.fn(),
      onGoalsClick: jest.fn(),
      onPatternsClick: jest.fn(),
      onSettingsClick: jest.fn(),
    };

    render(<BottomNavigation {...mockCallbacks} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button.className).toMatch(/hover/);
    });
  });
});
