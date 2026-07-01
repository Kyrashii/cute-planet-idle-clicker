import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useModalPresence, useLatchedValue, MODAL_EXIT_MS } from "./useModalPresence";

describe("useModalPresence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mounts synchronously when opened", () => {
    const { result, rerender } = renderHook(({ isOpen }) => useModalPresence(isOpen), {
      initialProps: { isOpen: false },
    });
    expect(result.current).toBe(false);

    rerender({ isOpen: true });
    expect(result.current).toBe(true);
  });

  it("stays mounted for the exit window after close", () => {
    const { result, rerender } = renderHook(({ isOpen }) => useModalPresence(isOpen), {
      initialProps: { isOpen: true },
    });

    rerender({ isOpen: false });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(MODAL_EXIT_MS - 1);
    });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it("cancels the unmount when reopened during the exit window", () => {
    const { result, rerender } = renderHook(({ isOpen }) => useModalPresence(isOpen), {
      initialProps: { isOpen: true },
    });

    rerender({ isOpen: false });
    act(() => {
      vi.advanceTimersByTime(MODAL_EXIT_MS / 2);
    });
    rerender({ isOpen: true });

    act(() => {
      vi.advanceTimersByTime(MODAL_EXIT_MS * 2);
    });
    expect(result.current).toBe(true);
  });

  it("unmounts immediately when animations are disabled", () => {
    const { result, rerender } = renderHook(({ isOpen }) => useModalPresence(isOpen, true), {
      initialProps: { isOpen: true },
    });

    act(() => {
      rerender({ isOpen: false });
    });
    expect(result.current).toBe(false);
  });
});

describe("useLatchedValue", () => {
  it("returns the current value while non-null and the last value after null", () => {
    const { result, rerender } = renderHook(({ value }) => useLatchedValue<string>(value), {
      initialProps: { value: "a" as string | null },
    });
    expect(result.current).toBe("a");

    rerender({ value: "b" });
    expect(result.current).toBe("b");

    rerender({ value: null });
    expect(result.current).toBe("b");
  });

  it("starts as null when initialised with null", () => {
    const { result } = renderHook(() => useLatchedValue<string>(null));
    expect(result.current).toBeNull();
  });
});
