import React from "react";
import {
  Coins,
  Crown,
  Flame,
  Gauge,
  Gem,
  Gift,
  Heart,
  MousePointerClick,
  Orbit,
  PawPrint,
  Repeat,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Telescope,
  type LucideIcon,
} from "lucide-react";

import type {
  RogueliteBoonCategory,
  RogueliteDanger,
  RogueliteNodeType,
  RogueliteRarity,
} from "../../roguelite/types";
import { cx } from "../../lib/cx";
import { Button, IconButton as UiIconButton } from "../ui";

/* ------------------------------------------------------------------ *
 * Shared primitives now live in src/components/ui and src/hooks; this
 * file re-exports them (plus roguelite-flavoured button aliases) so the
 * roguelite surfaces keep their existing imports.
 * ------------------------------------------------------------------ */

export { cx };
export { useMediaQuery, usePrefersReducedMotion } from "../../hooks/useMediaQuery";
export { Panel, Eyebrow, Meter } from "../ui";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="primary" size="lg" {...props} />;
}

export function GhostButton(props: ButtonProps) {
  return <Button variant="ghost" size="md" {...props} />;
}

export function IconButton(props: ButtonProps) {
  return <UiIconButton {...props} />;
}

/* ------------------------------------------------------------------ *
 * Node identity system — one mascot + icon + tint + short German label
 * per node type, reused on the voyage map, the encounter header, path
 * cards and the history list. Mascots (the game's own animal art) carry
 * the identity on big surfaces; Lucide icons stay for tiny chips.
 * ------------------------------------------------------------------ */

export interface NodeVisual {
  icon: LucideIcon;
  /** Cute companion image shown on hero surfaces (encounter, path cards). */
  mascot: string;
  /** Short German label for compact chips. */
  short: string;
  /** Icon / accent text colour. */
  text: string;
  /** Soft chip background + border (icon badges, history chips). */
  soft: string;
  /** Solid fill used for completed beads on the voyage map. */
  bead: string;
  /** Glow used for the current bead / hero badge. */
  glow: string;
}

