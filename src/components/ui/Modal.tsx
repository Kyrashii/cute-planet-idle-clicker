/**
 * Shared Modal base component.
 *
 * Handles all cross-cutting modal concerns once, so individual modals only
 * need to provide content:
 *  - Renders via createPortal into #modal-root (escapes layout stacking ctx)
 *  - Single backdrop-blur-sm overlay (no per-panel blur)
 *  - AnimatePresence enter + exit animations
 *  - Escape key to close
 *  - Backdrop click to close
 *  - Body scroll lock (ref-counted for nested modals)
 *  - Focus trap (locks Tab/Shift+Tab inside the panel)
 *  - Restores focus to the previously-focused element on close
 *
 * Usage:
 *   <Modal isOpen={show} onClose={() => setShow(false)} panelClassName="...">
 *     {content}
 *   </Modal>
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  useContext,
  useState,
  createContext,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { useIsMobile } from "../../hooks/useMediaQuery";

// ---------------------------------------------------------------------------
// ModalSettingsContext — lets GameModalsContainer set disableAnimations once
// for all child modals without threading the prop through every modal file.
// ---------------------------------------------------------------------------
interface ModalSettings {
  disableAnimations: boolean;
}

const ModalSettingsContext = createContext<ModalSettings>({ disableAnimations: false });

export const ModalSettingsProvider: React.FC<{
  disableAnimations: boolean;
  children: ReactNode;
}> = ({ disableAnimations, children }) => (
  <ModalSettingsContext.Provider value={{ disableAnimations }}>
    {children}
  </ModalSettingsContext.Provider>
);

export function useModalSettings(): ModalSettings {
  return useContext(ModalSettingsContext);
}

// ---------------------------------------------------------------------------
// Scroll-lock ref counter so stacked modals don't fight over body overflow.
// ---------------------------------------------------------------------------
let scrollLockCount = 0;

function lockScroll() {
  scrollLockCount++;
  if (scrollLockCount === 1) {
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.dataset.scrollY = String(scrollY);
  }
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    const scrollY = Number(document.body.dataset.scrollY ?? "0");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }
}

// ---------------------------------------------------------------------------
// Focus trap helpers
// ---------------------------------------------------------------------------
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest("[aria-hidden='true']"),
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;

  /**
   * Tailwind classes for the panel div.
   * The component adds `modal-frame-target` automatically so the cosmetic
   * frame CSS still works.
   */
  panelClassName?: string;

  /**
   * When true the motion entrance/exit is skipped (low-memory / reduced-motion).
   */
  disableAnimations?: boolean;

  /**
   * When true, `modal-frame-target` is NOT added to the panel class.
   * Use for modals whose panel is not a standard card (e.g. full-bleed image panels).
   */
  skipFrameTarget?: boolean;

  /**
   * When false, clicking the backdrop does NOT close the modal.
   * Defaults to true.
   */
  closeOnBackdrop?: boolean;

  /**
   * Override the backdrop div's className entirely.
   * Default: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/65 backdrop-blur-sm"
   */
  backdropClassName?: string;

  /** Inline styles applied to the panel motion.div (e.g. backgroundImage). */
  panelStyle?: React.CSSProperties;

  /**
   * How the modal presents:
   *  - "dialog": centred card everywhere (default)
   *  - "sheet":  bottom sheet with drag-to-dismiss handle
   *  - "auto":   sheet below the game breakpoint, dialog above it
   *  - "drawer": right-side slide-in above the game breakpoint, sheet below
   */
  presentation?: "dialog" | "sheet" | "auto" | "drawer";

  /** Fires once the exit animation has fully finished. */
  onExitComplete?: () => void;

  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  panelClassName = "",
  disableAnimations: disableAnimationsProp,
  closeOnBackdrop = true,
  skipFrameTarget = false,
  backdropClassName,
  panelStyle,
  presentation = "dialog",
  onExitComplete,
  children,
}) => {
  const { disableAnimations: disableAnimationsCtx } = useContext(ModalSettingsContext);
  const disableAnimations = disableAnimationsProp ?? disableAnimationsCtx;
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const isSheet =
    presentation === "sheet" ||
    ((presentation === "auto" || presentation === "drawer") && isMobile);
  const isDrawer = presentation === "drawer" && !isMobile;
  const dragControls = useDragControls();

  // The backdrop blur mounts only after the panel has finished animating in,
  // and drops the moment closing starts — so neither open nor close ever
  // animates on top of an active backdrop-filter repaint.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!isOpen) setSettled(false);
  }, [isOpen]);

  // --- Scroll lock ---
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  // --- Save/restore focus ---
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Move focus into the panel on open
    requestAnimationFrame(() => {
      const first = panelRef.current && getFocusable(panelRef.current)[0];
      if (first) first.focus();
    });
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // --- Escape key ---
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // --- Focus trap ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = getFocusable(panelRef.current);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // --- Backdrop click ---
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  // Render into portal
  const portalTarget =
    typeof document !== "undefined"
      ? (document.getElementById("modal-root") ?? document.body)
      : null;

  const isGlitchedCtx =
    typeof document !== "undefined" && document.body.classList.contains("glitch-galaxy-active");

  if (!portalTarget) return null;

  // Sheet layout is forced via inline styles so it wins over each modal's own
  // dialog sizing classes (max-w-*, rounded-*) without per-modal class surgery.
  const sheetStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    maxHeight: "94dvh",
    margin: 0,
    borderRadius: "1.5rem 1.5rem 0 0",
    borderBottomWidth: 0,
    paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
  };

  // Drawer layout is forced the same way: full-height right-side panel.
  const drawerStyle: React.CSSProperties = {
    height: "100dvh",
    maxHeight: "100dvh",
    width: "min(24rem, 92vw)",
    maxWidth: "min(24rem, 92vw)",
    margin: 0,
    borderRadius: "1.5rem 0 0 1.5rem",
    borderRightWidth: 0,
  };

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {isOpen && (
        // Overlay — layout only; tint and blur live on separate layers so the
        // open/close transitions never repaint a backdrop-filter per frame.
        <div
          className={
            backdropClassName ??
            `fixed inset-0 z-50 flex ${
              isDrawer
                ? "items-stretch justify-end p-0"
                : isSheet
                  ? "items-end justify-center p-0"
                  : "items-center justify-center p-4"
            }`
          }
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
        >
          {backdropClassName === undefined && (
            <>
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gray-950/65"
                initial={disableAnimations ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={disableAnimations ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
              {settled && !disableAnimations && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              )}
            </>
          )}
          <motion.div
            ref={panelRef}
            initial={
              disableAnimations
                ? false
                : isSheet
                  ? { y: "100%" }
                  : isDrawer
                    ? { x: "100%" }
                    : { scale: 0.95, opacity: 0, y: 15 }
            }
            animate={
              disableAnimations
                ? {}
                : isSheet
                  ? { y: 0 }
                  : isDrawer
                    ? { x: 0 }
                    : { scale: 1, opacity: 1, y: 0 }
            }
            exit={
              disableAnimations
                ? {}
                : isSheet
                  ? { y: "100%", transition: { duration: 0.22, ease: "easeIn" } }
                  : isDrawer
                    ? { x: "100%", transition: { duration: 0.22, ease: "easeIn" } }
                    : { scale: 0.95, opacity: 0, y: 10 }
            }
            transition={
              isSheet || isDrawer
                ? { type: "spring", damping: 32, stiffness: 320 }
                : { duration: 0.18, ease: "easeOut" }
            }
            drag={isSheet && !disableAnimations ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 800) onClose();
            }}
            className={`relative z-10 ${skipFrameTarget ? "" : "modal-frame-target "}${isSheet || isDrawer ? "flex flex-col overflow-hidden " : ""}${panelClassName} ${
              isGlitchedCtx
                ? " bg-black! text-cyan-400! border-cyan-500! shadow-[0_0_35px_rgba(6,182,212,0.6)] border-4 select-none glitch-text-anim font-mono "
                : ""
            }`}
            style={
              isSheet
                ? { ...panelStyle, ...sheetStyle }
                : isDrawer
                  ? { ...panelStyle, ...drawerStyle }
                  : panelStyle
            }
            onKeyDown={handleKeyDown}
            onAnimationComplete={() => {
              if (isOpen) setSettled(true);
            }}
          >
            {isSheet && (
              <div
                className="flex shrink-0 cursor-grab touch-none items-center justify-center pt-2.5 pb-1.5 active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
                aria-hidden="true"
              >
                <div className="h-1.5 w-12 rounded-full bg-white/25" />
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalTarget,
  );
};
