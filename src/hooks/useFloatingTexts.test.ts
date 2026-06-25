import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFloatingTexts } from "./useFloatingTexts";
import type { FloatingText } from "../types";

const makeText = (
  id: number,
  createdAt: number,
  type: FloatingText["type"] = "click",
): FloatingText => ({
  id,
  x: 0,
  y: 0,
  text: "+1",
  type,
  createdAt,
});

async function wait(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

describe("useFloatingTexts", () => {
  it("starts empty and exposes a monotonically increasing id ref", () => {
    const { result } = renderHook(() => useFloatingTexts());
    expect(result.current.floatingTexts).toEqual([]);
    expect(result.current.nextParticleId.current).toBe(1);
  });

  it("prunes expired particles on the sweep (1.2s for normal, 4s for level)", async () => {
    const { result } = renderHook(() => useFloatingTexts());
    const now = Date.now();

    act(() => {
      result.current.setFloatingTexts([
        makeText(1, now - 1000, "click"),
        makeText(2, now - 1000, "level"),
      ]);
    });

    await wait(350);
    expect(result.current.floatingTexts.map((text) => text.id)).toEqual([2]);

    await wait(3100);
    expect(result.current.floatingTexts).toEqual([]);
  });

  it("clears the sweep interval on unmount", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => useFloatingTexts());
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
