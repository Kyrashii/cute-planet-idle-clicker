import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDisplayPreferences } from "./useDisplayPreferences";

describe("useDisplayPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults low-memory off when no preference is stored", () => {
    const { result } = renderHook(() => useDisplayPreferences());
    expect(result.current.isLowMemory).toBe(false);
    expect(result.current.fontScale).toBe(100);
    // matchMedia is mocked to matches:false in the test setup.
    expect(result.current.disableAnimations).toBe(false);
  });

  it("reads the persisted low-memory preference on mount", () => {
    localStorage.setItem("cute_planet_low_memory", "true");
    localStorage.setItem("cute_planet_font_scale", "110");
    const { result } = renderHook(() => useDisplayPreferences());
    expect(result.current.isLowMemory).toBe(true);
    expect(result.current.fontScale).toBe(110);
    expect(result.current.disableAnimations).toBe(true);
  });

  it("persists the toggle and derives disableAnimations from it", () => {
    const { result } = renderHook(() => useDisplayPreferences());

    act(() => result.current.setIsLowMemory(true));

    expect(result.current.isLowMemory).toBe(true);
    expect(result.current.disableAnimations).toBe(true);
    expect(localStorage.getItem("cute_planet_low_memory")).toBe("true");
  });

  it("persists the selected font scale across remounts", () => {
    const { result, unmount } = renderHook(() => useDisplayPreferences());

    act(() => result.current.setFontScale(120));

    expect(result.current.fontScale).toBe(120);
    expect(localStorage.getItem("cute_planet_font_scale")).toBe("120");

    unmount();

    const remounted = renderHook(() => useDisplayPreferences());
    expect(remounted.result.current.fontScale).toBe(120);
  });
});
