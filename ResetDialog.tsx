import React, { useState } from "react";
import { motion } from "motion/react";
import { Animal } from "../../types";

const AnimalImage: React.FC<{ image?: string; emoji: string }> = ({ image, emoji }) => {
  const [error, setError] = useState(false);

  if (image && !error) {
    return (
      <img
        src={image}
        alt={emoji}
        onError={() => setError(true)}
        className="w-10 h-10 object-contain select-none"
        referrerPolicy="no-referrer"
      />
    );
  }

  return <span className="text-2.5xl select-none">{emoji}</span>;
};

interface AnimalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  life: number;
  totalAnimalsLps: number;
  purchasedAnimals: Record<string, number>;
  animalDefs: Animal[];
  onBuyAnimal: (animalId: string, cost: number, countToBuy: number) => void;
  calculateCost: (baseCost: number, count: number, multiplier: number) => number;
  formatCompactNumber: (num: number) => string;
  upgradesSpecs: {
    bunnyBoost: boolean;
    chickBoost: boolean;
    catBoost: boolean;
    frogBoost: boolean;
    koalaBoost: boolean;
    pandaBoost: boolean;
    unicornBoost: boolean;
    globalAnimalsBoost: boolean;
  };
}

export const AnimalsModal: React.FC<AnimalsModalProps> = ({
  isOpen,
  onClose,
  life,
  totalAnimalsLps,
  purchasedAnimals,
  animalDefs,
  onBuyAnimal,
  calculateCost,
  formatCompactNumber,
  upgradesSpecs,
}) => {
  const [buyAmount, setBuyAmount] = useState<1 | 10 | 25 | "max">(1);

  if (!isOpen) return null;

  // Smart Helpers math calculations
  const getCheapestAnimal = () => {
    let cheapest: typeof animalDefs[0] | null = null;
    let cheapestCost = Infinity;

    animalDefs.forEach((animal) => {
      const count = purchasedAnimals[animal.id] || 0;
      const cost = Math.floor(animal.baseCost * Math.pow(animal.costMultiplier, count));
      if (cost < cheapestCost) {
        cheapestCost = cost;
        cheapest = animal;
      }
    });

    return cheapest ? { animal: cheapest, cost: cheapestCost } : null;
  };

  const getBestRatioAnimal = () => {
    let best: typeof animalDefs[0] | null = null;
    let bestRatio = -1;
    let bestCost = 0;

    animalDefs.forEach((animal) => {
      const count = purchasedAnimals[animal.id] || 0;
      const cost = Math.floor(animal.baseCost * Math.pow(animal.costMultiplier, count));

      let multiplier = 1.0;
      if (animal.id === "bunny" && upgradesSpecs.bunnyBoost) multiplier *= 2.0;
      if (animal.id === "chick" && upgradesSpecs.chickBoost) multiplier *= 2.0;
      if (animal.id === "cat" && upgradesSpecs.catBoost) multiplier *= 2.0;
      if (animal.id === "frog" && upgradesSpecs.frogBoost) multiplier *= 2.0;
      if (animal.id === "koala" && upgradesSpecs.koalaBoost) multiplier *= 2.0;
      if (animal.id === "panda" && upgradesSpecs.pandaBoost) multiplier *= 2.0;
      if (animal.id === "unicorn" && upgradesSpecs.unicornBoost) multiplier *= 2.0;
      if (upgradesSpecs.globalAnimalsBoost) multiplier *= 1.5;

      const lpsDisplay = animal.baseLps * multiplier;
      const ratio = lpsDisplay / cost;

      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = animal;
        bestCost = cost;
      }
    });

    return best ? { animal: best, cost: bestCost } : null;
  };

  const cheapestInfo = getCheapestAnimal();
  const bestRatioInfo = getBestRatioAnimal();

  const buyCheapest = () => {
    if (cheapestInfo && life >= cheapestInfo.cost) {
      onBuyAnimal(cheapestInfo.animal.id, cheapestInfo.cost, 1);
    }
  };

  const buyBestRatio = () => {
    if (bestRatioInfo && life >= bestRatioInfo.cost) {
      onBuyAnimal(bestRatioInfo.animal.id, bestRatioInfo.cost, 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="modal-frame-target bg-[#1a163a]/95 backdrop-blur-md rounded-3.5xl border-3 border-[#caa5fe] flex flex-col max-w-xl w-full max-h-[85vh] shadow-2xl overflow-hidden text-[#ffeef4]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-3 border-[#caa5fe]/60 bg-gradient-to-r from-[#171430] via-[#211a3d] to-[#171430] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">🐾</span>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-300 block">Sanfte Tierzucht</span>
              <h4 className="font-sans font-black text-[#ffeef4] text-sm uppercase tracking-wide">
                Passive Lebensenergie gewinnen
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b1836] border-2 border-[#caa5fe] flex items-center justify-center font-bold text-lg text-white hover:bg-[#252148] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Multi Buy and Smart Actions Toolbar */}
        <div className="p-3 bg-[#13112a]/90 border-b border-[#caa5fe]/30 flex flex-col gap-2 shrink-0 px-4 sm:px-5">
          {/* Purchase Amount Selection */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-[#b4a8e2] uppercase tracking-wider font-mono">Kauf-Menge:</span>
            <div className="flex rounded-full bg-[#1c193b] border border-[#caa5fe]/40 p-0.5 shadow-sm">
              {([1, 10, 25, "max"] as const).map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBuyAmount(amt)}
                  className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                    buyAmount === amt
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {amt === "max" ? "MAX" : `x${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Automation Actions */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              disabled={!cheapestInfo || life < cheapestInfo.cost}
              onClick={buyCheapest}
              className={`p-1.5 px-3 rounded-xl border flex items-center justify-between transition-all text-[9.5px] font-black font-mono cursor-pointer select-none ${
                cheapestInfo && life >= cheapestInfo.cost
                  ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-slate-900/40 border-white/5 text-slate-500 cursor-not-allowed opacity-50"
              }`}
            >
              <span className="truncate">🛒 Billigstes Tier</span>
              {cheapestInfo && (
                <span className="bg-emerald-500/20 px-1 py-0.5 rounded ml-1 shrink-0 text-emerald-200">
                  {formatCompactNumber(cheapestInfo.cost)} 💖
                </span>
              )}
            </button>

            <button
              disabled={!bestRatioInfo || life < bestRatioInfo.cost}
              onClick={buyBestRatio}
              className={`p-1.5 px-3 rounded-xl border flex items-center justify-between transition-all text-[9.5px] font-black font-mono cursor-pointer select-none ${
                bestRatioInfo && life >= bestRatioInfo.cost
                  ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20"
                  : "bg-slate-900/40 border-white/5 text-slate-500 cursor-not-allowed opacity-50"
              }`}
            >
              <span className="truncate">🧪 Bestes LPS/Kosten</span>
              {bestRatioInfo && (
                <span className="bg-cyan-500/20 px-1 py-0.5 rounded ml-1 shrink-0 text-cyan-200">
                  {formatCompactNumber(bestRatioInfo.cost)} 💖
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 flex-grow overflow-y-auto space-y-3.5 pr-2">
          {animalDefs.map((animal) => {
            const count = purchasedAnimals[animal.id] || 0;
            
            // Calculate dynamic bulk costs
            let tempCount = count;
            let totalCost = 0;
            let countToBuy = 0;

            if (buyAmount === "max") {
              while (true) {
                const nextCost = Math.floor(animal.baseCost * Math.pow(animal.costMultiplier, tempCount));
                if (totalCost + nextCost <= life) {
                  totalCost += nextCost;
                  tempCount++;
                  countToBuy++;
                } else {
                  break;
                }
              }
              if (countToBuy === 0) {
                countToBuy = 1;
                totalCost = Math.floor(animal.baseCost * Math.pow(animal.costMultiplier, count));
              }
            } else {
              countToBuy = buyAmount;
              for (let i = 0; i < buyAmount; i++) {
                totalCost += Math.floor(animal.baseCost * Math.pow(animal.costMultiplier, tempCount + i));
              }
            }

            const hasMoney = life >= totalCost;
            
            // Calculate dynamic species display production
            let multiplier = 1.0;
            if (animal.id === "bunny" && upgradesSpecs.bunnyBoost) multiplier *= 2.0;
            if (animal.id === "chick" && upgradesSpecs.chickBoost) multiplier *= 2.0;
            if (animal.id === "cat" && upgradesSpecs.catBoost) multiplier *= 2.0;
            if (animal.id === "frog" && upgradesSpecs.frogBoost) multiplier *= 2.0;
            if (animal.id === "koala" && upgradesSpecs.koalaBoost) multiplier *= 2.0;
            if (animal.id === "panda" && upgradesSpecs.pandaBoost) multiplier *= 2.0;
            if (animal.id === "unicorn" && upgradesSpecs.unicornBoost) multiplier *= 2.0;
            if (upgradesSpecs.globalAnimalsBoost) multiplier *= 1.5;

            const lpsDisplay = animal.baseLps * multiplier;

            return (
              <div
                key={animal.id}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-[#caa5fe]/45 bg-[#201d43]/50 hover:bg-[#201d43]/80 transition-all gap-3 group"
              >
                {/* Animal visual thumbnail */}
                <div className="flex items-center gap-3 min-w-0 flex-grow">
                  <div className="w-12 h-12 rounded-xl bg-[#1b1935] border-2 border-[#caa5fe] flex items-center justify-center shadow-md relative shrink-0">
                    <AnimalImage image={animal.image} emoji={animal.emoji} />
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#f15e75] text-white font-mono font-black text-[9px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#caa5fe] shadow-sm animate-pulse">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-sans font-black text-xs sm:text-sm text-[#ffeef4] truncate">
                        {animal.germanName}
                      </h5>
                      {count > 0 && (
                        <span className="text-[10px] font-black text-[#ff9db8] font-sans italic truncate">
                          {count * lpsDisplay > 0 ? `(+${formatCompactNumber(count * lpsDisplay)}/s)` : ""}
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-[10.5px] font-semibold text-[#ab9fd2] leading-tight">
                      {animal.germanDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[9.5px] font-mono font-black text-sky-300">
                      <span>Produziert: +{formatCompactNumber(lpsDisplay)} Leben/sek</span>
                    </div>
                  </div>
                </div>

                {/* Kauf-Button */}
                <button
                  disabled={!hasMoney}
                  onClick={() => onBuyAnimal(animal.id, totalCost, countToBuy)}
                  className={`px-3 py-2 sm:px-4 rounded-xl font-black flex flex-col items-center justify-center min-w-[94px] shrink-0 transition-all select-none border-2 cursor-pointer ${
                    hasMoney
                      ? "bg-gradient-to-b from-[#24214e] to-[#12112b] text-[#ffeef4] border-[#caa5fe] hover:from-[#353174] hover:to-[#171638] hover:scale-103 shadow-[2.5px_2.5px_0px_#caa5fe] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#caa5fe]"
                      : "bg-[#18162f]/80 text-[#ab9fd2]/40 border-[#caa5fe]/20 shadow-none cursor-not-allowed opacity-40"
                  }`}
                >
                  <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#ab9fd2]">
                    Kaufe x{countToBuy}
                  </span>
                  <span className="font-mono text-[10px] font-black mt-0.5 text-white" title={Math.floor(totalCost).toLocaleString("de-DE")}>
                    {formatCompactNumber(totalCost)} 💖
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer helper summary info */}
        <div className="p-3 bg-[#13112a] border-t border-[#caa5fe]/40 flex justify-between items-center text-[10px] text-[#ab9fd2] font-semibold px-5">
          <span>Hintergrund-Einnahmen: <b className="text-[#ff9db8] font-black">+{formatCompactNumber(totalAnimalsLps)} 💖/s</b></span>
          <span>Aktuelles Guthaben: <b className="text-[#ff9db8]" title={Math.floor(life).toLocaleString("de-DE")}>{formatCompactNumber(life)} 💖</b></span>
        </div>
      </motion.div>
    </div>
  );
};
