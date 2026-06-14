import React from "react";
import { motion } from "motion/react";

interface ConstellationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  moonsCount: number;
  constellations: Record<string, number>;
  onInvestConstellation: (constellationId: string, starsCost: number, moonsCost: number) => void;
  formatCompactNumber: (num: number) => string;
}

export interface ConstellationDef {
  id: string;
  name: string;
  germanName: string;
  emoji: string;
  baseStarsCost: number;
  baseMoonsCost: number;
  maxLevel: number;
  bonusText: string;
  germanDescription: string;
}

export const CONSTELLATIONS_LIST: ConstellationDef[] = [
  {
    id: "kuschel",
    name: "Cuddle Constellation",
    germanName: "Kuschel-Sternbild",
    emoji: "🧸",
    baseStarsCost: 10,
    baseMoonsCost: 0,
    maxLevel: 5,
    bonusText: "+10% Tier-Produktion pro Stufe",
    germanDescription: "Eine kuschelige Himmelsgruppe, die eine schützende Aura spendet. Sie ermutigt alle deine Tiere, glücklicher zu sein und passive Lebensenergie zu produzieren.",
  },
  {
    id: "mondhasen",
    name: "Moon Bunny Constellation",
    germanName: "Mondhasen-Sternbild",
    emoji: "🐇",
    baseStarsCost: 25,
    baseMoonsCost: 1,
    maxLevel: 3,
    bonusText: "+25% längere Nachtphase pro Stufe",
    germanDescription: "Die Gestalt eines flinken Mondhasen. Verlängert die wunderschöne Nacht-Phase, in der deine Sterne mit +50% erhöhter Kraft leuchten.",
  },
  {
    id: "supernova",
    name: "Supernova Constellation",
    germanName: "Supernova-Sternbild",
    emoji: "💥",
    baseStarsCost: 100,
    baseMoonsCost: 0,
    maxLevel: 3,
    bonusText: "+20% stärkere kosmische Events pro Stufe",
    germanDescription: "Eine energetische Kraftquelle am Himmelszelt. verstärkt die Erträge und Effekte aller aktiven Events (z.B. Sternschnuppen, Polarlichter und Meteoritenstürme).",
  },
  {
    id: "stardust_rain",
    name: "Stardust Cascade",
    germanName: "Sternenregen-Sternbild",
    emoji: "💫",
    baseStarsCost: 20,
    baseMoonsCost: 0,
    maxLevel: 5,
    bonusText: "+15% mehr Planeten-EXP pro Stufe",
    germanDescription: "Eine funkelnde Kaskade von Sternenlicht. Lässt deinen Planeten beim Klicken und automatischen Tappen deutlich schneller Erfahrung sammeln.",
  },
  {
    id: "cosmic_harmony",
    name: "Cosmic Harmony",
    germanName: "Kosmische Harmonie",
    emoji: "🌌",
    baseStarsCost: 40,
    baseMoonsCost: 2,
    maxLevel: 3,
    bonusText: "+8% Klick- & Star-Schlagkraft pro Stufe",
    germanDescription: "Die perfekte Ausrichtung von Sternen und Monden im Einklang. Erhöht die manuelle Schlagkraft deiner Klicks sowie den Ertrag deiner Gravitations-Sterne.",
  },
  {
    id: "ewiges_polarlicht",
    name: "Eternal Aurorabeam",
    germanName: "Ewiges Polarlicht",
    emoji: "🔮",
    baseStarsCost: 50,
    baseMoonsCost: 0,
    maxLevel: 3,
    bonusText: "-15% Wartezeit zwischen Events pro Stufe",
    germanDescription: "Ein unaufhörliches kosmisches Leuchten. Zieht kosmische Ereignisse magisch an, sodass die coolen Events deutlich schneller hintereinander auftreten.",
  },
];

