import React from "react";
import { cx } from "../../lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: cx(
    "border border-cosmic-accent/60 bg-linear-135 from-cosmic-glow-pink via-cosmic-accent via-50% to-cosmic-glow-blue text-cosmic-ink",
    "shadow-[0_16px_40px_rgba(202,165,254,0.32)]",
    "hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(202,165,254,0.4)]",
    "active:translate-y-0 active:shadow-[0_10px_28px_rgba(202,165,254,0.28)]",
  ),
  secondary: cx(
    "border border-white/12 bg-cosmic-surface-mid text-cosmic-text",
    "hover:border-cosmic-accent/40 hover:bg-cosmic-surface-hover",
    "active:bg-cosmic-surface",
  ),
  ghost: cx(
    "border border-white/12 bg-white/4 text-cosmic-text-muted",
    "hover:border-cosmic-accent/40 hover:bg-white/8 hover:text-cosmic-text",
    "active:bg-white/12",
  ),
  danger: cx(
    "border border-danger/40 bg-danger/15 text-rose-200",
    "hover:border-danger/60 hover:bg-danger/25",
    "active:bg-danger/30",
  ),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-xl px-3 py-1.5 text-[11px]",
  md: "min-h-11 rounded-xl px-4 py-2.5 text-xs",
  lg: "min-h-12 rounded-2xl px-5 py-3 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 font-black uppercase tracking-[0.14em] transition",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
