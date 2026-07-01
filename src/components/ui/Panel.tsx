import React from "react";
import { cx } from "../../lib/cx";

export function Panel({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-white/10 bg-cosmic-surface/80 shadow-[0_24px_70px_rgba(8,6,22,0.5)] backdrop-blur-xl",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