export const NODE_VISUALS: Record<RogueliteNodeType, NodeVisual> = {
  boon: {
    icon: Gift,
    mascot: "/assets/animals/chick.webp",
    short: "Bonus",
    text: "text-pink-200",
    soft: "border-pink-300/30 bg-pink-400/12",
    bead: "bg-pink-400",
    glow: "shadow-[0_0_18px_rgba(244,114,182,0.55)]",
  },
  combat: {
    icon: Swords,
    mascot: "/assets/animals/lion.webp",
    short: "Kampf",
    text: "text-rose-200",
    soft: "border-rose-300/30 bg-rose-400/12",
    bead: "bg-rose-400",
    glow: "shadow-[0_0_18px_rgba(251,113,133,0.55)]",
  },
  elite: {
    icon: Crown,
    mascot: "/assets/animals/dragon.webp",
    short: "Elite",
    text: "text-fuchsia-200",
    soft: "border-fuchsia-300/30 bg-fuchsia-400/12",
    bead: "bg-fuchsia-400",
    glow: "shadow-[0_0_18px_rgba(232,121,249,0.6)]",
  },
  anomaly: {
    icon: Orbit,
    mascot: "/assets/animals/octopus.webp",
    short: "Anomalie",
    text: "text-violet-200",
    soft: "border-violet-300/30 bg-violet-400/12",
    bead: "bg-violet-400",
    glow: "shadow-[0_0_18px_rgba(167,139,250,0.6)]",
  },
  rest: {
    icon: Heart,
    mascot: "/assets/animals/sloth.webp",
    short: "Rast",
    text: "text-emerald-200",
    soft: "border-emerald-300/30 bg-emerald-400/12",
    bead: "bg-emerald-400",
    glow: "shadow-[0_0_18px_rgba(52,211,153,0.5)]",
  },
  merchant: {
    icon: Coins,
    mascot: "/assets/animals/fox.webp",
    short: "Händler",
    text: "text-amber-200",
    soft: "border-amber-300/30 bg-amber-400/12",
    bead: "bg-amber-400",
    glow: "shadow-[0_0_18px_rgba(251,191,36,0.55)]",
  },
  relic_vault: {
    icon: Gem,
    mascot: "/assets/animals/raccoon.webp",
    short: "Kammer",
    text: "text-indigo-200",
    soft: "border-indigo-300/30 bg-indigo-400/12",
    bead: "bg-indigo-400",
    glow: "shadow-[0_0_18px_rgba(129,140,248,0.6)]",
  },
  sacrifice: {
    icon: Flame,
    mascot: "/assets/animals/phoenix.webp",
    short: "Opfer",
    text: "text-red-200",
    soft: "border-red-300/30 bg-red-400/12",
    bead: "bg-red-400",
    glow: "shadow-[0_0_18px_rgba(248,113,113,0.6)]",
  },
  echo: {
    icon: Repeat,
    mascot: "/assets/animals/whale.webp",
    short: "Echo",
    text: "text-cyan-200",
    soft: "border-cyan-300/30 bg-cyan-400/12",
    bead: "bg-cyan-400",
    glow: "shadow-[0_0_18px_rgba(34,211,238,0.55)]",
  },
  meteor: {
    icon: Sparkles,
    mascot: "/assets/animals/dino.webp",
    short: "Meteor",
    text: "text-orange-200",
    soft: "border-orange-300/30 bg-orange-400/12",
    bead: "bg-orange-400",
    glow: "shadow-[0_0_18px_rgba(251,146,60,0.55)]",
  },
  boss_omen: {
    icon: Telescope,
    mascot: "/assets/animals/owl.webp",
    short: "Vorzeichen",
    text: "text-purple-200",
    soft: "border-purple-300/30 bg-purple-400/12",
    bead: "bg-purple-400",
    glow: "shadow-[0_0_18px_rgba(192,132,252,0.6)]",
  },
};

/** Boss is not a node type but shares the visual language for the map / hero. */
export const BOSS_VISUAL: NodeVisual = {
  icon: Skull,
  mascot: "/assets/roguelite/roguelite_boss_comet.webp",
  short: "Boss",
  text: "text-cosmic-yellow",
  soft: "border-cosmic-yellow/40 bg-cosmic-yellow/12",
  bead: "bg-cosmic-yellow",
  glow: "shadow-[0_0_24px_rgba(254,240,138,0.7)]",
};

/** Shared cute-card base — chunky corners, soft depth — for choice-like cards. */
export const CUTE_CARD =
  "rounded-3xl border-2 border-white/12 bg-cosmic-surface-mid/80 shadow-[0_6px_18px_rgba(8,6,22,0.35)]";

export function nodeVisual(type: RogueliteNodeType): NodeVisual {
  return NODE_VISUALS[type] ?? NODE_VISUALS.combat;
}

/** Tinted rounded-square icon badge used in encounter headers and path cards. */
export function IconBadge({
  visual,
  size = "md",
  className,
}: {
  visual: NodeVisual;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = visual.icon;
  const box =
    size === "lg"
      ? "h-14 w-14 rounded-2xl"
      : size === "sm"
        ? "h-8 w-8 rounded-xl"
        : "h-11 w-11 rounded-2xl";
  const glyph = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center border",
        box,
        visual.soft,
        visual.glow,
        className,
      )}
    >
      <Icon className={cx(glyph, visual.text)} />
    </div>
  );
}

/** Pastel mascot tile — the cute face of a node type on hero surfaces. */
export function MascotBadge({
  visual,
  size = "md",
  className,
}: {
  visual: NodeVisual;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box =
    size === "lg"
      ? "size-20 rounded-3xl"
      : size === "sm"
        ? "size-10 rounded-xl"
        : "size-14 rounded-2xl";
  const img = size === "lg" ? "size-16" : size === "sm" ? "size-8" : "size-11";
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center border-2",
        box,
        visual.soft,
        visual.glow,
        className,
      )}
    >
      <img
        src={visual.mascot}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={cx(
          img,
          "object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform group-hover:-rotate-3 group-hover:scale-110",
        )}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Danger — translated, graded indicator (never the raw English key).
 * ------------------------------------------------------------------ */

