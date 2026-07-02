import React from "react";
import { Rocket, Sparkles, Target } from "lucide-react";

import { ROGUELITE_TOTAL_STATIONS } from "../../roguelite/engine";
import type { RogueliteMetaState } from "../../roguelite/types";
import { CUTE_CARD, Eyebrow, Panel, PrimaryButton, cx } from "./theme";

/** The cute crew that appears across the run — a small welcome parade. */
const PARADE = [
  "/assets/animals/chick.webp",
  "/assets/animals/fox.webp",
  "/assets/animals/octopus.webp",
  "/assets/animals/sloth.webp",
  "/assets/animals/whale.webp",
  "/assets/animals/dragon.webp",
];

function Step({
  index,
  mascot,
  title,
  body,
  tint,
}: {
  index: number;
  mascot: string;
  title: string;
  body: string;
  tint: string;
}) {
  return (
    <div className={cx("relative flex flex-col p-4", CUTE_CARD)}>
      <span className="absolute right-3 top-3 font-mono text-[11px] font-black text-white/15">
        0{index}
      </span>
      <div
        className={cx(
          "flex size-14  items-center justify-center rounded-2xl border-2 bg-black/25",
          tint,
        )}
      >
        <img
          src={mascot}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="size-11 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
          referrerPolicy="no-referrer"
        />
      </div>
      <h4 className="mt-3 text-[15px] font-black tracking-[0.01em] text-cosmic-text">{title}</h4>
      <p className="mt-1 text-[12.5px] leading-snug text-cosmic-text-muted">{body}</p>
    </div>
  );
}

function MetaStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center">
      <div className={cx("text-xl font-black tracking-[0.01em]", tone)}>{value}</div>
      <div className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cosmic-accent-muted">
        {label}
      </div>
    </div>
  );
}

export const IntroHub: React.FC<{
  meta: RogueliteMetaState;
  onBeginRunSetup: () => void;
}> = ({ meta, onBeginRunSetup }) => {
  return (
    <Panel className="mx-auto flex size-full  max-w-5xl flex-col overflow-y-auto p-6 sm:p-8">
      <div className="mx-auto w-full max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cosmic-accent/30 bg-cosmic-accent/10 px-3 py-1">
          <Sparkles className="size-3.5  text-cosmic-accent" />
          <Eyebrow className="text-cosmic-accent">Galaxie-Roguelite</Eyebrow>
        </div>
        <h2 className="mt-4 text-3xl font-black leading-[1.05] tracking-[0.01em] text-cosmic-text sm:text-5xl">
          30 Stationen. 3 Akte.
          <br />
          <span className="bg-[linear-gradient(120deg,#ffc8e6,#caa5fe_55%,#9db8ff)] bg-clip-text text-transparent">
            Ein neuer Build pro Run.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[13.5px] leading-relaxed text-cosmic-text-muted">
          Drafte deine Relikte, reise durch drei Akte und triff in jeder Station eine klare
          Entscheidung. Jeder Lauf formt einen neuen Build.
        </p>

        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-2xl border border-cosmic-yellow/30 bg-cosmic-yellow/8 px-4 py-2">
          <Target className="size-4  text-cosmic-yellow" />
          <span className="text-[12.5px] font-bold text-cosmic-text">
            Ziel: Erreiche Station {ROGUELITE_TOTAL_STATIONS} und besiege die drei Bosse.
          </span>
        </div>
      </div>

      <div className="mx-auto mt-7 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
        <Step
          index={1}
          mascot="/assets/animals/raccoon.webp"
          title="Relikte draften"
          body="Wähle bis zu drei Start-Relikte. Sie prägen deinen Lauf von der ersten Station an."
          tint="border-pink-300/30 text-pink-200"
        />
        <Step
          index={2}
          mascot="/assets/animals/fox.webp"
          title="Stationen bereisen"
          body="Jede Station ist eine Wahl: Boni, Kämpfe, Händler, Rast. Lies Gefahr und Belohnung."
          tint="border-cosmic-accent/30 text-cosmic-accent"
        />
        <Step
          index={3}
          mascot="/assets/animals/dragon.webp"
          title="Drei Bosse stürzen"
          body="Akt-Bosse warten bei Station 10 und 20, das große Finale bei Station 30."
          tint="border-cosmic-yellow/30 text-cosmic-yellow"
        />
      </div>

      <div className="mx-auto mt-5 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        <MetaStat
          label="Höchste Station"
          value={`${meta.highestStation}/${ROGUELITE_TOTAL_STATIONS}`}
          tone="text-cosmic-pink"
        />
        <MetaStat label="Siege" value={`${meta.wins}`} tone="text-emerald-200" />
        <MetaStat
          label="Relikte frei"
          value={`${meta.unlockedRelics.length}`}
          tone="text-cosmic-accent"
        />
      </div>

      <div className="mx-auto mt-6 flex items-end justify-center gap-1.5">
        {PARADE.map((mascot, i) => (
          <img
            key={mascot}
            src={mascot}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cx(
              "object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]",
              i % 2 === 0 ? "size-9" : "size-11",
            )}
            referrerPolicy="no-referrer"
          />
        ))}
      </div>

      <div className="mx-auto mt-4 w-full max-w-md">
        <PrimaryButton onClick={onBeginRunSetup} className="w-full py-4">
          <Rocket className="size-4 " />
          Start
        </PrimaryButton>
      </div>
    </Panel>
  );
};
