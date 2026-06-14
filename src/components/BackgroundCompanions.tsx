import React from "react";
import { motion } from "motion/react";

interface Companion {
  id: string;
  emoji: string;
  x: number;
  y: number;
  delay: number;
  scale: number;
  speed: number;
}

interface BackgroundCompanionsProps {
  companions: Companion[];
}

export const BackgroundCompanions: React.FC<BackgroundCompanionsProps> = ({ companions }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {companions.map((comp) => (
        <motion.div
          key={comp.id}
          style={{
            left: `${comp.x}%`,
            top: `${comp.y}%`,
            position: "absolute",
            scale: comp.scale,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            y: [0, comp.y > 50 ? -32 : 32, 0],
            x: [0, comp.x > 50 ? -24 : 24, 0],
          }}
          transition={{
            duration: comp.speed * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-lg sm:text-2xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] select-none pointer-events-none"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              scaleY: [1, 0.78, 1.2, 1],
              scaleX: [1, 1.22, 0.8, 1],
              rotate: [0, -3, 3, 0],
            }}
            transition={{
              duration: comp.speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: comp.delay,
            }}
          >
            {comp.emoji}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
