import React from "react";
import { cx } from "../../lib/cx";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "size-9 rounded-xl",
  md: "size-11 rounded-2xl",
  lg: "size-12 rounded-2xl",
} as const;

export function IconButton({ size = "md", className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "flex shrink-0 items-center justify-center border border-white/12 bg-white/4 text-cosmic-text-muted transition",
        "hover:border-cosmic-accent/40 hover:bg-white/8 hover:text-cosmic-text",
        "active:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45",
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
