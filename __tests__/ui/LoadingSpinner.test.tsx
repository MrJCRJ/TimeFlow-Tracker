/**
 * LoadingSpinner Component Tests
 */

import { render, screen } from "@testing-library/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders without message", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders with message", () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("applies small size", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector(".w-4");
    expect(spinner).toBeInTheDocument();
  });

  it("applies medium size by default", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".w-8");
    expect(spinner).toBeInTheDocument();
  });

  it("applies large size", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector(".w-12");
    expect(spinner).toBeInTheDocument();
  });

  it("applies blue color by default", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".border-blue-500");
    expect(spinner).toBeInTheDocument();
  });

  it("applies white color", () => {
    const { container } = render(<LoadingSpinner color="white" />);
    const spinner = container.querySelector(".border-white");
    expect(spinner).toBeInTheDocument();
  });
});
