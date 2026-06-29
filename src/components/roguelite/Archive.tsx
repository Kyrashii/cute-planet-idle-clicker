import React from "react";
import { ChevronLeft } from "lucide-react";

import { ROGUELITE_RELICS } from "../../roguelite/data";
import type { RogueliteMetaState } from "../../roguelite/types";
import { RelicCard } from "./RelicCard";
import { Eyebrow, GhostButton, Panel } from "./theme";

export const Archive: React.FC<{
  meta: RogueliteMetaState;
  onCloseArchive: () => void;
}> = ({ meta, onCloseArchive }) => {
  const unlocked = new Set(meta.unlockedRelics);

  return (
    <Panel className="mx-auto flex h-full w-full max-w-5xl flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Reliktarchiv</Eyebrow>
          <h3 className="mt-1.5 text-2xl font-black tracking-[0.01em] text-cosmic-text">
            Deine Sammlung
          </h3>
          <p className="mt-1 max-w-2xl text-[13px] leading-snug text-cosmic-text-muted">
            Gewinne Läufe, um neue Relikte freizuschalten. Gesperrte Relikte zeigen schon, was
            später möglich wird.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-cosmic-accent-muted">
            {unlocked.size}/{ROGUELITE_RELICS.length} frei
          </div>
          <GhostButton onClick={onCloseArchive}>
            <ChevronLeft className="h-4 w-4" />
            Zur Reliktwahl
          </GhostButton>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto -mx-1 px-1 pt-1 pb-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROGUELITE_RELICS.map((relic) => (
            <RelicCard key={relic.id} relicId={relic.id} locked={!unlocked.has(relic.id)} />
          ))}
        </div>
      </div>
    </Panel>
  );
};
