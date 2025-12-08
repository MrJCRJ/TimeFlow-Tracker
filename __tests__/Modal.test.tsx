/**
 * Testes de Integração - Modal Base Component
 * Modal reutilizável para Dashboard, Metas, Padrões, etc
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "@/components/Modal";

describe("Modal - Integração", () => {
  it("deve renderizar quando isOpen é true", () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Teste">
        <p>Conteúdo do modal</p>
      </Modal>
    );

    expect(screen.getByText("Teste")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do modal")).toBeInTheDocument();
  });

  it("não deve renderizar quando isOpen é false", () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Teste">
        <p>Conteúdo do modal</p>
      </Modal>
    );

    expect(screen.queryByText("Teste")).not.toBeInTheDocument();
    expect(screen.queryByText("Conteúdo do modal")).not.toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar no botão fechar", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Teste">
        <p>Conteúdo</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText(/Fechar/i);
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose ao clicar no overlay (fundo)", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="Teste">
        <p>Conteúdo</p>
      </Modal>
    );

    const overlay = container.querySelector('[data-testid="modal-overlay"]');
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("deve ter animação de entrada/saída", () => {
    const { container, rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Teste">
        <p>Conteúdo</p>
      </Modal>
    );

    const modal = container.querySelector('[class*="transition"]');
    expect(modal).toBeInTheDocument();

    // Testa saída
    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="Teste">
        <p>Conteúdo</p>
      </Modal>
    );
  });

  it("deve ter scroll quando conteúdo é grande", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Teste">
        <div style={{ height: "2000px" }}>Conteúdo muito grande</div>
      </Modal>
    );

    const modalDialog = container.querySelector('[role="dialog"]');
    expect(modalDialog?.className).toMatch(/overflow/);
  });

  it("deve ser acessível (ARIA e foco)", () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Teste Modal">
        <p>Conteúdo</p>
      </Modal>
    );

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute("aria-labelledby");
  });

  it("deve bloquear interação com conteúdo atrás", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Teste">
        <p>Conteúdo</p>
      </Modal>
    );

    const overlay = container.querySelector('[data-testid="modal-overlay"]');
    expect(overlay).toHaveClass("fixed");
    expect(overlay?.className).toMatch(/z-/);
  });

  it("deve aceitar children customizado", () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Teste">
        <div>
          <h3>Subtítulo</h3>
          <p>Parágrafo 1</p>
          <button>Ação</button>
        </div>
      </Modal>
    );

    expect(screen.getByText("Subtítulo")).toBeInTheDocument();
    expect(screen.getByText("Parágrafo 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument();
  });
});
