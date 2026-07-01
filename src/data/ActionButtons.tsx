import React from "react";

interface ActionButtonsProps {
  onShowGehege: () => void;
  onShowAnimals: () => void;
  onShowCrafting: () => void;
  onShowStars: () => void;
  onShowUpgrades: () => void;
  onShowAchievements: () => void;
  onShowStats: () => void;
  onShowMissions: () => void;
  onShowInventory: () => void;
  disableAnimations: boolean;
  isNightStyle: boolean;
  totalAnimalsCount: number;
  starsCount: number;
  researchedUpgradesCount: number;
  unlockedAchievementsCount: number;
  achievementsLength: number;
  completedUnclaimedMissionsCount: number;
  shootingStarsCount: number;
  activeConstellationsCount: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = React.memo(
  ({
    onShowGehege,
    onShowAnimals,
    onShowCrafting,
    onShowStars,
    onShowUpgrades,
    onShowAchievements,
    onShowStats,
    onShowMissions,
    onShowInventory,
    disableAnimations,
    isNightStyle,
    totalAnimalsCount,
    starsCount,
    researchedUpgradesCount,
    unlockedAchievementsCount,
    achievementsLength,
    completedUnclaimedMissionsCount,
    shootingStarsCount,
    activeConstellationsCount,
  }) => {
    return (
      <section className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-5 md:grid-cols-9 gap-2.5 mt-2">
        {/* Button 0: Tier Gehege (Enclosure) */}
        <button
          onClick={onShowGehege}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/tier_gehege.png"
            alt="Tier Gehege"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-bounce"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-indigo-200">
            Tier Gehege
          </span>
        </button>

        {/* Button 1: Animals (Tiere) */}
        <button
          onClick={onShowAnimals}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/tiere_zuechten.png"
            alt="Tiere zuechten"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-bounce"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-brand-pink">
            Tiere zuechten
          </span>

          {/* Dynamic badge indicator count */}
          <span className="absolute -top-1.5 -right-1.5 bg-danger text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-cosmic-pink shadow-sm">
            {totalAnimalsCount}
          </span>
        </button>

        {/* Button 1.5: Schmieden (Crafting) */}
        <button
          onClick={onShowCrafting}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/schmieden.png"
            alt="Schmieden"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-pulse"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-orange-300">
            Schmieden
          </span>

          <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-orange-400 shadow-sm">
            52
          </span>
        </button>

        {/* Button 2: Stars (Sterne) */}
        <button
          onClick={onShowStars}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/sterne_rufen.png"
            alt="Sterne rufen"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-spin"}`}
            style={disableAnimations ? {} : { animationDuration: "3s" }}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-amber-200">
            Sterne rufen
          </span>

          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-sm">
            {starsCount}
          </span>
        </button>

        {/* Button 3: Upgrades & Research (Forschung) */}
        <button
          onClick={onShowUpgrades}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/forschung.png"
            alt="Forschung"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-pulse"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-cosmic-accent">
            Forschung
          </span>

          <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-cosmic-accent shadow-sm">
            {researchedUpgradesCount}
          </span>
        </button>

        {/* Button 4: Achievements (Erfolge) */}
        <button
          onClick={onShowAchievements}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/erfolge.png"
            alt="Erfolge"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-bounce"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-amber-250">
            Erfolge
          </span>

          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-sm">
            {unlockedAchievementsCount}/{achievementsLength}
          </span>
        </button>

        {/* Button 5: Stats/Diary (Daten) */}
        <button
          onClick={onShowStats}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/tagebuch.png"
            alt="Tagebuch"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:rotate-12 transition-transform"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-teal-200">
            Tagebuch
          </span>

          <span className="absolute -top-1.5 -right-1.5 bg-teal-500 text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-teal-300 shadow-sm">
            Statistik
          </span>
        </button>

        {/* Button 6: Missions (Missionen) */}
        <button
          onClick={onShowMissions}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/missionen.png"
            alt="Missionen"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-bounce"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-fuchsia-200">
            Missionen
          </span>

          {completedUnclaimedMissionsCount > 0 && (
            <span
              className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-black text-[10px] h-5 px-2 rounded-full flex items-center justify-center border-2 border-fuchsia-300 shadow-sm ${disableAnimations ? "" : "animate-pulse"}`}
            >
              {completedUnclaimedMissionsCount}!
            </span>
          )}
        </button>

        {/* Button 7: Inventory (Inventar) */}
        <button
          onClick={onShowInventory}
          className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2.5xl border-3 border-transparent bg-transparent hover:bg-white/5 shadow-none font-sans font-black cursor-pointer selection:bg-transparent modal-frame-target ${
            disableAnimations ? "" : "transition-all hover:scale-105 active:scale-95"
          }`}
        >
          <img
            src="/assets/stuff/inventar.png"
            alt="Inventar"
            referrerPolicy="no-referrer"
            className={`size-12  object-contain mb-1 ${disableAnimations ? "" : "group-hover:animate-bounce"}`}
          />
          <span className="text-[11px] uppercase tracking-wider text-center leading-normal text-amber-200">
            Inventar
          </span>

          <span
            className={`absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-mono font-black text-[9px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-sm ${disableAnimations ? "" : "animate-pulse"}`}
          >
            {shootingStarsCount}
          </span>
        </button>
      </section>
    );
  },
);
ActionButtons.displayName = "ActionButtons";
