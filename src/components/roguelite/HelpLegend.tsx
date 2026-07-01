import React from "react";
import { Crown, Map, Swords, X } from "lucide-react";

import { ROGUELITE_NODE_LABELS } from "../../roguelite/data";
import type { RogueliteNodeType } from "../../roguelite/types";
import { Modal } from "../ui/Modal";
import { DANGER_VISUALS, DangerBadge, Eyebrow, IconBadge, cx, nodeVisual } from "./theme";

const NODE_ORDER: RogueliteNodeType[] = [
  "boon",
  "combat",
  "elite",
  "anomaly",
  "rest",
  "merchant",
  "relic_vault",
  "sacrifice",
  "echo",
  "meteor",
  "boss_omen",
];

const STAT_HELP: { label: string; text: string }[] = [
  { label: "Leben / Schild", text: "Deine Sicherheit. Fällt das Leben auf 0, endet der Run." },
  { label: "Druck", text: "Kometendruck. Wird er zu hoch, drohen Flüche." },
  { label: "Klicks / Passiv / Boss", text: "Dein Schaden gegen Stationen und Bosse." },
  { label: "Crit", text: "Chance und Stärke kritischer Treffer." },
  { label: "Staub", text: "Kristallstaub – Währung bei Händlern." },
  { label: "Rerolls", text: "Würfelt die Angebote an Bonus-Stationen neu." },
  { label: "Heilung", text: "Heilladungen füllen dein Leben wieder auf." },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function LoopStep({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Swords;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <Icon className="mt-0.5 size-4  shrink-0 text-cosmic-accent" />
      <div>
        <div className="text-[13px] font-black text-cosmic-text">{title}</div>
        <div className="text-[11.5px] leading-snug text-cosmic-text-muted">{body}</div>
      </div>
    </div>
  );
}

/** Shared legend body — also usable outside the modal if needed. */
export const RunLegendContent: React.FC = () => {
  return (
    <div className="space-y-5">
      <Section title="So läuft ein Run">
        <div className="grid gap-2 sm:grid-cols-3">
          <LoopStep icon={Swords} title="1 · Draften" body="Wähle bis zu drei Start-Relikte." />
          <LoopStep icon={Map} title="2 · Reisen" body="Triff an jeder Station eine Wahl." />
          <LoopStep
            icon={Crown}
            title="3 · Bosse"
            body="Bei Station 10, 20 und 30 wartet ein Boss."
          />
        </div>
      </Section>

      <Section title="Stationen">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {NODE_ORDER.map((type) => {
            const visual = nodeVisual(type);
            return (
              <div
                key={type}
                className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/20 px-2.5 py-2"
              >
                <IconBadge visual={visual} size="sm" />
                <div className="min-w-0">
                  <div className={cx("text-[12px] font-black", visual.text)}>
                    {ROGUELITE_NODE_LABELS[type].label}
                  </div>
                  <div className="text-[11px] leading-snug text-cosmic-text-muted">
                    {ROGUELITE_NODE_LABELS[type].description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Gefahr">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DANGER_VISUALS) as (keyof typeof DANGER_VISUALS)[]).map((danger) => (
            <DangerBadge key={danger} danger={danger} />
          ))}
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-cosmic-text-muted">
          Mehr Gefahr bedeutet höheres Risiko, aber meist auch bessere Belohnungen.
        </p>
      </Section>

      <Section title="Deine Werte">
        <div className="space-y-1.5">
          {STAT_HELP.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            >
              <span className="text-[12px] font-black text-cosmic-text">{stat.label}</span>
              <span className="text-[11.5px] text-cosmic-text-muted"> — {stat.text}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export const HelpLegend: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      skipFrameTarget
      backdropClassName="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-cosmic-bg-deep/80 backdrop-blur-sm overflow-y-auto"
      panelClassName="relative w-full max-w-2xl rounded-3xl border border-white/12 bg-cosmic-surface text-cosmic-text shadow-[0_30px_90px_rgba(6,4,16,0.7)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <Eyebrow>Galaxie-Roguelite</Eyebrow>
          <h3 className="mt-0.5 text-lg font-black tracking-[0.01em] text-cosmic-text">
            Hilfe & Legende
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hilfe schliessen"
          className="flex size-9  items-center justify-center rounded-2xl border border-white/12 bg-white/4 text-cosmic-text-muted transition hover:border-cosmic-accent/40 hover:text-cosmic-text"
        >
          <X className="size-4 " />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
        <RunLegendContent />
      </div>
    </Modal>
  );
};
