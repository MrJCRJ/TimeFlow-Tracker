/**
 * ProgressBar Component Tests
 */

import { render, screen } from "@testing-library/react";
import ProgressBar from "@/components/ui/ProgressBar";

describe("ProgressBar", () => {
  it("calculates percentage correctly", () => {
    render(<ProgressBar current={5} total={10} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows current and total when showLabel is true", () => {
    render(<ProgressBar current={3} total={10} showLabel={true} />);
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("hides label when showLabel is false", () => {
    render(<ProgressBar current={3} total={10} showLabel={false} />);
    expect(screen.queryByText("3/10")).not.toBeInTheDocument();
  });

  it("handles zero total", () => {
    render(<ProgressBar current={0} total={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("handles 100% completion", () => {
    render(<ProgressBar current={10} total={10} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("applies gradient color by default", () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    expect(container.querySelector(".bg-gradient-to-r")).toBeInTheDocument();
  });

  it("applies blue color", () => {
    const { container } = render(
      <ProgressBar current={5} total={10} color="blue" />
    );
    expect(container.querySelector(".bg-blue-500")).toBeInTheDocument();
  });

  it("applies medium size by default", () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    expect(container.querySelector(".h-2")).toBeInTheDocument();
  });

  it("applies small size", () => {
    const { container } = render(
      <ProgressBar current={5} total={10} size="sm" />
    );
    expect(container.querySelector(".h-1\\.5")).toBeInTheDocument();
  });
});
