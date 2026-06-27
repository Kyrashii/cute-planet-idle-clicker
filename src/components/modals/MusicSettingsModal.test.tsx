import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MusicSettingsModal } from "./MusicSettingsModal";

vi.mock("../../utils/audio", () => ({
  MUSIC_STYLES: [
    {
      id: "classic",
      name: "Classic",
      description: "Soft and warm.",
      emoji: "🌙",
    },
  ],
  setMusicStyle: vi.fn(),
  playPop: vi.fn(),
}));

describe("MusicSettingsModal", () => {
  it("marks the active font scale and updates it on click", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [fontScale, setFontScale] = useState<90 | 95 | 100 | 110 | 120>(100);

      useEffect(() => {
        document.documentElement.style.fontSize = `${fontScale}%`;
        return () => {
          document.documentElement.style.fontSize = "";
        };
      }, [fontScale]);

      return (
        <MusicSettingsModal
          isOpen
          onClose={vi.fn()}
          isNight
          musicStyleState="classic"
          setMusicStyleState={vi.fn()}
          isLowMemory={false}
          setIsLowMemory={vi.fn()}
          fontScale={fontScale}
          setFontScale={setFontScale}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByRole("button", { name: /standard 100%/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.documentElement.style.fontSize).toBe("100%");

    await user.click(screen.getByRole("button", { name: /120% groesser/i }));

    expect(screen.getByRole("button", { name: /120% groesser/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.documentElement.style.fontSize).toBe("120%");
  });
});
