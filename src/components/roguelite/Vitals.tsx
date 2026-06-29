import React from "react";
import {
  Coins,
  Crown,
  Dices,
  Gauge,
  Heart,
  HeartPulse,
  MousePointerClick,
  PawPrint,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { RogueliteRunStats } from "../../roguelite/types";
import { Meter, cx } from "./theme";

function StatChip({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-2.5 py-1.5">
      <Icon className={cx("size-4  shrink-0", iconClass)} />
      <div className="min-w-0">
        <div className="truncate text-[13px] font-black leading-none text-cosmic-text">{value}</div>
        <div className="mt-0.5 truncate font-mono text-[9px] font-bold uppercase tracking-widest text-cosmic-accent-muted">
          {label}
        </div>
      </div>
    </div>
  );
}

/** Compact secondary metric (icon + value + label), no bar. */
function MiniMetric({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/20 px-2.5 py-1.5">
      <Icon className={cx("size-3.5  shrink-0", iconClass)} />
      <span className="text-[12px] font-black leading-none text-cosmic-text">{value}</span>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-cosmic-accent-muted">
        {label}
      </span>
    </div>
  );
}

/**
 * Slim survival strip for the run screen — only the trio that matters while
 * deciding (Leben as a bar, Schild + Druck as compact chips). Detail stats live
 * in the Details rail/sheet via {@link StatGrid}.
 */
export const SurvivalStrip: React.FC<{ stats: RogueliteRunStats }> = ({ stats }) => {
  const life = Math.round(stats.runLife);
  const maxLife = Math.round(stats.maxLife);
  const shield = Math.round(stats.runShield);
  const pressure = Math.round(stats.cometPressure);
  const pressureFill =
    pressure >= 70 ? "text-rose-300" : pressure >= 40 ? "text-amber-300" : "text-emerald-300";

  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 flex-2 items-center gap-2.5 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5">
        <Heart className="size-4  shrink-0 text-rose-300" />
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-cosmic-accent-muted">
          Leben
        </span>
        <Meter
          value={life}
          max={maxLife}
          fillClass="bg-gradient-to-r from-rose-500 to-rose-300"
          className="h-2 flex-1"
        />
        <span className="shrink-0 text-[12px] font-black text-cosmic-text">
          {life}
          <span className="text-cosmic-accent-muted">/{maxLife}</span>
        </span>
      </div>
      <MiniMetric icon={Shield} label="Schild" value={`${shield}`} iconClass="text-violet-300" />
      <MiniMetric icon={Gauge} label="Druck" value={`${pressure}`} iconClass={pressureFill} />
    </div>
  );
};

/** The detail stats, rendered inside the Details rail/sheet. */
export const StatGrid: React.FC<{ stats: RogueliteRunStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <StatChip
        icon={MousePointerClick}
        label="Klicks"
        value={`${Math.round(stats.runClicks)}`}
        iconClass="text-pink-300"
      />
      <StatChip
        icon={PawPrint}
        label="Passiv"
        value={`${Math.round(stats.runPassive)}`}
        iconClass="text-emerald-300"
      />
      <StatChip
        icon={Crown}
        label="Boss"
        value={`${Math.round(stats.bossDamage)}`}
        iconClass="text-cosmic-yellow"
      />
      <StatChip
        icon={Zap}
        label="Crit"
        value={`${Math.round(stats.runCritChance * 100)}%·×${stats.runCritPower.toFixed(1)}`}
        iconClass="text-amber-300"
      />
      <StatChip
        icon={Coins}
        label="Staub"
        value={`${Math.round(stats.crystalDust)}`}
        iconClass="text-indigo-300"
      />
      <StatChip icon={Dices} label="Rerolls" value={`${stats.rerolls}`} iconClass="text-cyan-300" />
      <StatChip
        icon={HeartPulse}
        label="Heilung"
        value={`${stats.healCharges}`}
        iconClass="text-rose-300"
      />
    </div>
  );
};
