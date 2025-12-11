/**
 * StatCard Component Tests
 */

import { render, screen } from "@testing-library/react";
import StatCard from "@/components/ui/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total" value={42} color="blue" />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string values", () => {
    render(<StatCard label="Status" value="Active" color="green" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies blue gradient", () => {
    const { container } = render(
      <StatCard label="Test" value={10} color="blue" />
    );
    expect(container.querySelector(".from-blue-50")).toBeInTheDocument();
  });

  it("applies green gradient", () => {
    const { container } = render(
      <StatCard label="Test" value={10} color="green" />
    );
    expect(container.querySelector(".from-green-50")).toBeInTheDocument();
  });

  it("applies purple gradient", () => {
    const { container } = render(
      <StatCard label="Test" value={10} color="purple" />
    );
    expect(container.querySelector(".from-purple-50")).toBeInTheDocument();
  });

  it("applies medium size by default", () => {
    const { container } = render(
      <StatCard label="Test" value={10} color="blue" />
    );
    expect(container.querySelector(".text-3xl")).toBeInTheDocument();
  });

  it("applies small size", () => {
    const { container } = render(
      <StatCard label="Test" value={10} color="blue" size="sm" />
    );
    expect(container.querySelector(".text-2xl")).toBeInTheDocument();
  });
});
