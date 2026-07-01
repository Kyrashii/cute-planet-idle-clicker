import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./Button";

describe("Button", () => {
  it("renders children and defaults to type=button", () => {
    render(<Button>Kaufen</Button>);
    const button = screen.getByRole("button", { name: "Kaufen" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Los</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Los" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Gesperrt
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Gesperrt" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies variant styling", () => {
    render(<Button variant="primary">Start</Button>);
    expect(screen.getByRole("button", { name: "Start" }).className).toContain("bg-linear-135");
  });

  it("merges a custom className", () => {
    render(<Button className="w-full">Breit</Button>);
    expect(screen.getByRole("button", { name: "Breit" }).className).toContain("w-full");
  });
});
