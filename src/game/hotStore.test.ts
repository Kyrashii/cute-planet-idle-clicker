import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { hotStore, useHotStat } from "./hotStore";

describe("hotStore", () => {
  it("stores partial updates and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = hotStore.subscribe(listener);

    hotStore.set({ life: 42, cycleProgress: 0.5 });
    expect(hotStore.get().life).toBe(42);
    expect(hotStore.get().cycleProgress).toBe(0.5);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    hotStore.set({ life: 43 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not notify when nothing changed", () => {
    hotStore.set({ life: 100 });
    const listener = vi.fn();
    const unsubscribe = hotStore.subscribe(listener);
    hotStore.set({ life: 100 });
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("useHotStat re-renders with the selected value", () => {
    hotStore.set({ life: 1 });
    const { result } = renderHook(() => useHotStat((s) => s.life));
    expect(result.current).toBe(1);

    act(() => hotStore.set({ life: 7 }));
    expect(result.current).toBe(7);
  });
});
