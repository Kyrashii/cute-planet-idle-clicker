import React from "react";
import { BookOpen, ChevronLeft, Plus, Rocket, Sparkles, X } from "lucide-react";

import { ROGUELITE_RELICS } from "../../roguelite/data";
import type { RogueliteMetaState } from "../../roguelite/types";
import { RelicCard } from "./RelicCard";
import { Eyebrow, GhostButton, Panel, PrimaryButton, RARITY_VISUALS, cx } from "./theme";

const MAX_RELICS = 3;

const TraySlot: React.FC<{ relicId?: string; onRemove?: () => void }> = ({ relicId, onRemove }) => {
  if (!relicId) {
    return (
      <div className="flex h-full min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-black/15 px-3 text-cosmic-accent-muted">
        <Plus className="size-4  opacity-60" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60">Leer</span>
      </div>
    );
  }
  const relic = ROGUELITE_RELICS.find((entry) => entry.id === relicId);
  const rarity = relic ? RARITY_VISUALS[relic.rarity] : null;
  return (
    <div className="flex h-full min-h-13 flex-1 items-center gap-2 rounded-2xl border border-cosmic-accent/45 bg-cosmic-accent/10 px-3 py-2 shadow-[0_0_22px_rgba(202,165,254,0.18)]">
      <Sparkles className={cx("size-4  shrink-0", rarity?.text ?? "text-cosmic-accent")} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-black text-cosmic-text">
          {relic?.name ?? relicId}
        </div>
        <div className="truncate text-[10px] text-cosmic-accent-muted">{relic?.shortLabel}</div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${relic?.name ?? relicId} entfernen`}
          className="flex size-6  shrink-0 items-center justify-center rounded-full border border-white/15 text-cosmic-text-muted transition hover:border-rose-300/50 hover:text-rose-200"
        >
          <X className="size-3.5 " />
        </button>
      )}
    </div>
  );
};

export const RelicDraft: React.FC<{
  meta: RogueliteMetaState;
  selectedRelicIds: string[];
  onToggleRelic: (relicId: string) => void;
  onBackToIntro: () => void;
  onOpenArchive: () => void;
  onStartRun: () => void;
}> = ({ meta, selectedRelicIds, onToggleRelic, onBackToIntro, onOpenArchive, onStartRun }) => {
  const maxSelectable = Math.min(MAX_RELICS, meta.unlockedRelics.length);
  const canStart = selectedRelicIds.length > 0 && selectedRelicIds.length <= maxSelectable;

  return (
    <Panel className="mx-auto flex size-full  max-w-5xl flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Reliktwahl</Eyebrow>
          <h3 className="mt-1.5 text-2xl font-black tracking-[0.01em] text-cosmic-text">
            Waehle bis zu 3 Start-Relikte
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-cosmic-text-muted">
            Deine freigeschalteten Relikte prägen den ganzen Lauf von der ersten Station an.
          </p>
        </div>
        <div className="rounded-full border border-cosmic-accent/35 bg-cosmic-accent/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-cosmic-accent">
          {selectedRelicIds.length}/{MAX_RELICS} gewählt
        </div>
      </div>

      {/* Loadout tray */}
      <div className="mt-4 flex items-stretch gap-2.5">
        {Array.from({ length: MAX_RELICS }).map((_, index) => {
          const relicId = selectedRelicIds[index];
          return (
            <TraySlot
              key={relicId ? `${relicId}-${index}` : `empty-${index}`}
              relicId={relicId}
              onRemove={relicId ? () => onToggleRelic(relicId) : undefined}
            />
          );
        })}
      </div>

      {/* Pool */}
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto -mx-1 px-1 pt-1 pb-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meta.unlockedRelics.map((relicId) => (
            <RelicCard
              key={relicId}
              relicId={relicId}
              selected={selectedRelicIds.includes(relicId)}
              onClick={() => onToggleRelic(relicId)}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <GhostButton onClick={onBackToIntro}>
            <ChevronLeft className="size-4 " />
            Zurück
          </GhostButton>
          <GhostButton onClick={onOpenArchive}>
            <BookOpen className="size-4 " />
            Archiv
          </GhostButton>
        </div>
        <PrimaryButton onClick={onStartRun} disabled={!canStart}>
          <Rocket className="size-4 " />
          Run starten
        </PrimaryButton>
      </div>
    </Panel>
  );
};
