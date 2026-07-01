import React from "react";
import { Modal } from "../ui/Modal";

interface CheatEventModalProps {
  isOpen: boolean;
  currentPlanetLevel: number;
  onSetPlanetLevel: (level: number) => void;
  onSelectEvent: (
    event:
      | "comet_tail"
      | "nebula_cloud"
      | "stella_nursery"
      | "hyper_star"
      | "black_hole"
      | "meteors"
      | "aurora"
      | "shooting_stars"
      | "supernova",
  ) => void;
  onClose: () => void;
}

export const CheatEventModal: React.FC<CheatEventModalProps> = React.memo(
  ({ isOpen, currentPlanetLevel, onSetPlanetLevel, onSelectEvent, onClose }) => {
    const [planetLevelInput, setPlanetLevelInput] = React.useState(String(currentPlanetLevel));

    const handleSetPlanetLevel = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const parsedLevel = Number(planetLevelInput);
      if (!Number.isFinite(parsedLevel)) {
        return;
      }

      const nextLevel = Math.min(20, Math.max(1, Math.trunc(parsedLevel)));
      setPlanetLevelInput(String(nextLevel));
      onSetPlanetLevel(nextLevel);
    };

    const events = [
      {
        id: "comet_tail",
        emoji: "☄️",
        title: "Eisiger Kometenschweif",
        desc: "Massiver +800% Klick-Segen & epische Sternenbroesel-EXP!",
        color: "border-red-500 hover:bg-red-500/10 text-red-100",
      },
      {
        id: "nebula_cloud",
        emoji: "☁️",
        title: "Interstellare Nebelwolke",
        desc: "Sterne fliegen +550% schneller & 3x Planeten-EXP!",
        color: "border-teal-400 hover:bg-teal-400/10 text-teal-100",
      },
      {
        id: "stella_nursery",
        emoji: "🍼",
        title: "Kosmische Sternenwiege",
        desc: "Tiere brueten +550% passiv, reichlicher Kistensturz!",
        color: "border-cyan-400 hover:bg-cyan-400/10 text-cyan-100",
      },
      {
        id: "hyper_star",
        emoji: "🌟",
        title: "Energetischer Helio-Sturm",
        desc: "+400% Planeteneinnahmen & sagenhafte 6x EP-Generierung!",
        color: "border-amber-400 hover:bg-amber-400/10 text-amber-100",
      },
      {
        id: "black_hole",
        emoji: "🕳️",
        title: "Schwarzes Loch (NEU)",
        desc: "Das riskante Endgame-System! Opfere & erhalte Segen oder Verluste!",
        color: "border-purple-500 hover:bg-purple-500/10 text-purple-100",
      },
    ] as const;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        panelClassName="bg-cosmic-bg-mid/95 border-3 border-cosmic-accent rounded-3.5xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(171,159,210,0.25)] text-cosmic-accent relative overflow-hidden"
      >
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 size-48  rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-48  rounded-full bg-cosmic-pink/10 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-600 text-white border border-black/30 font-mono leading-none animate-pulse">
              UGUU EDIT-MODUS 🧙‍♀️
            </span>
            <h5 className="font-sans font-black text-brand-pink text-base uppercase tracking-wider mt-1">
              Kosmisches Ereignis ausloesen
            </h5>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-lg leading-none p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="font-sans text-[11px] text-cosmic-accent-muted font-semibold leading-relaxed mb-4">
          Waehle ein stellares Ereignis, das sofort im Himmel erbluehen soll. Keine Wartezeit, pure
          Magie!
        </p>

        <form
          onSubmit={handleSetPlanetLevel}
          className="mb-4 rounded-2xl border-2 border-purple-400/40 bg-black/30 p-3"
        >
          <label
            htmlFor="cheat-planet-level"
            className="mb-2 block font-mono text-[10px] font-black uppercase tracking-wider text-purple-200"
          >
            Planetenlevel direkt setzen
          </label>
          <div className="flex gap-2">
            <input
              id="cheat-planet-level"
              type="number"
              min={1}
              max={20}
              step={1}
              value={planetLevelInput}
              onChange={(event) => setPlanetLevelInput(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border-2 border-cosmic-accent/50 bg-cosmic-bg px-3 py-2 font-mono text-sm font-black text-white outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-400/30"
              aria-describedby="cheat-planet-level-hint"
            />
            <button
              type="submit"
              className="rounded-xl border-2 border-purple-300/60 bg-purple-600 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-purple-500 active:scale-95 cursor-pointer"
            >
              Setzen
            </button>
          </div>
          <p
            id="cheat-planet-level-hint"
            className="mt-1.5 font-sans text-[9px] font-semibold text-cosmic-accent-muted"
          >
            Erlaubt sind Level 1 bis 20. Aktuell: {currentPlanetLevel}
          </p>
        </form>

        <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => {
                onSelectEvent(ev.id);
                onClose();
              }}
              className={`w-full p-2.5 rounded-2xl border-2 bg-black/40 text-left flex items-start gap-3 transition-all active:scale-98 cursor-pointer ${ev.color}`}
            >
              <span className="text-3xl select-none shrink-0 mt-0.5">{ev.emoji}</span>
              <div>
                <h6 className="font-sans font-black text-xs/tight uppercase tracking-wide ">
                  {ev.title}
                </h6>
                <p className="text-[10px] font-medium leading-normal opacity-85 mt-0.5">
                  {ev.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-cosmic-surface-mid hover:bg-cosmic-surface-hover text-[11px] border-2 border-cosmic-accent/60 rounded-xl font-black transition-all active:scale-95 cursor-pointer shadow-md text-white"
          >
            Schliessen
          </button>
        </div>
      </Modal>
    );
  },
);

CheatEventModal.displayName = "CheatEventModal";
