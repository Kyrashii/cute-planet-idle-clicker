import React from "react";
import { motion } from "motion/react";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalLifeEarned: number;
  clicksCount: number;
  totalStarsLps: number;
  secondsPlayed: number;
  purchasedAnimals: Record<string, number>;
  starsCount: number;
  planetLevel: number;
  totalLps: number;
  prestigeCount: number;
  formatCompactNumber: (num: number) => string;
  formatTimePlayed: (seconds: number) => string;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  totalLifeEarned,
  clicksCount,
  totalStarsLps,
  secondsPlayed,
  purchasedAnimals,
  starsCount,
  planetLevel,
  totalLps,
  prestigeCount,
  formatCompactNumber,
  formatTimePlayed,
}) => {
  if (!isOpen) return null;

  const prestigeBonusPercent = prestigeCount * 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="modal-frame-target bg-[#1a163a]/95 backdrop-blur-md border-3 border-teal-300 flex flex-col max-w-md w-full max-h-[85vh] shadow-2xl overflow-hidden text-[#ffeef4] rounded-3.5xl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-3 border-teal-300/60 bg-gradient-to-r from-[#10192e] via-[#12233c] to-[#10192e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">📊</span>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 block">Kosmisches Tagebuch</span>
              <h4 className="font-sans font-black text-[#ffeef4] text-sm uppercase tracking-wide">
                Statistiken & Meilensteine
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b1836] border-2 border-teal-300 flex items-center justify-center font-bold text-lg text-white hover:bg-[#252148] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 flex-grow overflow-y-auto space-y-4">
          {/* Mini Stats Card Grid */}
          <div className="grid grid-cols-2 gap-3 font-bold">
            <div className="bg-[#1b1935] p-3 rounded-2xl border-2 border-[#caa5fe]/20">
              <span className="text-[9px] text-[#ab9fd2] font-mono uppercase font-black tracking-wider">Erhobenes Leben (Gesamt)</span>
              <p className="font-mono text-sm font-black text-[#ff9db8] mt-1" title={Math.floor(totalLifeEarned).toLocaleString("de-DE")}>
                {formatCompactNumber(totalLifeEarned)} 💖
              </p>
            </div>
            <div className="bg-[#1b1935] p-3 rounded-2xl border-2 border-[#caa5fe]/20">
              <span className="text-[9px] text-[#ab9fd2] font-mono uppercase font-black tracking-wider">Händische Klicks</span>
              <p className="font-mono text-sm font-black text-[#ffeef4] mt-1" title={clicksCount.toLocaleString("de-DE")}>
                {formatCompactNumber(clicksCount)} 👆
              </p>
            </div>
            <div className="bg-[#1b1935] p-3 rounded-2xl border-2 border-[#caa5fe]/20">
              <span className="text-[9px] text-[#ab9fd2] font-mono uppercase font-black tracking-wider">Sterne Autoclick Power</span>
              <p className="font-mono text-sm font-black text-amber-300 mt-1" title={totalStarsLps.toLocaleString("de-DE")}>
                +{formatCompactNumber(totalStarsLps)} 💖/s
              </p>
            </div>
            <div className="bg-[#1b1935] p-3 rounded-2xl border-2 border-[#caa5fe]/20">
              <span className="text-[9px] text-[#ab9fd2] font-mono uppercase font-black tracking-wider">Spieldauer</span>
              <p className="font-mono text-sm font-black text-teal-300 mt-1">
                {formatTimePlayed(secondsPlayed)}
              </p>
            </div>
            <div className="bg-[#1b1935] p-3 rounded-2xl border-2 border-[#caa5fe]/20">
              <span className="text-[9px] text-[#ab9fd2] font-mono uppercase font-black tracking-wider">Kosmisches Prestige</span>
              <p className="font-mono text-sm font-black text-purple-300 mt-1">
                Stufe {prestigeCount} 🎖️
              </p>
            </div>
            <div className="bg-[#1b1935] p-3 rounded-2xl border-2 border-[#caa5fe]/20 col-span-2">
              <span className="text-[9px] text-[#ab9fd2] font-mono uppercase font-black tracking-wider">Prestige Produktions-Multiplikator</span>
              <p className="font-mono text-sm font-black text-amber-300 mt-1">
                +{prestigeBonusPercent}% Dauerhafter Zuwachs-Booster
              </p>
            </div>
          </div>

          {/* Cutest Achievements Checkup */}
          <div className="bg-[#201d43]/50 border-2 border-[#caa5fe]/40 rounded-2.5xl p-4 space-y-3">
            <h6 className="font-sans font-black text-[10px] uppercase text-[#ff9db8] tracking-wider font-mono">
              Süße Meilensteine
            </h6>
            <div className="space-y-2.5 text-xs font-semibold text-[#ffeef4]">
              {/* Ach 1 */}
              <div className="flex items-center justify-between border-b border-[#caa5fe]/10 pb-2">
                <span className="flex items-center gap-1.5 text-[#ffeef4]">
                  🐥 Erster Tierfreund
                </span>
                <span className={Object.keys(purchasedAnimals).length > 0 ? "text-[#ff9db8] font-black animate-pulse" : "text-gray-500 line-through font-mono text-[10px]"}>
                  {Object.keys(purchasedAnimals).length > 0 ? "✓ Freigeschaltet" : "Gesperrt"}
                </span>
              </div>

              {/* Ach 2 */}
              <div className="flex items-center justify-between border-b border-[#caa5fe]/10 pb-2">
                <span className="flex items-center gap-1.5 text-[#ffeef4]">
                  ⭐ Astronomische Anziehung
                </span>
                <span className={starsCount >= 5 ? "text-[#ff9db8] font-black animate-pulse" : "text-gray-500 line-through font-mono text-[10px]"}>
                  {starsCount >= 5 ? "✓ Freigeschaltet" : `Gesperrt (${starsCount}/5)`}
                </span>
              </div>

              {/* Ach 3 */}
              <div className="flex items-center justify-between border-b border-[#caa5fe]/10 pb-2">
                <span className="flex items-center gap-1.5 text-[#ffeef4]">
                  🪐 Evolutionär (Planet Lv. 4)
                </span>
                <span className={planetLevel >= 4 ? "text-[#ff9db8] font-black animate-pulse" : "text-gray-500 line-through font-mono text-[10px]"}>
                  {planetLevel >= 4 ? "✓ Freigeschaltet" : "Gesperrt"}
                </span>
              </div>

              {/* Ach 4 */}
              <div className="flex items-center justify-between pb-1">
                <span className="flex items-center gap-1.5 text-[#ffeef4]">
                  🧬 Lebensfülle (1M Gesamt)
                </span>
                <span className={totalLifeEarned >= 1000000 ? "text-[#ff9db8] font-black animate-pulse" : "text-gray-500 line-through font-mono text-[10px]"}>
                  {totalLifeEarned >= 1000000 ? "✓ Freigeschaltet" : "Gesperrt"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#13112a] border-t border-teal-300/40 flex justify-between items-center text-[10px] text-[#ab9fd2] font-semibold px-5">
          <span>Evolutionäre Stufe: <b className="text-teal-300 font-black">Level {planetLevel}</b></span>
          <span>Aktuelles Einkommen: <b className="text-white font-black">+{formatCompactNumber(totalLps)} 💖/s</b></span>
        </div>
      </motion.div>
    </div>
  );
};
