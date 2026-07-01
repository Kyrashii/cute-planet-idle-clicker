import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useModalStack } from "./useModalStack";

describe("useModalStack", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens and closes modals independently", () => {
    const { result } = renderHook(() => useModalStack());

    act(() => result.current.openModal("animals"));
    act(() => result.current.openModal("reset"));

    expect(result.current.isOpen("animals")).toBe(true);
    expect(result.current.isOpen("reset")).toBe(true);
    expect(result.current.stack).toEqual(["animals", "reset"]);

    act(() => result.current.closeModal("animals"));
    expect(result.current.isOpen("animals")).toBe(false);
    expect(result.current.isOpen("reset")).toBe(true);
  });

  it("does not duplicate an already-open modal", () => {
    const { result } = renderHook(() => useModalStack());
    act(() => {
      result.current.openModal("stars");
      result.current.openModal("stars");
    });
    expect(result.current.stack).toEqual(["stars"]);
  });

  it("closeTop closes the most recently opened modal", () => {
    const { result } = renderHook(() => useModalStack());
    act(() => {
      result.current.openModal("animals");
      result.current.openModal("upgrades");
    });
    act(() => result.current.closeTop());
    expect(result.current.stack).toEqual(["animals"]);
  });

  it("pushes a single history sentinel for user-opened modals", () => {
    const push = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useModalStack());

    act(() => result.current.openModal("animals"));
    act(() => result.current.openModal("upgrades"));

    expect(push).toHaveBeenCalledTimes(1);
  });

  it("does not push history for the initial stack and closes it without history.back", () => {
    const push = vi.spyOn(window.history, "pushState");
    const back = vi.spyOn(window.history, "back");
    const { result } = renderHook(() => useModalStack(["tutorial"]));

    expect(result.current.isOpen("tutorial")).toBe(true);
    expect(push).not.toHaveBeenCalled();

    act(() => result.current.closeModal("tutorial"));
    expect(result.current.stack).toEqual([]);
    expect(back).not.toHaveBeenCalled();
  });

  it("consumes the sentinel via history.back when the last modal closes from the UI", () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    const { result } = renderHook(() => useModalStack());

    act(() => result.current.openModal("animals"));
    act(() => result.current.closeModal("animals"));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("closes the top modal on popstate (back button) and keeps guarding the rest", () => {
    const push = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useModalStack());

    act(() => {
      result.current.openModal("animals");
      result.current.openModal("upgrades");
    });
    expect(push).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.stack).toEqual(["animals"]);
    expect(push).toHaveBeenCalledTimes(2);

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.stack).toEqual([]);
  });
});
