import { useEffect, useRef, useState } from "react";

/**
 * How long a modal stays mounted after `isOpen` flips false, so the Modal's
 * internal AnimatePresence exit animation can play before unmount.
 * Must cover the longest exit: sheet 220ms ease-in, dialog 180ms.
 */
export const MODAL_EXIT_MS = 300;

/**
 * Presence gate for conditionally-mounted modals.
 *
 * `{show && <XModal isOpen={show} />}` unmounts the modal the moment `show`
 * flips false, which kills the exit animation. Gate the mount on this hook
 * instead: it turns true synchronously with `isOpen` and lingers for
 * MODAL_EXIT_MS after close (immediately false when animations are disabled).
 */
export function useModalPresence(isOpen: boolean, disableAnimations = false): boolean {
  const [mounted, setMounted] = useState(isOpen);

  if (isOpen && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (isOpen || !mounted) return;
    if (disableAnimations) {
      setMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), MODAL_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, mounted, disableAnimations]);

  return mounted;
}

/**
 * Keeps the last non-null value alive while a modal plays its exit animation.
 * Data-carrying modals (`result={openingResult}`) would otherwise crash when
 * their payload is cleared but the panel is still exiting.
 */
export function useLatchedValue<T>(value: T | null | undefined): T | null {
  const ref = useRef<T | null>(value ?? null);
  if (value != null) {
    ref.current = value;
  }
  return value ?? ref.current;
}
