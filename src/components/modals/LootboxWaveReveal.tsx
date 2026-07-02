import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import type { LootboxesOpenedEvent, LootboxRarity } from "../../game/protocol";
import { aggregateLootboxRolls } from "../../game/lootbox";
import { RARITY_STYLES } from "../../data/cosmetics";
import { useModalSettings } from "../ui/Modal";

const SHAKE_MS = 1000;
const STAGGER_S = 0.075;
const MAX_ANIMATED_CARDS = 24;
const MAX_JUICED_CARDS = 8;
const RARITY_KEYS: LootboxRarity[] = ["legendary", "epic", "rare", "common"];

interface LootboxWaveRevealProps {
  /** Worker result; null while the roll round-trip is still pending. */
  result: LootboxesOpenedEvent | null;
  onClose: () => void;
}

/** Deterministic radial sparkle burst around a card (epic/legendary only). */
const SparkleBurst: React.FC<{ delay: number }> = ({ delay }) => (
  <>
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos(angle) * 42,
            y: Math.sin(angle) * 42,
            scale: 1.1,
          }}
          transition={{ delay: delay + 0.15, duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute top-1/2 left-1/2 text-sm select-none"
          aria-hidden="true"
        >
          ✨
        </motion.span>
      );
    })}
  </>
);

/**
 * Full-panel gacha overlay: comet shake, then all rewards flip in as a
 * staggered wave of rarity-tinted cards (aggregated per cosmetic), ending in
 * a per-rarity summary. Skippable; reduced motion goes straight to the grid.
 */
export const LootboxWaveReveal: React.FC<LootboxWaveRevealProps> = ({ result, onClose }) => {
  const { disableAnimations } = useModalSettings();
  const [shakeDone, setShakeDone] = useState(disableAnimations);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (shakeDone) return;
    const timer = window.setTimeout(() => setShakeDone(true), SHAKE_MS);
    return () => window.clearTimeout(timer);
  }, [shakeDone]);

  const stacks = useMemo(() => (result ? aggregateLootboxRolls(result.results) : []), [result]);
  const rarityCounts = useMemo(() => {
    const counts: Record<LootboxRarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (const roll of result?.results ?? []) counts[roll.rarity] += 1;
    return counts;
  }, [result]);

  const revealing = result !== null && shakeDone;
  const instant = skipped || disableAnimations;
  const cardDelay = (index: number) =>
    instant ? 0 : Math.min(index, MAX_ANIMATED_CARDS) * STAGGER_S;
  const waveEndDelay = instant ? 0 : Math.min(stacks.length, MAX_ANIMATED_CARDS) * STAGGER_S + 0.3;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-cosmic-bg-deep/98 text-cosmic-text">
      {!revealing ? (
        <div className="flex grow flex-col items-center justify-center gap-4">
          <motion.div
            animate={
              disableAnimations
                ? undefined
                : {
                    rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
                    scale: [1, 1.1, 1.1, 1.1, 1.15, 1.15, 1.15, 1, 1],
                  }
            }
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="text-7xl select-none filter drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"
          >
            ☄️
          </motion.div>
          <p className="animate-pulse text-center font-mono text-sm font-black tracking-widest text-yellow-300 uppercase">
            Oeffne Sternenstaub... ✨
          </p>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-5 pb-3">
            <div>
              <h4 className="font-sans text-sm font-black tracking-wide text-amber-300 uppercase">
                {result.opened === 1
                  ? "Sternschnuppe geoeffnet!"
                  : `${result.opened} Sternschnuppen geoeffnet!`}
              </h4>
              <p className="text-[10px] font-bold text-cosmic-text-muted">
                {stacks.some((s) => s.isNew)
                  ? "Neue Schaetze zuerst — Duplikate werden zu Glitzerstaub!"
                  : "Alles Duplikate — dafuer gibt es Glitzerstaub!"}
              </p>
            </div>
            {!instant && stacks.length > 3 && (
              <button
                onClick={() => setSkipped(true)}
                className="shrink-0 cursor-pointer rounded-xl border border-cosmic-accent/40 bg-cosmic-bg-mid px-3 py-1.5 font-mono text-[10px] font-black tracking-wider text-cosmic-accent uppercase transition-all hover:bg-cosmic-surface-mid active:scale-95"
              >
                Ueberspringen ⏭
              </button>
            )}
          </div>

          <div className="grow overflow-y-auto px-5 pb-3">
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {stacks.map((stack, i) => {
                const style = RARITY_STYLES[stack.cosmetic.rarity];
                const juiced =
                  !instant &&
                  i < MAX_JUICED_CARDS &&
                  (stack.cosmetic.rarity === "epic" || stack.cosmetic.rarity === "legendary");
                return (
                  <motion.div
                    key={stack.cosmetic.id}
                    initial={instant ? false : { scale: 0.6, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{
                      delay: cardDelay(i),
                      type: "spring",
                      damping: 18,
                      stiffness: 260,
                    }}
                    className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center ${style.bg} ${style.border} ${
                      stack.cosmetic.rarity === "legendary"
                        ? "shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                        : stack.cosmetic.rarity === "epic"
                          ? "shadow-[0_0_14px_rgba(202,165,254,0.3)]"
                          : ""
                    }`}
                  >
                    {stack.isNew && (
                      <span className="absolute -top-2 -left-2 rounded-full border border-emerald-300 bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black text-white uppercase">
                        Neu
                      </span>
                    )}
                    {stack.count > 1 && (
                      <span className="absolute -top-2 -right-2 rounded-full border border-white/30 bg-cosmic-ink px-1.5 py-0.5 font-mono text-[9px] font-black text-cosmic-accent">
                        x{stack.count}
                      </span>
                    )}
                    <span className="text-4xl leading-none select-none">
                      {stack.cosmetic.emoji}
                    </span>
                    <span className="w-full truncate text-[10px] font-black">
                      {stack.cosmetic.germanName}
                    </span>
                    <span className={`font-mono text-[8px] uppercase ${style.text}`}>
                      {style.name}
                    </span>
                    {stack.refund > 0 && (
                      <span className="font-mono text-[8px] font-bold text-pink-300">
                        +{stack.refund} ✨
                      </span>
                    )}
                    {juiced && <SparkleBurst delay={cardDelay(i)} />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={instant ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: waveEndDelay, duration: 0.25, ease: "easeOut" }}
            className="shrink-0 border-t border-cosmic-accent/20 bg-cosmic-bg/80 px-5 py-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {RARITY_KEYS.filter((r) => rarityCounts[r] > 0).map((rarity) => (
                <span
                  key={rarity}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[9px] font-black uppercase ${RARITY_STYLES[rarity].bg} ${RARITY_STYLES[rarity].border} ${RARITY_STYLES[rarity].text}`}
                >
                  {rarityCounts[rarity]}x {RARITY_STYLES[rarity].name}
                </span>
              ))}
              {result.totalRefund > 0 && (
                <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 font-mono text-[9px] font-black text-pink-300 uppercase">
                  +{result.totalRefund} ✨ Glitzerstaub
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-3 w-full cursor-pointer rounded-2xl bg-linear-to-r from-amber-450 to-orange-500 px-8 py-3 font-sans text-sm font-black tracking-wider text-white uppercase shadow-lg transition-all hover:from-amber-500 hover:to-orange-600 active:scale-95"
            >
              Wie fabelhaft! ➔
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};
