import React from "react";
import {
  Check,
  Compass,
  Dices,
  Feather,
  Gem,
  Lock,
  Moon,
  Orbit,
  ShieldPlus,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { ROGUELITE_RELICS } from "../../roguelite/data";
import { RARITY_VISUALS, cx } from "./theme";

const RELIC_ICONS: Record<string, LucideIcon> = {
  kometenherz: ShieldPlus,
  pfotenkompass: Compass,
  nebelglas: Orbit,
  funkelzahn: Zap,
  mondfaden: Moon,
  splitterbeutel: Gem,
  sternennaht: Dices,
  leerefeder: Feather,
};

export const RelicCard: React.FC<{
  relicId: string;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}> = ({ relicId, selected = false, locked = false, onClick }) => {
  const relic = ROGUELITE_RELICS.find((entry) => entry.id === relicId);
  if (!relic) return null;

  const rarity = RARITY_VISUALS[relic.rarity];
  const Icon = RELIC_ICONS[relic.id] ?? Sparkles;
  const interactive = !locked && !!onClick;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        "relative flex h-full w-full flex-col rounded-2xl border p-4 text-left transition",
        locked
          ? "cursor-default border-white/8 bg-black/25 opacity-55"
          : selected
            ? "border-cosmic-accent/70 bg-cosmic-accent/10 shadow-[0_0_30px_rgba(202,165,254,0.25)]"
            : cx(
                "border-white/10 bg-cosmic-surface-mid/70",
                interactive &&
                  "hover:-translate-y-0.5 hover:border-cosmic-accent/40 hover:bg-cosmic-surface-hover/80",
              ),
        interactive &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-accent/60",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-black/25",
            rarity.ring,
          )}
        >
          {locked ? (
            <Lock className="h-4 w-4 text-white/40" />
          ) : (
            <Icon className={cx("h-5 w-5", rarity.text)} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cx("h-1.5 w-1.5 rounded-full", rarity.dot)} />
            <span className={cx("text-[9px] font-black uppercase tracking-[0.16em]", rarity.text)}>
              {rarity.label}
            </span>
          </div>
          <h5 className="mt-1 truncate text-[15px] font-black tracking-[0.01em] text-cosmic-text">
            {relic.name}
          </h5>
        </div>
        {selected && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cosmic-accent text-cosmic-bg">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="mt-3 inline-flex w-fit rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-cosmic-accent-muted">
        {relic.shortLabel}
      </div>
      <p className="mt-2 text-[12px] leading-snug text-cosmic-text-muted">{relic.description}</p>
    </button>
  );
};
