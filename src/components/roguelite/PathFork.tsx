import React from "react";
import { GitFork, Gift, Route, TriangleAlert } from "lucide-react";

import type { RoguelitePathChoice } from "../../roguelite/types";
import { DangerBadge, Eyebrow, IconBadge, cx, nodeVisual } from "./theme";

const PathCard: React.FC<{ pathChoice: RoguelitePathChoice; onClick: () => void }> = ({
  pathChoice,
  onClick,
}) => {
  const visual = nodeVisual(pathChoice.node.type);
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="roguelite-path-card"
      className={cx(
        "group flex h-full flex-col rounded-2xl border border-white/10 bg-cosmic-surface-mid/70 p-4 text-left transition",
        "hover:-translate-y-0.5 hover:border-cosmic-accent/45 hover:bg-cosmic-surface-hover/80 hover:shadow-[0_18px_38px_rgba(8,6,22,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-accent/60",
      )}
    >
      <div className="flex items-start gap-3">
        <IconBadge visual={visual} />
        <div className="min-w-0 flex-1">
          <div className={cx("text-[9px] font-black uppercase tracking-[0.16em]", visual.text)}>
            {visual.short}
          </div>
          <h5 className="mt-0.5 text-[15px] font-black leading-tight text-cosmic-text">
            {pathChoice.node.label}
          </h5>
        </div>
        <DangerBadge danger={pathChoice.node.danger} />
      </div>

      <p className="mt-2.5 text-[12.5px] leading-snug text-cosmic-text-muted">
        {pathChoice.node.description}
      </p>

      <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
        <div className="flex items-start gap-2">
          <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-300" />
          <span className="text-[12px] leading-snug text-cosmic-text/90">
            {pathChoice.rewardPreview}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
          <span className="text-[12px] leading-snug text-cosmic-text/90">
            {pathChoice.riskPreview}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Route className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cosmic-accent" />
          <span className="text-[12px] leading-snug text-cosmic-text/90">
            {pathChoice.routeHint}
          </span>
        </div>
      </div>
    </button>
  );
};

export const PathFork: React.FC<{
  pathChoices: RoguelitePathChoice[];
  onChoosePath: (pathId: string) => void;
}> = ({ pathChoices, onChoosePath }) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cosmic-accent/30 bg-cosmic-accent/10 px-3 py-1">
        <GitFork className="h-3.5 w-3.5 text-cosmic-accent" />
        <Eyebrow className="text-cosmic-accent">Weggabelung</Eyebrow>
      </div>
      <h4 className="mt-3 text-xl font-black tracking-[0.01em] text-cosmic-text sm:text-2xl">
        Wähle deine Route
      </h4>
      <p className="mt-1.5 max-w-2xl text-[13px] leading-snug text-cosmic-text-muted">
        Nimm die Linie, die nicht nur jetzt gut aussieht, sondern den restlichen Akt wirklich trägt.
      </p>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto -mx-1 px-1 pt-1 pb-3">
        <div data-testid="roguelite-path-grid" className="grid gap-3 sm:grid-cols-2">
          {pathChoices.map((pathChoice) => (
            <PathCard
              key={pathChoice.id}
              pathChoice={pathChoice}
              onClick={() => onChoosePath(pathChoice.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