export const ConstellationsModal: React.FC<ConstellationsModalProps> = ({
  isOpen,
  onClose,
  starsCount,
  moonsCount,
  constellations,
  onInvestConstellation,
  formatCompactNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="modal-frame-target bg-[#141235]/95 backdrop-blur-md rounded-3.5xl border-3 border-cyan-400/90 flex flex-col max-w-xl w-full max-h-[85vh] shadow-2xl overflow-hidden text-[#ffeef4]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-3 border-cyan-400/55 bg-gradient-to-r from-[#110e2f] via-[#1b1747] to-[#110e2f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">✨</span>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-300 block">Sternen-Karten</span>
              <h4 className="font-sans font-black text-[#ffeef4] text-sm uppercase tracking-wide">
                Sternbilder freischalten
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b1836] border-2 border-cyan-400 flex items-center justify-center font-bold text-lg text-white hover:bg-[#252148] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Available Currency HUD Row */}
        <div className="px-5 py-3.5 bg-[#0f0c29]/95 border-b border-cyan-500/20 flex gap-4 items-center justify-around shrink-0 text-xs text-slate-200">
          <div className="flex items-center gap-1.5 bg-[#1b1743] px-3 py-1.5 rounded-xl border border-amber-300/40 font-mono">
            <span>Verfügbare Sterne:</span>
            <strong className="text-amber-200 font-extrabold text-sm flex items-center gap-0.5">
              ⭐ {starsCount}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1b1743] px-3 py-1.5 rounded-xl border border-purple-400/40 font-mono">
            <span>Verfügbare Monde:</span>
            <strong className="text-purple-300 font-extrabold text-sm flex items-center gap-0.5">
              🌙 {moonsCount}
            </strong>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 flex-grow overflow-y-auto space-y-4 pr-2 select-none">
          {/* Constellation explanation banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-400/10 border-2 border-cyan-400/30 text-xs leading-relaxed text-slate-200">
            <span className="font-black text-cyan-205 flex items-center gap-1 uppercase tracking-wide text-[10.5px]">
              🌌 Was bewirken Sternbilder?
            </span>
            <b className="text-white mt-1 block font-semibold text-[11px]">
              Sterne dienen hier als Fortschrittsmaterial!
            </b>
            <p className="text-[#ab9fd2] text-[10.5px] mt-0.5">
              Investiere deine gesammelten Sterne und Monde permanent in wunderschöne kosmische Konstellationen. Sie geben dir mächtige, dauerhafte Multiplikatoren, die auch nach einem Prestige aktiv bleiben!
            </p>
          </div>

          <div className="space-y-3">
            {CONSTELLATIONS_LIST.map((constell) => {
              const currentLevel = constellations[constell.id] || 0;
              const isMaxed = currentLevel >= constell.maxLevel;

              const starsCost = isMaxed ? 0 : (currentLevel + 1) * constell.baseStarsCost;
              const moonsCost = isMaxed ? 0 : (currentLevel + 1) * constell.baseMoonsCost;

              const hasEnoughStars = starsCount >= starsCost;
              const hasEnoughMoons = moonsCount >= moonsCost;
              const canAfford = !isMaxed && hasEnoughStars && hasEnoughMoons;

              return (
                <div
                  key={constell.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border-2 transition-all gap-3.5 group relative overflow-hidden ${
                    isMaxed
                      ? "border-emerald-500/50 bg-[#16272b]/50"
                      : currentLevel > 0
                      ? "border-cyan-400/50 bg-[#192248]/55"
                      : "border-[#caa5fe]/25 bg-[#1b193f]/40 hover:bg-[#1b193f]/70"
                  }`}
                >
                  {isMaxed && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-sans font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                      MAXIMIERT
                    </div>
                  )}

                  {/* Left: icon & details */}
                  <div className="flex items-start gap-3 min-w-0 flex-grow">
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-3xl shadow-lg shrink-0 select-none ${
                      isMaxed 
                        ? "bg-slate-900 border-emerald-400" 
                        : "bg-[#18153d] border-cyan-400/60"
                    }`}>
                      {constell.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-sans font-black text-xs sm:text-sm text-[#ffeef4] uppercase tracking-wider">
                          {constell.germanName}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black ${
                          isMaxed 
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" 
                            : currentLevel > 0 
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30" 
                            : "bg-slate-500/10 text-slate-400"
                        }`}>
                          Stufe: {currentLevel} / {constell.maxLevel}
                        </span>
                      </div>
                      <p className="font-sans text-[10px] sm:text-[10.5px] font-semibold text-[#a599d1] leading-tight mt-1">
                        {constell.germanDescription}
                      </p>
                      
                      {/* Active & Next bonus details */}
                      <div className="flex flex-col gap-0.5 mt-2 font-mono text-[9.5px]">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                          <span>Effekt:</span>
                          <span className="text-cyan-100">{constell.bonusText}</span>
                        </div>
                        {currentLevel > 0 && (
                          <div className="text-emerald-400/90 font-semibold">
                            Aktiver Bonus: +{currentLevel * (constell.id === "kuschel" ? 10 : constell.id === "mondhasen" ? 25 : constell.id === "supernova" ? 20 : constell.id === "stardust_rain" ? 15 : constell.id === "cosmic_harmony" ? 8 : 15)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Buy Button */}
                  <div className="shrink-0 flex items-center">
                    {isMaxed ? (
                      <div className="w-full text-center py-2 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono font-black">
                        VOLLENDET 🔮
                      </div>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => onInvestConstellation(constell.id, starsCost, moonsCost)}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black flex flex-col items-center justify-center transition-all select-none border-2 cursor-pointer ${
                          canAfford
                            ? "bg-gradient-to-b from-[#213f56] to-[#0f1d2a] text-[#ffeef4] border-cyan-400 hover:from-[#2e5a7b] hover:to-[#172d3e] hover:scale-103 shadow-[2.5px_2.5px_0px_#22d3ee] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#22d3ee]"
                            : "bg-[#18162f]/80 text-[#ab9fd2]/40 border-cyan-400/20 shadow-none cursor-not-allowed opacity-40"
                        }`}
                      >
                        <span className="text-[8.5px] uppercase font-mono tracking-widest font-black text-cyan-300">Sternbild füllen</span>
                        <div className="flex gap-2 items-center mt-0.5 text-[10px] font-mono font-black text-white">
                          <span className={hasEnoughStars ? "text-amber-205" : "text-rose-300"}>
                            ⭐ {starsCost}
                          </span>
                          {moonsCost > 0 && (
                            <span className={hasEnoughMoons ? "text-purple-300" : "text-rose-300"}>
                              🌙 {moonsCost}
                            </span>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
