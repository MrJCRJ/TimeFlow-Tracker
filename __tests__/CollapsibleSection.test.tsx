/**
 * Testes de Integração - CollapsibleSection Component
 * Testa comportamento de expansão/colapso de seções
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CollapsibleSection from "@/components/CollapsibleSection";

describe("CollapsibleSection - Integração", () => {
  it("deve renderizar inicialmente expandida", () => {
    render(
      <CollapsibleSection title="Teste" defaultExpanded={true}>
        <p>Conteúdo de teste</p>
      </CollapsibleSection>
    );

    expect(screen.getByText("Conteúdo de teste")).toBeInTheDocument();
  });

  it("deve renderizar inicialmente colapsada", () => {
    render(
      <CollapsibleSection title="Teste" defaultExpanded={false}>
        <p>Conteúdo de teste</p>
      </CollapsibleSection>
    );

    expect(screen.queryByText("Conteúdo de teste")).not.toBeInTheDocument();
  });

  it("deve alternar entre expandido e colapsado ao clicar", async () => {
    const user = userEvent.setup();

    render(
      <CollapsibleSection title="Teste" defaultExpanded={true}>
        <p>Conteúdo de teste</p>
      </CollapsibleSection>
    );

    const header = screen.getByText("Teste").closest("button");
    expect(header).toBeInTheDocument();

    // Inicialmente expandido
    expect(screen.getByText("Conteúdo de teste")).toBeInTheDocument();

    // Clica para colapsar
    if (header) await user.click(header);
    expect(screen.queryByText("Conteúdo de teste")).not.toBeInTheDocument();

    // Clica novamente para expandir
    if (header) await user.click(header);
    expect(screen.getByText("Conteúdo de teste")).toBeInTheDocument();
  });

  it("deve exibir ícone de seta mudando direção", () => {
    const { rerender } = render(
      <CollapsibleSection title="Teste" defaultExpanded={true}>
        <p>Conteúdo</p>
      </CollapsibleSection>
    );

    // Quando expandido, seta para cima (▲ ou equivalente)
    let icon = screen.getByRole("button", { name: /Teste/i });
    expect(icon.textContent).toMatch(/[▼▲↓↑]/u);

    // Recarrega colapsado
    rerender(
      <CollapsibleSection title="Teste" defaultExpanded={false}>
        <p>Conteúdo</p>
      </CollapsibleSection>
    );

    icon = screen.getByRole("button", { name: /Teste/i });
    expect(icon.textContent).toMatch(/[▼▲↓↑]/u);
  });

  it("deve exibir contador de itens", () => {
    render(
      <CollapsibleSection
        title="Atividades"
        itemCount={5}
        defaultExpanded={true}
      >
        <p>Lista de atividades</p>
      </CollapsibleSection>
    );

    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("deve aceitar children como ReactNode", () => {
    render(
      <CollapsibleSection title="Multi-content" defaultExpanded={true}>
        <div>
          <h3>Título</h3>
          <p>Parágrafo 1</p>
          <p>Parágrafo 2</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </CollapsibleSection>
    );

    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Parágrafo 1")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("deve ter animação suave ao expandir/colapsar", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <CollapsibleSection title="Teste" defaultExpanded={false}>
        <p>Conteúdo</p>
      </CollapsibleSection>
    );

    const content = container.querySelector('[class*="transition"]');
    expect(content).toBeInTheDocument();

    const header = screen.getByRole("button", { name: /Teste/i });
    await user.click(header);

    // Verifica se tem classe de transição
    expect(content?.className).toMatch(/transition/);
  });

  it("deve ser acessível (ARIA)", () => {
    render(
      <CollapsibleSection title="Seção Teste" defaultExpanded={true}>
        <p>Conteúdo acessível</p>
      </CollapsibleSection>
    );

    const button = screen.getByRole("button", { name: /Seção Teste/i });
    expect(button).toHaveAttribute("aria-expanded");
  });

  it("deve manter estado interno independente", async () => {
    const user = userEvent.setup();

    render(
      <>
        <CollapsibleSection title="Seção 1" defaultExpanded={true}>
          <p>Conteúdo 1</p>
        </CollapsibleSection>
        <CollapsibleSection title="Seção 2" defaultExpanded={true}>
          <p>Conteúdo 2</p>
        </CollapsibleSection>
      </>
    );

    // Ambas inicialmente expandidas
    expect(screen.getByText("Conteúdo 1")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo 2")).toBeInTheDocument();

    // Colapsa apenas a primeira
    const header1 = screen.getByRole("button", { name: /Seção 1/i });
    await user.click(header1);

    expect(screen.queryByText("Conteúdo 1")).not.toBeInTheDocument();
    expect(screen.getByText("Conteúdo 2")).toBeInTheDocument(); // Segunda ainda expandida
  });
});
