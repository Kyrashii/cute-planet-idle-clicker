import React from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "./theme";

const SPAN_COUNT = 12;
const GLYPHS = ["✨", "⭐", "💖", "🌸"];

/**
 * One-shot celebratory burst of a few emoji spans radiating from the centre
 * of its (relatively positioned) parent. DOM-local on purpose: the roguelite
 * sits at z-120, far above the GPU effects canvas, so the shared particle
 * layer can't be seen here. Renders nothing under reduced motion.
 */
export const JuiceBurst: React.FC<{ className?: string }> = ({ className }) => {
  const reducedMotion = usePrefersReducedMotion();
  if (reducedMotion) return null;

  return (
    <span
      className={`pointer-events-none absolute inset-0 overflow-visible ${className ?? ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: SPAN_COUNT }, (_, i) => {
        const angle = (i / SPAN_COUNT) * Math.PI * 2;
        const distance = 70 + (i % 3) * 26;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0.4, 1.15, 0.9],
              rotate: (i % 2 === 0 ? 1 : -1) * 40,
            }}
            transition={{ delay: 0.1 + (i % 4) * 0.06, duration: 0.9, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 text-lg select-none"
          >
            {GLYPHS[i % GLYPHS.length]}
          </motion.span>
        );
      })}
    </span>
  );
};
