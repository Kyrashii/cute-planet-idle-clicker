import { beforeEach, describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { TUTORIAL_SEEN_KEY, useModalState } from "./useModalState";

describe("useModalState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults the tutorial open and every other flag closed", () => {
    const { result } = renderHook(() => useModalState());
    expect(result.current.showTutorial).toBe(true);
    expect(result.current.showAnimalsModal).toBe(false);
    expect(result.current.showPrestigeModal).toBe(false);
    expect(result.current.showResetDialog).toBe(false);
  });

  it("keeps the tutorial closed once it has been dismissed before", () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    const { result } = renderHook(() => useModalState());
    expect(result.current.showTutorial).toBe(false);
  });

  it("keeps the tutorial closed for returning players with save data", () => {
    localStorage.setItem("cute_planet_save_guest", "{}");
    const { result } = renderHook(() => useModalState());
    expect(result.current.showTutorial).toBe(false);
  });

  it("still opens the tutorial when only coordination meta exists", () => {
    localStorage.setItem("cute_planet_save_meta", JSON.stringify({ activeOwnerId: null }));
    const { result } = renderHook(() => useModalState());
    expect(result.current.showTutorial).toBe(true);
  });

  it("persists the seen flag when the tutorial is dismissed", () => {
    const { result } = renderHook(() => useModalState());
    expect(result.current.showTutorial).toBe(true);

    act(() => result.current.setShowTutorial(false));

    expect(result.current.showTutorial).toBe(false);
    expect(localStorage.getItem(TUTORIAL_SEEN_KEY)).toBe("1");
  });

  it("re-opens the tutorial on demand after dismissal", () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    const { result } = renderHook(() => useModalState());
    expect(result.current.showTutorial).toBe(false);

    act(() => result.current.setShowTutorial(true));

    expect(result.current.showTutorial).toBe(true);
  });

  it("opens a modal via its open* helper without touching the others", () => {
    const { result } = renderHook(() => useModalState());

    act(() => result.current.openAnimalsModal());

    expect(result.current.showAnimalsModal).toBe(true);
    // Independent flags: opening one must not open another.
    expect(result.current.showStarsModal).toBe(false);
    expect(result.current.showCraftingModal).toBe(false);
  });

  it("keeps flags independent so overlays can stack", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.setShowCloudSyncModal(true);
      result.current.setShowResetDialog(true);
    });

    expect(result.current.showCloudSyncModal).toBe(true);
    expect(result.current.showResetDialog).toBe(true);

    act(() => result.current.setShowCloudSyncModal(false));

    expect(result.current.showCloudSyncModal).toBe(false);
    expect(result.current.showResetDialog).toBe(true);
  });
});