export interface DangerVisual {
  label: string;
  pips: number;
  text: string;
  chip: string;
}

export const DANGER_VISUALS: Record<RogueliteDanger, DangerVisual> = {
  low: {
    label: "Ruhig",
    pips: 1,
    text: "text-emerald-200",
    chip: "border-emerald-300/30 bg-emerald-400/10",
  },
  medium: {
    label: "Heikel",
    pips: 2,
    text: "text-amber-200",
    chip: "border-amber-300/30 bg-amber-400/10",
  },
  high: {
    label: "Gefährlich",
    pips: 3,
    text: "text-rose-200",
    chip: "border-rose-300/30 bg-rose-400/10",
  },
  extreme: {
    label: "Tödlich",
    pips: 4,
    text: "text-fuchsia-200",
    chip: "border-fuchsia-300/35 bg-fuchsia-400/12",
  },
};

export const DangerBadge: React.FC<{ danger: RogueliteDanger }> = ({ danger }) => {
  const v = DANGER_VISUALS[danger] ?? DANGER_VISUALS.medium;
  return (
    <div className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1", v.chip)}>
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cx(
              "size-1.5  rounded-full",
              i < v.pips ? cx(v.text, "bg-current") : "bg-white/15",
            )}
          />
        ))}
      </div>
      <span className={cx("text-[10px] font-black uppercase tracking-[0.14em]", v.text)}>
        {v.label}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Boon categories + rarity.
 * ------------------------------------------------------------------ */

export interface CategoryVisual {
  icon: LucideIcon;
  label: string;
  text: string;
  soft: string;
}

export const CATEGORY_VISUALS: Record<RogueliteBoonCategory, CategoryVisual> = {
  click: {
    icon: MousePointerClick,
    label: "Klick",
    text: "text-pink-200",
    soft: "border-pink-300/30 bg-pink-400/12",
  },
  animals: {
    icon: PawPrint,
    label: "Tiere",
    text: "text-emerald-200",
    soft: "border-emerald-300/30 bg-emerald-400/12",
  },
  tempo: {
    icon: Gauge,
    label: "Tempo",
    text: "text-cyan-200",
    soft: "border-cyan-300/30 bg-cyan-400/12",
  },
  economy: {
    icon: Coins,
    label: "Wirtschaft",
    text: "text-amber-200",
    soft: "border-amber-300/30 bg-amber-400/12",
  },
  defense: {
    icon: Shield,
    label: "Verteidigung",
    text: "text-violet-200",
    soft: "border-violet-300/30 bg-violet-400/12",
  },
  risk: {
    icon: Flame,
    label: "Risiko",
    text: "text-red-200",
    soft: "border-red-300/30 bg-red-400/12",
  },
  exotic: {
    icon: Sparkles,
    label: "Exotisch",
    text: "text-fuchsia-200",
    soft: "border-fuchsia-300/30 bg-fuchsia-400/12",
  },
};

export interface RarityVisual {
  label: string;
  text: string;
  ring: string;
  dot: string;
}

export const RARITY_VISUALS: Record<RogueliteRarity, RarityVisual> = {
  common: {
    label: "Gewöhnlich",
    text: "text-slate-200",
    ring: "border-slate-300/25",
    dot: "bg-slate-300",
  },
  rare: { label: "Selten", text: "text-sky-200", ring: "border-sky-300/40", dot: "bg-sky-300" },
  epic: {
    label: "Episch",
    text: "text-violet-200",
    ring: "border-violet-300/45",
    dot: "bg-violet-300",
  },
  legendary: {
    label: "Legendär",
    text: "text-amber-200",
    ring: "border-amber-300/50",
    dot: "bg-amber-300",
  },
};
