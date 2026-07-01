import React from "react";
import { cx } from "../../lib/cx";

/** The tiny mono caption used to label a section. */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "font-mono text-[10px] font-black uppercase tracking-[0.24em] text-cosmic-accent-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
