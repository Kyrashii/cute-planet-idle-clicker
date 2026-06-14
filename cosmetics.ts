import React from "react";
import { motion } from "motion/react";

interface StarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  life: number;
  starsCount: number;
  starPowerPerStar: number;
  starClicksTriggered: number;
  onBuyStar: () => void;
  starCost: number;
  totalStarsLps: number;
  formatCompactNumber: (num: number) => string;
  moonsCount: number;
  onMergeMoons: () => void;
  prestigeCount?: number;
  maxMoons?: number;
}

export const StarsModal: React.FC<StarsModalProps> = ({
  isOpen,
  onClose,
  life,
  starsCount,
  starPowerPerStar,
  starClicksTriggered,
  onBuyStar,
  starCost,
  totalStarsLps,
  formatCompactNumber,
  moonsCount,
  onMergeMoons,
  prestigeCount = 0,
  maxMoons = 3,
}) => {
  if (!isOpen) return null;

  const canMerge = starsCount >= 50 && moonsCount < maxMoons;

  const prestigeMultiplier = 1 + prestigeCount * 0.10;
  const singleMoonPower = 15000 * prestigeMultiplier;
  const totalMoonPower = moonsCount * singleMoonPower;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="modal-frame-target bg-[#1a163a]/95 backdrop-blur-md rounded-3.5xl border-3 border-amber-300 flex flex-col max-w-md w-full max-h-[85vh] shadow-2xl overflow-hidden text-[#ffeef4]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-3 border-amber-300/60 bg-gradient-to-r from-[#1e1a30] via-[#241d3d] to-[#1e1a30] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">🌙</span>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">Gravitations-Sterne</span>
              <h4 className="font-sans font-black text-[#ffeef4] text-sm uppercase tracking-wide">
                Cosmic Autoclicker rufen
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b1836] border-2 border-amber-300 flex items-center justify-center font-bold text-lg text-white hover:bg-[#252148] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 flex-grow overflow-y-auto space-y-4">
          {/* Informative description banner */}
          <div className="p-3.5 rounded-2xl bg-amber-400/10 border-2 border-amber-300/40 text-xs text-[#ffeef4] space-y-1.5 leading-relaxed shadow-md">
            <span className="font-black flex items-center gap-1 select-none uppercase tracking-wide text-[11px] text-amber-200">
              ⭐ Wie funktionieren Sterne?
            </span>
            <p className="font-semibold text-[11px] text-[#ab9fd2] leading-relaxed">
              Sterne kreisen zierlich um deinen Planeten und tippen ihn passiv an. <b>Synergie:</b> Deine Klick-Stärken-Upgrades verstärken deine Sterne zusätzlich (+20% der Klick-Upgrades)!
            </p>
            <div className="pt-1.5 text-[11.5px] font-mono font-black flex items-center justify-between border-t border-[#caa5fe]/25 text-amber-200">
              <span>Stern-Schlagkraft:</span>
              <span>+{formatCompactNumber(starPowerPerStar)} Leben/Tipp</span>
            </div>
          </div>

          {/* Interactive Purchase Row */}
          <div className="bg-[#201d43]/50 p-4 rounded-2.5xl border-2 border-[#caa5fe]/45 flex flex-col items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="p-3 rounded-xl bg-[#1b1935] border-2 border-amber-300 flex items-center justify-center text-3xl shadow-md shrink-0 select-none">
                ⭐
              </div>
              <div className="min-w-0 flex-grow">
                <h5 className="font-sans font-black text-xs sm:text-sm text-[#ffeef4] uppercase tracking-wide truncate">
                  Orbitaler Sternenläufer
                </h5>
                <p className="font-sans text-[11px] font-semibold text-[#ab9fd2] mt-0.5 leading-tight">
                  Rufe einen kleinen schwebenden Stern herbei.
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-300 font-mono font-black">
                  <span>Aktive Stars:</span>
                  <span className="px-2.5 py-0.5 border-2 border-amber-300 rounded-md bg-[#1d173c] text-amber-200">
                    {starsCount}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onBuyStar}
              disabled={life < starCost}
              className={`w-full px-4 py-3 rounded-xl font-black flex flex-col items-center justify-center transition-all select-none border-2 cursor-pointer ${
                life >= starCost
                  ? "bg-gradient-to-b from-[#24214e] to-[#12112b] text-[#ffeef4] border-[#caa5fe] hover:from-[#353174] hover:to-[#171638] hover:scale-103 shadow-[2.5px_2.5px_0px_#caa5fe] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#caa5fe]"
                  : "bg-[#18162f]/80 text-[#ab9fd2]/40 border-[#caa5fe]/20 shadow-none cursor-not-allowed opacity-40"
              }`}
            >
              <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#ab9fd2]">Herbeirufen</span>
              <span className="font-mono text-xs font-black mt-0.5 text-white" title={Math.floor(starCost).toLocaleString("de-DE")}>
                {formatCompactNumber(starCost)} 💖
              </span>
            </button>
          </div>

          {/* Mond-Verschmelzung / Moon Merger Row */}
          <div className="bg-gradient-to-b from-[#2a174d] to-[#171131] p-4 rounded-2.5xl border-2 border-fuchsia-400/50 flex flex-col items-center justify-between gap-4 shadow-lg relative overflow-hidden">
            {/* Background glowing sphere decoration */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-3 w-full relative z-10">
              <div className="p-3 rounded-xl bg-[#1b1935] border-2 border-purple-400 flex items-center justify-center text-3xl shadow-md shrink-0 select-none animate-pulse">
                🌙
              </div>
              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-2">
                  <h5 className="font-sans font-black text-xs sm:text-sm text-fuchsia-200 uppercase tracking-wide truncate">
                    Mond-Verschmelzung
                  </h5>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] bg-amber-400/10 border border-amber-300 text-amber-200 uppercase font-mono font-black shrink-0 tracking-widest leading-none">
                    Massiv!
                  </span>
                </div>
                <p className="font-sans text-[11px] font-semibold text-[#c8bdf4] mt-0.5 leading-tight">
                  Verschmelze <b className="text-white">50 Sterne</b> zu einem mächtigen umkreisenden Mond. Maximale Sternenkosten werden dadurch wieder billig zurückgesetzt!
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-1 text-xs text-purple-300 font-mono font-black border-b border-purple-500/20 pb-1.5">
                  <span>Erschaffene Monde:</span>
                  <span className="px-2.5 py-0.5 border-2 border-purple-400 rounded-md bg-[#1d173c] text-purple-200 font-black">
                    {moonsCount} / {maxMoons}
                  </span>
                </div>
                {/* Specific Moon Rewards & Information (purple text with glow) */}
                <div className="mt-2.5 w-full text-[10.5px] font-mono leading-relaxed space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-300">🌙 Leben pro Sekunde:</span>
                    <span className="font-black text-fuchsia-250 filter drop-shadow-[0_0_4px_rgba(217,70,239,0.5)]">
                      +{formatCompactNumber(singleMoonPower)} 💖/s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-purple-400 font-semibold">• EP-Anteil:</span>
                    <span className="text-fuchsia-300 font-bold">+15 EP/s</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-purple-450 font-bold">• Globaler Booster:</span>
                    <span className="text-amber-300 font-black">+150% Gesamt-LPS pro Mond! 🚀</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-purple-400 font-semibold">• Pulsierungs-Effekt:</span>
                    <span className="text-purple-300 italic">Automatisches Ticken im Hintergrund</span>
                  </div>
                  {moonsCount > 0 && (
                    <div className="flex flex-col gap-0.5 pt-1 border-t border-purple-500/20 text-[#e2d5ff] font-bold text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>Aktiver Mond-Zuwachs:</span>
                        <span className="filter drop-shadow-[0_0_3px_rgba(217,70,239,0.4)]">+{formatCompactNumber(totalMoonPower)} 💖/s</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-amber-300">
                        <span>Globaler Mond-Multiplikator:</span>
                        <span>+{moonsCount * 150}% LPS-Bonus!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onMergeMoons}
              disabled={!canMerge}
              className={`w-full px-4 py-3 rounded-xl font-black flex flex-col items-center justify-center transition-all select-none border-2 cursor-pointer ${
                canMerge
                  ? "bg-gradient-to-b from-[#6b21a8] to-[#3b0764] text-white border-purple-400 hover:from-[#7e22ce] hover:to-[#581c87] hover:scale-103 shadow-[2.5px_2.5px_0px_#caa5fe] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#caa5fe]"
                  : "bg-[#18162f]/80 text-[#ab9fd2]/40 border-purple-400/20 shadow-none cursor-not-allowed opacity-45"
              }`}
            >
              <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#c8bdf4]">
                {moonsCount >= maxMoons ? "Maximum erreicht" : "Qualitativ verschmelzen"}
              </span>
              <span className="font-mono text-xs font-black mt-0.5 text-white">
                {moonsCount >= maxMoons
                  ? `${maxMoons}/${maxMoons} Monde aktiv 🌙`
                  : starsCount >= 50
                  ? "Fliegenden Mond schmieden! ✨"
                  : `Benötigt 50 Sterne (${starsCount}/50)`}
              </span>
            </button>
          </div>

          {/* Stats overview */}
          <div className="bg-[#201d43]/40 rounded-2.5xl p-4 border-2 border-[#caa5fe]/30 space-y-3">
            <h6 className="font-sans font-black text-[10px] uppercase tracking-wider text-[#ab9fd2] font-mono">
              Sternen-Energie Logbuch
            </h6>
            <div className="grid grid-cols-2 gap-3 text-xs leading-none font-bold">
              <div className="bg-[#1b1935] p-2.5 rounded-xl border-2 border-[#caa5fe]/20 flex flex-col items-center justify-center text-center">
                <span className="text-[9.5px] text-[#ab9fd2] font-mono uppercase">Ertrag / sek</span>
                <span className="font-mono mt-1 text-xs truncate font-black text-amber-300" title={(starsCount * starPowerPerStar).toLocaleString("de-DE")}>
                  +{formatCompactNumber(starsCount * starPowerPerStar)} 💖
                </span>
              </div>
              <div className="bg-[#1b1935] p-2.5 rounded-xl border-2 border-[#caa5fe]/20 flex flex-col items-center justify-center text-center">
                <span className="text-[9.5px] text-[#ab9fd2] font-mono uppercase">Erzeugte Tipps</span>
                <span className="font-mono mt-1 text-xs truncate font-black text-[#ffeef4]" title={starClicksTriggered.toLocaleString("de-DE")}>
                  {formatCompactNumber(starClicksTriggered)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#13112a] border-t border-[#caa5fe]/40 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#ab9fd2] font-semibold px-5 gap-1.5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
            <span>Sterne-Ertrag: <b className="text-amber-300 font-black">+{formatCompactNumber(totalStarsLps)} 💖/s</b></span>
            <span className="hidden sm:inline text-purple-400">|</span>
            <span>Mond-Ertrag: <b className="text-purple-300 font-black">+{formatCompactNumber(totalMoonPower)} 💖/s</b></span>
          </div>
          <span>Guthaben: <b className="text-[#ff9db8] font-black" title={Math.floor(life).toLocaleString("de-DE")}>{formatCompactNumber(life)} 💖</b></span>
        </div>
      </motion.div>
    </div>
  );
};
