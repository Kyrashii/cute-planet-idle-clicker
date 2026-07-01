import type { Transition, Variants } from "motion/react";

/**
 * Shared motion vocabulary. Durations/eases mirror the CSS tokens in
 * src/index.css (--duration-*, --ease-*) so JS- and CSS-driven animation
 * feel identical.
 */

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;
export const EASE_SNAPPY = [0.32, 0.72, 0, 1] as const;

export const spring = {
  soft: { type: "spring", damping: 26, stiffness: 220 } satisfies Transition,
  snappy: { type: "spring", damping: 32, stiffness: 320 } satisfies Transition,
} as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: 8, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.fast, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: DURATION.fast, ease: "easeIn" } },
};

export const staggerChildren = (delay = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});
