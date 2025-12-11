/**
 * Button Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  it("shows loading state", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText("Carregando...")).toBeTruthy();
  });

  it("renders with icon", () => {
    render(<Button icon="✨">With Icon</Button>);
    expect(screen.getByText("✨")).toBeTruthy();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("is disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});
