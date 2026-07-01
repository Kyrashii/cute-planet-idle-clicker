import React, { ReactNode, useEffect, useState } from "react";
import { useModalSettings } from "./Modal";

/**
 * Two-phase mount for heavy modal bodies.
 *
 * The modal shell (frame + header) mounts and animates in on a light tree;
 * the expensive children render one entry-animation window later, so the
 * open transition doesn't share its frames with a large synchronous render.
 * With animations disabled the children render immediately.
 */
const ENTRY_WINDOW_MS = 200;

export const DeferredModalContent: React.FC<{
  placeholder?: ReactNode;
  children: ReactNode;
}> = ({ placeholder = null, children }) => {
  const { disableAnimations } = useModalSettings();
  const [ready, setReady] = useState(disableAnimations);

  useEffect(() => {
    if (ready) return;
    let timer = 0;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setReady(true), ENTRY_WINDOW_MS);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [ready]);

  return <>{ready ? children : placeholder}</>;
};
