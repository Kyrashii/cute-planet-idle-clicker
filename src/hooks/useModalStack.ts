import { useCallback, useEffect, useRef, useState } from "react";

export const MODAL_IDS = [
  "animals",
  "stars",
  "stats",
  "musicSettings",
  "cloudSync",
  "leaderboard",
  "crafting",
  "galaxyShardsShop",
  "missions",
  "inventory",
  "prestige",
  "voyage",
  "zodiac",
  "offline",
  "reset",
  "repair",
  "cheatEvent",
  "tutorial",
  "upgrades",
  "achievements",
  "gehege",
  "menu",
] as const;

export type ModalId = (typeof MODAL_IDS)[number];

/**
 * Ordered stack of open modals. Besides the open/close API, the stack owns a
 * single history sentinel entry while at least one user-opened modal is open,
 * so the browser/Android back button closes the top modal instead of leaving
 * the app. Modals in the initial stack (first-run tutorial) don't push
 * history — there was no user gesture.
 */
export function useModalStack(initial: readonly ModalId[] = []) {
  const [stack, setStack] = useState<readonly ModalId[]>(initial);
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const sentinelRef = useRef(false);

  const openModal = useCallback((id: ModalId) => {
    if (!stackRef.current.includes(id) && !sentinelRef.current && typeof window !== "undefined") {
      window.history.pushState({ modalSentinel: true }, "");
      sentinelRef.current = true;
    }
    setStack((s) => (s.includes(id) ? s : [...s, id]));
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    const current = stackRef.current;
    if (!current.includes(id)) return;
    const next = current.filter((x) => x !== id);
    setStack(next);
    if (next.length === 0 && sentinelRef.current) {
      sentinelRef.current = false;
      window.history.back();
    }
  }, []);

  const closeTop = useCallback(() => {
    const top = stackRef.current[stackRef.current.length - 1];
    if (top) closeModal(top);
  }, [closeModal]);

  const isOpen = useCallback((id: ModalId) => stack.includes(id), [stack]);

  useEffect(() => {
    const onPopState = () => {
      if (stackRef.current.length === 0) {
        // Our own history.back() from closeModal, or unrelated navigation.
        sentinelRef.current = false;
        return;
      }
      const next = stackRef.current.slice(0, -1);
      setStack(next);
      if (next.length > 0) {
        window.history.pushState({ modalSentinel: true }, "");
      } else {
        sentinelRef.current = false;
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return { stack, openModal, closeModal, closeTop, isOpen };
}
