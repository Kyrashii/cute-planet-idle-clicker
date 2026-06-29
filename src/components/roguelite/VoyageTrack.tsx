import React from "react";
import { MapPin, Skull } from "lucide-react";

import {
  ROGUELITE_STATIONS_PER_ACT,
  ROGUELITE_TOTAL_ACTS,
  ROGUELITE_TOTAL_STATIONS,
} from "../../roguelite/engine";
import type { ActiveRogueliteRun, RogueliteNodeType } from "../../roguelite/types";
import { BOSS_VISUAL, cx, nodeVisual, usePrefersReducedMotion } from "./theme";

const BOSS_STATIONS = new Set([10, 20, 30]);

type BeadState = "done" | "current" | "upcoming";

function Bead({
  station,
  state,
  type,
  isBoss,
  reducedMotion,
  beadRef,
}: {
  station: number;
  state: BeadState;
  type: RogueliteNodeType | null;
  isBoss: boolean;
  reducedMotion: boolean;
  beadRef?: React.Ref<HTMLDivElement>;
}) {
  const visual = isBoss ? BOSS_VISUAL : type ? nodeVisual(type) : null;

  if (state === "current") {
    const Icon = visual?.icon ?? (isBoss ? Skull : MapPin);
    return (
      <div ref={beadRef} className="relative flex items-center justify-center">
        {!reducedMotion && (
          <span
            className={cx(
              "absolute inline-flex h-9 w-9 rounded-full opacity-60",
              isBoss ? "bg-cosmic-yellow/30" : "bg-cosmic-accent/30",
              "animate-ping",
            )}
          />
        )}
        <span
          className={cx(
            "relative flex h-8 w-8 items-center justify-center rounded-full border-2",
            isBoss
              ? "border-cosmic-yellow bg-cosmic-yellow/20"
              : "border-cosmic-accent bg-cosmic-accent/20",
            visual?.glow,
          )}
        >
          <Icon className={cx("h-4 w-4", isBoss ? "text-cosmic-yellow" : "text-cosmic-text")} />
        </span>
      </div>
    );
  }

  if (isBoss) {
    return (
      <div ref={beadRef} className="flex items-center justify-center">
        <span
          className={cx(
            "flex h-5 w-5 rotate-45 items-center justify-center rounded-[4px] border",
            state === "done"
              ? "border-cosmic-yellow bg-cosmic-yellow shadow-[0_0_14px_rgba(254,240,138,0.6)]"
              : "border-cosmic-yellow/35 bg-cosmic-yellow/10",
          )}
        >
          <Skull
            className={cx(
              "h-2.5 w-2.5 -rotate-45",
              state === "done" ? "text-cosmic-bg" : "text-cosmic-yellow/60",
            )}
          />
        </span>
      </div>
    );
  }

  return (
    <div ref={beadRef} className="flex items-center justify-center">
      <span
        className={cx(
          "h-2.5 w-2.5 rounded-full",
          state === "done"
            ? cx(visual?.bead ?? "bg-cosmic-accent", "shadow-[0_0_8px_rgba(202,165,254,0.4)]")
            : "border border-white/20 bg-white/6",
        )}
      />
    </div>
  );
}

export const VoyageTrack: React.FC<{ activeRun: ActiveRogueliteRun }> = ({ activeRun }) => {
  const reducedMotion = usePrefersReducedMotion();
  const currentRef = React.useRef<HTMLDivElement>(null);

  const completed = activeRun.completedStations;
  const isResultPhase = activeRun.phase === "victory_rewards" || activeRun.phase === "defeat";
  const current = isResultPhase
    ? Math.min(ROGUELITE_TOTAL_STATIONS, completed)
    : Math.min(ROGUELITE_TOTAL_STATIONS, completed + 1);

  const historyTypes = React.useMemo(() => {
    const map = new Map<number, RogueliteNodeType>();
    for (const node of activeRun.history) map.set(node.station, node.type);
    return map;
  }, [activeRun.history]);

  React.useEffect(() => {
    currentRef.current?.scrollIntoView?.({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [current, reducedMotion]);

  const nextBossStation = [10, 20, 30].find((s) => s >= current) ?? 30;
  const stationsToBoss = Math.max(0, nextBossStation - current);
  const bossCaption =
    !isResultPhase && BOSS_STATIONS.has(current) && activeRun.phase === "boss"
      ? "Boss-Station erreicht!"
      : stationsToBoss === 0
        ? `Boss bei Station ${nextBossStation}`
        : `Nächster Boss: Station ${nextBossStation}`;

  const acts = Array.from({ length: ROGUELITE_TOTAL_ACTS }, (_, actIndex) => {
    const start = actIndex * ROGUELITE_STATIONS_PER_ACT + 1;
    return {
      act: actIndex + 1,
      stations: Array.from({ length: ROGUELITE_STATIONS_PER_ACT }, (_, i) => start + i),
    };
  });

  function stateFor(station: number): BeadState {
    if (!isResultPhase && station === current) return "current";
    if (station <= completed) return "done";
    return "upcoming";
  }

  function typeFor(station: number): RogueliteNodeType | null {
    if (station === current && !isResultPhase) {
      return activeRun.currentNode?.type ?? null;
    }
    return historyTypes.get(station) ?? null;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-cosmic-accent-muted">
          Reiseroute
        </div>
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cosmic-pink">
          {bossCaption}
        </div>
      </div>

      <div className="mt-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-start gap-2 px-1">
          {acts.map((group, groupIndex) => {
            const isCurrentAct = activeRun.currentAct === group.act;
            return (
              <React.Fragment key={group.act}>
                {groupIndex > 0 && (
                  <div className="mt-3 h-px w-4 shrink-0 self-start bg-white/10" />
                )}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cx(
                      "rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]",
                      isCurrentAct
                        ? "border-cosmic-accent/45 bg-cosmic-accent/12 text-cosmic-accent"
                        : "border-white/10 bg-white/4 text-cosmic-accent-muted/70",
                    )}
                  >
                    Akt {group.act}
                  </div>
                  <div className="flex items-center">
                    {group.stations.map((station, i) => {
                      const state = stateFor(station);
                      return (
                        <React.Fragment key={station}>
                          {i > 0 && (
                            <span
                              className={cx(
                                "h-[2px] w-4 shrink-0 sm:w-6",
                                station <= completed + 1 ? "bg-cosmic-accent/45" : "bg-white/10",
                              )}
                            />
                          )}
                          <Bead
                            station={station}
                            state={state}
                            type={typeFor(station)}
                            isBoss={BOSS_STATIONS.has(station)}
                            reducedMotion={reducedMotion}
                            beadRef={state === "current" ? currentRef : undefined}
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
