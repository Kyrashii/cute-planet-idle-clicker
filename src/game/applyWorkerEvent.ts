import type { Dispatch, SetStateAction } from "react";
import type {
  PlanetTask,
  ActiveCosmicEvent,
  FloatingText,
  Achievement,
  PlacedAnimal,
} from "../types";
import type {
  WorkerEvent,
  GlitchBenchmarks,
  CalculationsSnapshot,
  OpeningResult,
  BlackHoleResultState,
  LootboxesOpenedEvent,
} from "./protocol";
import { formatCompactNumber } from "../utils/format";
import { isObjEqual, isArrEqual } from "../utils/equality";

/**
 * Side-effect handlers the UI provides so this module can stay free of React.
 * `applyWorkerEvent` fans a typed WorkerEvent out into these setters/effects —
 * the exact logic that used to live inline in App's `worker.onmessage`.
 */
export interface WorkerEventHandlers {
  setLife: Dispatch<SetStateAction<number>>;
  setTotalLifeEarned: Dispatch<SetStateAction<number>>;
  setStarsCount: Dispatch<SetStateAction<number>>;
  setMoonsCount: Dispatch<SetStateAction<number>>;
  setPurchasedAnimals: Dispatch<SetStateAction<Record<string, number>>>;
  setPurchasedUpgrades: Dispatch<SetStateAction<string[]>>;
  setPlanetLevel: Dispatch<SetStateAction<number>>;
  setPlanetTask: Dispatch<SetStateAction<PlanetTask | undefined>>;
  setClicksCount: Dispatch<SetStateAction<number>>;
  setStarClicksTriggered: Dispatch<SetStateAction<number>>;
  setSuperClickCharge: Dispatch<SetStateAction<number>>;
  setSuperClickArmed: Dispatch<SetStateAction<boolean>>;
  setPlacedAnimals: Dispatch<SetStateAction<PlacedAnimal[]>>;
  setAnimalLove: Dispatch<SetStateAction<Record<string, number>>>;
  setAnimalLastPet: Dispatch<SetStateAction<Record<string, number>>>;
  setBowlLastFed: Dispatch<SetStateAction<number>>;
  setBowlFedMinutesCredited: Dispatch<SetStateAction<number>>;
  setSecondsPlayed: Dispatch<SetStateAction<number>>;
  setIsNight: Dispatch<SetStateAction<boolean>>;
  setCycleProgress: Dispatch<SetStateAction<number>>;
  setActiveEvent: Dispatch<SetStateAction<string | null>>;
  setActiveEventInstantClaimed: Dispatch<SetStateAction<boolean>>;
  setEventTimeRemaining: Dispatch<SetStateAction<number>>;
  setPrestigeCount: Dispatch<SetStateAction<number>>;
  setGalaxyShards: Dispatch<SetStateAction<number>>;
  setZodiacLevels: Dispatch<SetStateAction<Record<string, number>>>;
  setSlummerGlassLevel: Dispatch<SetStateAction<number>>;
  setCatalystLevel: Dispatch<SetStateAction<number>>;
  setDoubleStellarLevel: Dispatch<SetStateAction<number>>;
  setBlackHoleSize: Dispatch<SetStateAction<number>>;
  setInGlitchGalaxy: Dispatch<SetStateAction<boolean>>;
  setGlitchPending: Dispatch<SetStateAction<boolean>>;
  setUnlockedGlitchGalaxy: Dispatch<SetStateAction<boolean>>;
  setSpentGalaxyShards: Dispatch<SetStateAction<number>>;
  setGlitchBenchmarks: Dispatch<SetStateAction<GlitchBenchmarks | undefined>>;
  setGlitchCooldown: Dispatch<SetStateAction<boolean>>;
  setConstellations: Dispatch<SetStateAction<Record<string, number>>>;
  setCraftedItems: Dispatch<SetStateAction<Record<string, number>>>;
  setGlitterDust: Dispatch<SetStateAction<number>>;
  setCosmeticRarityLevels: Dispatch<SetStateAction<Record<string, string>>>;
  setActiveEventDecision: Dispatch<SetStateAction<string | null>>;
  setActiveEventDetails: Dispatch<SetStateAction<ActiveCosmicEvent | null>>;
  setUnlockedCosmetics: Dispatch<SetStateAction<string[]>>;
  setShootingStarsCount: Dispatch<SetStateAction<number>>;
  setActiveZodiacId: Dispatch<SetStateAction<string>>;
  setCalculations: Dispatch<SetStateAction<CalculationsSnapshot>>;
  setAchievements: Dispatch<SetStateAction<Achievement[]>>;
  setIsLoaded: Dispatch<SetStateAction<boolean>>;
  setOpeningResult: Dispatch<SetStateAction<OpeningResult | null>>;
  setLootboxResult: Dispatch<SetStateAction<LootboxesOpenedEvent | null>>;
  setBlackHoleResult: Dispatch<SetStateAction<BlackHoleResultState | null>>;
  playTick: () => void;
  playPop: () => void;
  playLevelUp: () => void;
  setFloatingTexts: Dispatch<SetStateAction<FloatingText[]>>;
  nextParticleId: { current: number };
}

