import React from "react";
import { motion } from "motion/react";
import { Gift, RotateCcw, Sparkles } from "lucide-react";

import type { ActiveRogueliteRun, RogueliteEncounter } from "../../roguelite/types";
import { ChoiceCard } from "./ChoiceCard";
import { PathFork } from "./PathFork";
import {
  BOSS_VISUAL,
  DangerBadge,
  GhostButton,
  type NodeVisual,
  cx,
  nodeVisual,
  usePrefersReducedMotion,
} from "./theme";

const EVENT_VISUAL: NodeVisual = {
  icon: Sparkles,
  short: "Kosmischer Moment",
  text: "text-cosmic-accent",
  soft: "border-cosmic-accent/30 bg-cosmic-accent/12",
  bead: "bg-cosmic-accent",
  glow: "shadow-[0_0_18px_rgba(202,165,254,0.5)]",
};

const REWARD_VISUAL: NodeVisual = {
  icon: Gift,
  short: "Belohnung",
  text: "text-pink-200",
  soft: "border-pink-300/30 bg-pink-400/12",
  bead: "bg-pink-400",
  glow: "shadow-[0_0_18px_rgba(244,114,182,0.5)]",
};

function encounterVisual(nodeType: RogueliteEncounter["nodeType"]): NodeVisual {
  if (nodeType === "event") return EVENT_VISUAL;
  if (nodeType === "boss" || nodeType === "act_boss") return BOSS_VISUAL;
  if (nodeType === "reward") return REWARD_VISUAL;
  return nodeVisual(nodeType);
}

/** The single, dominant ask — this is the screen's focal heading. */
function promptHeadline(encounter: RogueliteEncounter, isBoss: boolean): string {
  if (isBoss) return "Stelle dich dem Boss";
  switch (encounter.nodeType) {
    case "boon":
      return "Wähle einen Bonus";
    case "combat":
    case "elite":
      return "Wähle deine Taktik";
    case "merchant":
      return "Kaufe etwas ein";
    case "rest":
      return "Wähle deine Erholung";
    case "sacrifice":
      return "Opfern oder verschonen?";
    case "anomaly":
      return "Forme die Anomalie";
    case "echo":
      return "Wähle dein Echo";
    case "meteor":
      return "Reite den Meteor";
    case "relic_vault":
      return "Öffne die Kammer";
    case "boss_omen":
      return "Lies das Vorzeichen";
    case "event":
      return "Triff deine Wahl";
    default:
      return "Triff deine Entscheidung";
  }
}

function EncounterHero({
  encounter,
  isBoss,
  bossStageLabel,
}: {
  encounter: RogueliteEncounter;
  isBoss: boolean;
  bossStageLabel: string;
}) {
  const visual = encounterVisual(encounter.nodeType);
  const kicker = isBoss ? bossStageLabel : visual.short;
  return (
    <div className="shrink-0">
      {/* Kicker: node identity + danger (context, small) */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cx(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
            visual.soft,
            visual.text,
          )}
        >
          <visual.icon className="size-3.5 " />
          {kicker}
        </span>
        <DangerBadge danger={encounter.danger} />
      </div>

      {/* The dominant ask */}
      <h3 className="mt-2 text-2xl/tight font-black  tracking-[0.01em] text-cosmic-text sm:text-[2rem]">
        {promptHeadline(encounter, isBoss)}
      </h3>

      {/* One supporting line + optional reward hint */}
      <p className="mt-1 line-clamp-2 max-w-2xl text-[13px] leading-snug text-cosmic-text-muted">
        {encounter.description}
      </p>
      {encounter.rewardHint && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-pink-200">
          <Gift className="size-3.5  shrink-0" />
          <span className="leading-snug">{encounter.rewardHint}</span>
        </div>
      )}
    </div>
  );
}

export const EncounterStage: React.FC<{
  activeRun: ActiveRogueliteRun;
  primaryContent: "path" | "encounter" | "recovery";
  choiceGridClass: string;
  onChooseEncounter: (choiceId: string) => void;
  onChoosePath: (pathId: string) => void;
  onRerollEncounter: () => void;
}> = ({
  activeRun,
  primaryContent,
  choiceGridClass,
  onChooseEncounter,
  onChoosePath,
  onRerollEncounter,
}) => {
  const reducedMotion = usePrefersReducedMotion();
  const isBoss = activeRun.phase === "boss";
  const bossStageLabel =
    activeRun.boss.stage === "act_1"
      ? "Akt-1-Boss"
      : activeRun.boss.stage === "act_2"
        ? "Akt-2-Boss"
        : "Finale";

  const encounter = activeRun.currentEncounter;
  const canReroll =
    activeRun.phase === "node" && activeRun.stats.rerolls > 0 && encounter?.nodeType === "boon";

  const animKey =
    primaryContent === "path"
      ? `path-${activeRun.pathChoices.map((p) => p.id).join(",")}`
      : `enc-${encounter?.id ?? activeRun.phase}`;

  return (
    <div
      data-testid="roguelite-primary-content"
      className="flex h-full min-h-0 flex-col rounded-3xl border border-white/10 bg-cosmic-surface/70 p-4 backdrop-blur-xl sm:p-5"
    >
      <motion.div
        key={animKey}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex h-full min-h-0 flex-col"
      >
        {primaryContent === "path" ? (
          <PathFork pathChoices={activeRun.pathChoices} onChoosePath={onChoosePath} />
        ) : primaryContent === "encounter" && encounter ? (
          <>
            <EncounterHero encounter={encounter} isBoss={isBoss} bossStageLabel={bossStageLabel} />

            {/* Choices — the hero region */}
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto -mx-1 px-1 pt-1 pb-3">
              <div
                data-testid="roguelite-choice-grid"
                className={cx("grid content-start gap-3", choiceGridClass)}
              >
                {encounter.choices.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    onClick={() => onChooseEncounter(choice.id)}
                  />
                ))}
              </div>
            </div>

            {canReroll && (
              <GhostButton onClick={onRerollEncounter} className="mt-3 shrink-0 self-start">
                <RotateCcw className="size-3.5 " />
                Angebote neu würfeln ({activeRun.stats.rerolls})
              </GhostButton>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/15 px-6 py-10 text-center">
            <div className="flex size-14  items-center justify-center rounded-2xl border border-cosmic-accent/30 bg-cosmic-accent/10">
              <Sparkles className="size-6  text-cosmic-accent" />
            </div>
            <h4 className="mt-4 text-xl font-black tracking-[0.01em] text-cosmic-text">
              Run wird vorbereitet
            </h4>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-cosmic-text-muted">
              Der Lauf ist aktiv, aber der nächste Entscheidungsblock ist noch nicht angekommen.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-2 font-mono text-[11px] text-cosmic-accent-muted">
              Phase: {activeRun.phase} • Encounter: {encounter ? "ja" : "nein"} • Pfade:{" "}
              {activeRun.pathChoices.length}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
