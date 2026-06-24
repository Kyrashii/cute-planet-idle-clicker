import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheatEventModal } from "./CheatEventModal";

describe("CheatEventModal", () => {
  it("sets the planet level without closing the modal", async () => {
    const user = userEvent.setup();
    const onSetPlanetLevel = vi.fn();
    const onClose = vi.fn();

    render(
      <CheatEventModal
        isOpen
        currentPlanetLevel={4}
        onSetPlanetLevel={onSetPlanetLevel}
        onSelectEvent={vi.fn()}
        onClose={onClose}
      />,
    );

    const input = screen.getByLabelText(/Planetenlevel direkt setzen/i);
    await user.clear(input);
    await user.type(input, "17");
    await user.click(screen.getByRole("button", { name: "Setzen" }));

    expect(onSetPlanetLevel).toHaveBeenCalledWith(17);
    expect(onClose).not.toHaveBeenCalled();
  });
});