export function applyWorkerEvent(data: WorkerEvent, h: WorkerEventHandlers): void {
  const {
    setLife,
    setTotalLifeEarned,
    setStarsCount,
    setMoonsCount,
    setPurchasedAnimals,
    setPurchasedUpgrades,
    setPlanetLevel,
    setPlanetTask,
    setClicksCount,
    setStarClicksTriggered,
    setSuperClickCharge,
    setSuperClickArmed,
    setPlacedAnimals,
    setAnimalLove,
    setAnimalLastPet,
    setBowlLastFed,
    setBowlFedMinutesCredited,
    setSecondsPlayed,
    setIsNight,
    setCycleProgress,
    setActiveEvent,
    setActiveEventInstantClaimed,
    setEventTimeRemaining,
    setPrestigeCount,
    setGalaxyShards,
    setZodiacLevels,
    setSlummerGlassLevel,
    setCatalystLevel,
    setDoubleStellarLevel,
    setBlackHoleSize,
    setInGlitchGalaxy,
    setGlitchPending,
    setUnlockedGlitchGalaxy,
    setSpentGalaxyShards,
    setGlitchBenchmarks,
    setGlitchCooldown,
    setConstellations,
    setCraftedItems,
    setGlitterDust,
    setCosmeticRarityLevels,
    setActiveEventDecision,
    setActiveEventDetails,
    setUnlockedCosmetics,
    setShootingStarsCount,
    setActiveZodiacId,
    setCalculations,
    setAchievements,
    setIsLoaded,
    setOpeningResult,
    setLootboxResult,
    setBlackHoleResult,
    playTick,
    playPop,
    playLevelUp,
    setFloatingTexts,
    nextParticleId,
  } = h;

  if (!data || !data.type) return;

  switch (data.type) {
    case "STATE_UPDATE": {
      const ws = data.state;
      setLife(ws.life);
      setTotalLifeEarned(ws.totalLifeEarned);
      setStarsCount(ws.starsCount);
      setMoonsCount(ws.moonsCount || 0);

      setPurchasedAnimals((prev) =>
        isObjEqual(prev, ws.purchasedAnimals) ? prev : ws.purchasedAnimals,
      );
      setPurchasedUpgrades((prev) =>
        isArrEqual(prev, ws.purchasedUpgrades) ? prev : ws.purchasedUpgrades,
      );
      setPlanetLevel(ws.planetLevel);
      setPlanetTask(ws.planetTask);
      setClicksCount(ws.clicksCount);
      setStarClicksTriggered(ws.starClicksTriggered);
      setSuperClickCharge(ws.superClickCharge);
      setSuperClickArmed(ws.superClickArmed);
      setPlacedAnimals((prev) =>
        prev.length === ws.placedAnimals.length &&
        prev.every((animal, index) => {
          const next = ws.placedAnimals[index];
          return (
            animal.id === next.id &&
            animal.animalId === next.animalId &&
            animal.x === next.x &&
            animal.y === next.y
          );
        })
          ? prev
          : ws.placedAnimals,
      );
      setAnimalLove((prev) => (isObjEqual(prev, ws.animalLove) ? prev : ws.animalLove));
      setAnimalLastPet((prev) => (isObjEqual(prev, ws.animalLastPet) ? prev : ws.animalLastPet));
      setBowlLastFed(ws.bowlLastFed);
      setBowlFedMinutesCredited(ws.bowlFedMinutesCredited);
      setSecondsPlayed(ws.secondsPlayed);
      setIsNight(ws.isNight);
      setCycleProgress(ws.cycleProgress);
      setActiveEvent(ws.activeEvent);
      setActiveEventInstantClaimed(ws.activeEventInstantClaimed);
      setEventTimeRemaining(ws.eventTimeRemaining);
      setPrestigeCount(ws.prestigeCount || 0);
      if (ws.galaxyShards !== undefined) setGalaxyShards(ws.galaxyShards || 0);
      if (ws.zodiacLevels !== undefined) setZodiacLevels(ws.zodiacLevels || {});
      if (ws.slummerGlassLevel !== undefined) setSlummerGlassLevel(ws.slummerGlassLevel || 1);
      if (ws.catalystLevel !== undefined) setCatalystLevel(ws.catalystLevel || 0);
      if (ws.doubleStellarLevel !== undefined) setDoubleStellarLevel(ws.doubleStellarLevel || 0);
      if (ws.blackHoleSize !== undefined) setBlackHoleSize(ws.blackHoleSize || 1);
      if (ws.inGlitchGalaxy !== undefined) setInGlitchGalaxy(ws.inGlitchGalaxy);
      if (ws.glitchPending !== undefined) setGlitchPending(ws.glitchPending);
      if (ws.unlockedGlitchGalaxy !== undefined) setUnlockedGlitchGalaxy(ws.unlockedGlitchGalaxy);
      if (ws.spentGalaxyShards !== undefined) setSpentGalaxyShards(ws.spentGalaxyShards || 0);
      if (ws.glitchBenchmarks !== undefined) setGlitchBenchmarks(ws.glitchBenchmarks);
      if (ws.glitchCooldown !== undefined) setGlitchCooldown(ws.glitchCooldown);

      setConstellations((prevOrder) =>
        isObjEqual(prevOrder, ws.constellations) ? prevOrder : ws.constellations || {},
      );
      setCraftedItems((prev) => (isObjEqual(prev, ws.craftedItems) ? prev : ws.craftedItems || {}));
      if (ws.glitterDust !== undefined) setGlitterDust(ws.glitterDust);
      if (ws.cosmeticRarityLevels)
        setCosmeticRarityLevels((prev) =>
          isObjEqual(prev, ws.cosmeticRarityLevels) ? prev : ws.cosmeticRarityLevels,
        );
      if (ws.activeEventDecision !== undefined) setActiveEventDecision(ws.activeEventDecision);
      if (ws.activeEventDetails !== undefined) setActiveEventDetails(ws.activeEventDetails);
      if (ws.unlockedCosmetics !== undefined)
        setUnlockedCosmetics((prev) =>
          isArrEqual(prev, ws.unlockedCosmetics) ? prev : ws.unlockedCosmetics,
        );
      if (ws.shootingStarsCount !== undefined) setShootingStarsCount(ws.shootingStarsCount);
      if (ws.zodiac !== undefined) setActiveZodiacId(ws.zodiac || "katze");

      setCalculations((prevCalculations: CalculationsSnapshot) => {
        if (
          prevCalculations.totalLps === data.calculations.totalLps &&
          prevCalculations.clickPower === data.calculations.clickPower &&
          prevCalculations.totalAnimalsCount === data.calculations.totalAnimalsCount &&
          prevCalculations.starPowerPerStar === data.calculations.starPowerPerStar &&
          prevCalculations.totalStarsLps === data.calculations.totalStarsLps &&
          prevCalculations.totalAnimalsLps === data.calculations.totalAnimalsLps &&
          prevCalculations.researchedUpgradesCount === data.calculations.researchedUpgradesCount &&
          prevCalculations.unlockedAchievementsCount === data.calculations.unlockedAchievementsCount
        ) {
          return prevCalculations;
        }
        return data.calculations;
      });

      if (data.achievements !== undefined) {
        const next = data.achievements;
        setAchievements((prev) => {
          const unchanged =
            prev.length === next.length &&
            prev.every((achievement, index) => {
              const candidate = next[index];
              return (
                achievement.id === candidate.id &&
                achievement.progress === candidate.progress &&
                achievement.target === candidate.target &&
                achievement.isUnlocked === candidate.isUnlocked
              );
            });
          return unchanged ? prev : next;
        });
      }

      setIsLoaded(true);
      break;
    }
    case "CLICK_EFFECT": {
      playPop();
      const pId = nextParticleId.current++;
      setFloatingTexts((prev) => {
        const next: FloatingText[] = [
          ...prev,
          {
            id: pId,
            x: data.x,
            y: data.y,
            text: data.isCritical
              ? `+${formatCompactNumber(data.actualClickLife)} CRIT! ✨`
              : `+${formatCompactNumber(data.actualClickLife)}`,
            type: data.isCritical ? "crit-click" : "click",
            createdAt: Date.now(),
          },
        ];
        return next.length > 15 ? next.slice(next.length - 15) : next;
      });
      break;
    }
    case "SUPER_CLICK_TRIGGERED": {
      playLevelUp();
      const container = document.getElementById("planet-container");
      const rect = container?.getBoundingClientRect();
      const pId = nextParticleId.current++;
      setFloatingTexts((prev) => [
        ...prev.slice(-14),
        {
          id: pId,
          x: rect ? rect.width / 2 : 100,
          y: rect ? rect.height / 2 : 100,
          text: `SUPER-KLICK x${data.hits}: +${formatCompactNumber(data.reward)}`,
          type: "crit-click",
          createdAt: Date.now(),
        },
      ]);
      break;
    }
    case "STAR_TRIGGER": {
      playTick();

      // Spawn star autoclick reward text
      const container = document.getElementById("planet-container");
      let rx = 100 + (Math.random() * 80 - 40);
      let ry = 100 + (Math.random() * 80 - 40);

      if (container) {
        const rect = container.getBoundingClientRect();
        rx = Math.floor(Math.random() * (rect.width - 40) + 20);
        ry = Math.floor(Math.random() * (rect.height - 40) + 20);
      }

      const pId = nextParticleId.current++;
      setFloatingTexts((prev) => {
        const next: FloatingText[] = [
          ...prev,
          {
            id: pId,
            x: rx,
            y: ry,
            text: `+${formatCompactNumber(data.reward)} ✧`,
            type: "star-click",
            createdAt: Date.now(),
          },
        ];
        if (next.length > 15) {
          return next.slice(next.length - 15);
        }
        return next;
      });
      break;
    }
    case "MOON_TRIGGER": {
      playTick();

      const container = document.getElementById("planet-container");
      let rx = 100 + (Math.random() * 80 - 40);
      let ry = 100 + (Math.random() * 80 - 40);

      if (container) {
        const rect = container.getBoundingClientRect();
        rx = Math.floor(Math.random() * (rect.width - 40) + 20);
        ry = Math.floor(Math.random() * (rect.height - 40) + 20);
      }

      const pId = nextParticleId.current++;
      setFloatingTexts((prev) => {
        const next: FloatingText[] = [
          ...prev,
          {
            id: pId,
            x: rx,
            y: ry,
            text: `+${formatCompactNumber(data.reward)} 🌙`,
            type: "moon-click",
            createdAt: Date.now(),
          },
        ];
        if (next.length > 25) {
          return next.slice(next.length - 25);
        }
        return next;
      });
      break;
    }
    case "LEVEL_UP": {
      playLevelUp();

      // Spawn planet level evolution tag
      const pId = nextParticleId.current++;
      setFloatingTexts((ptList) => {
        const next: FloatingText[] = [
          ...ptList,
          {
            id: pId,
            x: 80,
            y: 30,
            text: `PLANET EVOLUTION: Lv. ${data.level}! ✨`,
            type: "level",
            createdAt: Date.now(),
          },
        ];
        if (next.length > 15) {
          return next.slice(next.length - 15);
        }
        return next;
      });
      break;
    }
    case "EVENT_TRIGGER": {
      if (data.active) {
        playLevelUp();
      } else {
        playPop();
      }
      break;
    }
    case "COSMETIC_FOUND": {
      playLevelUp();
      const pId = nextParticleId.current++;
      setFloatingTexts((prev) => {
        const next: FloatingText[] = [
          ...prev,
          {
            id: pId,
            x: 100 + (Math.random() * 40 - 20),
            y: 50 + (Math.random() * 40 - 20),
            text: data.text,
            type: "level",
            createdAt: Date.now(),
          },
        ];
        if (next.length > 15) {
          return next.slice(next.length - 15);
        }
        return next;
      });
      break;
    }
    case "LOOTBOXES_OPENED": {
      playLevelUp();
      setLootboxResult(data);
      break;
    }
    case "CRAFTED_ITEMS_OPENED": {
      playLevelUp();
      setOpeningResult({
        itemId: data.itemId,
        itemName: data.itemName,
        itemEmoji: data.itemEmoji,
        count: data.count,
        rewards: data.rewards,
      });
      break;
    }
    case "BLACK_HOLE_GAMBLE_RESULT": {
      if (data.success) {
        if (data.outcomeType === "good") {
          playLevelUp();
        } else {
          playPop();
        }
        setBlackHoleResult({
          show: true,
          title: data.title,
          text: data.text,
          success: true,
          outcomeType: data.outcomeType,
        });
      } else {
        playPop();
        setBlackHoleResult({
          show: true,
          title: "Fehler beim Opfern ⚠️",
          text: data.error || "Nicht genuegend Ressourcen!",
          success: false,
          outcomeType: "bad",
        });
      }
      break;
    }
    default:
      break;
  }
}
