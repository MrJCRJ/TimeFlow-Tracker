/**
 * EmptyState Component Tests
 */

import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders icon and title", () => {
    render(<EmptyState icon="🎯" title="No data" />);
    expect(screen.getByText("🎯")).toBeInTheDocument();
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(
      <EmptyState 
        icon="📝" 
        title="Empty" 
        description="Add your first item" 
      />
    );
    expect(screen.getByText("Add your first item")).toBeInTheDocument();
  });

  it("renders with action button", () => {
    render(
      <EmptyState 
        icon="➕" 
        title="Empty" 
        action={<button>Create New</button>}
      />
    );
    expect(screen.getByText("Create New")).toBeInTheDocument();
  });

  it("applies small size", () => {
    const { container } = render(
      <EmptyState icon="🎯" title="Small" size="sm" />
    );
    expect(container.querySelector(".text-3xl")).toBeInTheDocument();
  });

  it("applies medium size by default", () => {
    const { container } = render(
      <EmptyState icon="🎯" title="Medium" />
    );
    expect(container.querySelector(".text-5xl")).toBeInTheDocument();
  });

  it("applies large size", () => {
    const { container } = render(
      <EmptyState icon="🎯" title="Large" size="lg" />
    );
    expect(container.querySelector(".text-6xl")).toBeInTheDocument();
  });
});
