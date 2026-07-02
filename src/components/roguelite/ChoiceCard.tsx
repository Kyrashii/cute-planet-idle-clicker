import React from "react";
import { AlertTriangle, ArrowUpRight, Coins, Gift, Sparkles, type LucideIcon } from "lucide-react";

import type { RogueliteChoice } from "../../roguelite/types";
import { CUTE_CARD, cx } from "./theme";

const PreviewRow: React.FC<{ icon: LucideIcon; text: string; tone: string }> = ({
  icon: Icon,
  text,
  tone,
}) => {
  return (
    <div className="flex items-start gap-2">
      <Icon className={cx("mt-0.5 size-3.5  shrink-0", tone)} />
      <span className="text-[12px] leading-snug text-cosmic-text/90">{text}</span>
    </div>
  );
};

export const ChoiceCard: React.FC<{
  choice: RogueliteChoice;
  onClick: () => void;
}> = ({ choice, onClick }) => {
  const preview = choice.preview;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="roguelite-choice-card"
      className={cx(
        "group flex h-full flex-col p-4 text-left transition sm:p-5",
        CUTE_CARD,
        "hover:-translate-y-1 hover:border-cosmic-accent/60 hover:bg-cosmic-surface-hover/85 hover:shadow-[0_14px_30px_rgba(8,6,22,0.55)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-accent/70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h5 className="text-[16px] font-black leading-tight tracking-[0.01em] text-cosmic-text sm:text-[17px]">
          {choice.title}
        </h5>
        {choice.effectLabel && (
          <span className="shrink-0 rounded-full border border-cosmic-accent/30 bg-cosmic-accent/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-cosmic-accent">
            {choice.effectLabel}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[12.5px] leading-snug text-cosmic-text-muted">
        {choice.description}
      </p>

      {preview && (
        <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
          {preview.gains.map((g) => (
            <PreviewRow key={`g-${g}`} icon={ArrowUpRight} text={g} tone="text-emerald-300" />
          ))}
          {preview.costs.map((c) => (
            <PreviewRow key={`c-${c}`} icon={Coins} text={c} tone="text-amber-300" />
          ))}
          {preview.risks.map((r) => (
            <PreviewRow key={`r-${r}`} icon={AlertTriangle} text={r} tone="text-rose-300" />
          ))}
        </div>
      )}

      {(preview?.synergyHint || preview?.rewardPreview) && (
        <div className="mt-auto space-y-1.5 pt-3">
          {preview?.synergyHint && (
            <div className="flex items-start gap-2 rounded-xl border border-cosmic-accent/20 bg-cosmic-accent/7 px-2.5 py-1.5">
              <Sparkles className="mt-0.5 size-3.5  shrink-0 text-cosmic-accent" />
              <span className="text-[11px] leading-snug text-cosmic-text/90">
                {preview.synergyHint}
              </span>
            </div>
          )}
          {preview?.rewardPreview && (
            <div className="flex items-start gap-2 rounded-xl border border-pink-300/20 bg-pink-400/8 px-2.5 py-1.5">
              <Gift className="mt-0.5 size-3.5  shrink-0 text-pink-300" />
              <span className="text-[11px] leading-snug text-cosmic-text/90">
                {preview.rewardPreview}
              </span>
            </div>
          )}
        </div>
      )}
    </button>
  );
};
