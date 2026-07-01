import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "./Tabs";

const items = [
  { id: "all", label: "Alle" },
  { id: "owned", label: "Besitz" },
  { id: "rare", label: "Selten" },
] as const;

describe("Tabs", () => {
  it("marks the active tab as selected", () => {
    render(<Tabs items={items} value="owned" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Besitz" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Alle" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange on click", async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Selten" }));
    expect(onChange).toHaveBeenCalledWith("rare");
  });

  it("moves selection with arrow keys and wraps around", async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="all" onChange={onChange} />);
    const first = screen.getByRole("tab", { name: "Alle" });

    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("owned");

    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("rare");

    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("all");

    first.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith("rare");
  });

  it("keeps only the active tab in the tab order", () => {
    render(<Tabs items={items} value="owned" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Besitz" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Alle" })).toHaveAttribute("tabindex", "-1");
  });
});
