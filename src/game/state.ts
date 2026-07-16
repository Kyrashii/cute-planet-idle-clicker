import type { WorkerGameState } from "./protocol";

const finiteNonNegative = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const finiteInteger = (value: unknown, fallback = 0): number =>
  Math.floor(finiteNonNegative(value, fallback));

const copyNumberRecord = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, count]) => [key, finiteInteger(count)] as const)
      .filter(([, count]) => count > 0),
  );
};

const copyStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0,
    ),
  );
};

const copyStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter((item): item is string => typeof item === "string" && item.length > 0),
        ),
      ]
    : [];

export function createInitialWorkerState(): WorkerGameState {
  return {
    life: 0,
    totalLifeEarned: 0,
    starsCount: 0,
    purchasedAnimals: {},
    purchasedUpgrades: [],
    planetLevel: 1,
    planetTask: undefined,
    clicksCount: 0,
    starClicksTriggered: 0,
    secondsPlayed: 0,
    isNight: true,
    cycleProgress: 0,
    activeEvent: null,
    activeEventDecision: null,
    activeEventDetails: null,
    activeEventInstantClaimed: false,
    eventTimeRemaining: 120,
    prestigeCount: 0,
    moonsCount: 0,
    constellations: {},
    unlockedCosmetics: [],
    cosmeticRarityLevels: {},
    glitterDust: 0,
    shootingStarsCount: 0,
    blackHoleSize: 1,
    craftedItems: {},
    zodiac: "katze",
    galaxyShards: 0,
    zodiacLevels: {},
    slummerGlassLevel: 1,
    catalystLevel: 0,
    doubleStellarLevel: 0,
    inGlitchGalaxy: false,
    glitchPending: false,
    unlockedGlitchGalaxy: false,
    spentGalaxyShards: 0,
    glitchBenchmarks: undefined,
    glitchCooldown: false,
    superClickCharge: 0,
    superClickArmed: false,
    placedAnimals: [],
    animalLove: {},
    animalLastPet: {},
    bowlLastFed: 0,
    bowlFedMinutesCredited: 0,
  };
}

export function hydrateWorkerState(
  savedState: Partial<WorkerGameState> | null | undefined,
): WorkerGameState {
  const initial = createInitialWorkerState();
  if (!savedState) return initial;

  return {
    ...initial,
    ...savedState,
    life: finiteNonNegative(savedState.life),
    totalLifeEarned: finiteNonNegative(savedState.totalLifeEarned),
    starsCount: finiteInteger(savedState.starsCount),
    purchasedAnimals: copyNumberRecord(savedState.purchasedAnimals),
    purchasedUpgrades: copyStringArray(savedState.purchasedUpgrades),
    planetLevel: Math.max(1, finiteInteger(savedState.planetLevel, 1)),
    clicksCount: finiteInteger(savedState.clicksCount),
    starClicksTriggered: finiteInteger(savedState.starClicksTriggered),
    secondsPlayed: finiteInteger(savedState.secondsPlayed),
    cycleProgress: Math.min(100, finiteNonNegative(savedState.cycleProgress)),
    eventTimeRemaining: finiteNonNegative(savedState.eventTimeRemaining, 120),
    prestigeCount: finiteInteger(savedState.prestigeCount),
    moonsCount: finiteInteger(savedState.moonsCount),
    constellations: copyNumberRecord(savedState.constellations),
    unlockedCosmetics: copyStringArray(savedState.unlockedCosmetics),
    cosmeticRarityLevels: copyStringRecord(savedState.cosmeticRarityLevels),
    glitterDust: finiteInteger(savedState.glitterDust),
    shootingStarsCount: finiteInteger(savedState.shootingStarsCount),
    blackHoleSize: Math.max(1, finiteInteger(savedState.blackHoleSize, 1)),
    craftedItems: copyNumberRecord(savedState.craftedItems),
    galaxyShards: finiteInteger(savedState.galaxyShards),
    zodiacLevels: copyNumberRecord(savedState.zodiacLevels),
    slummerGlassLevel: Math.max(1, finiteInteger(savedState.slummerGlassLevel, 1)),
    catalystLevel: finiteInteger(savedState.catalystLevel),
    doubleStellarLevel: finiteInteger(savedState.doubleStellarLevel),
    spentGalaxyShards: finiteInteger(savedState.spentGalaxyShards),
    superClickCharge: Math.min(100, finiteNonNegative(savedState.superClickCharge)),
    placedAnimals: Array.isArray(savedState.placedAnimals)
      ? savedState.placedAnimals.map((animal) => ({ ...animal }))
      : [],
    animalLove: copyNumberRecord(savedState.animalLove),
    animalLastPet: copyNumberRecord(savedState.animalLastPet),
    bowlLastFed: finiteNonNegative(savedState.bowlLastFed),
    bowlFedMinutesCredited: finiteNonNegative(savedState.bowlFedMinutesCredited),
  };
}

export function workerStateFromSave(raw: unknown): WorkerGameState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return hydrateWorkerState(raw as Partial<WorkerGameState>);
}

export function replaceWorkerState(target: WorkerGameState, next: WorkerGameState): void {
  const targetRecord = target as unknown as Record<string, unknown>;
  for (const key of Object.keys(targetRecord)) {
    delete targetRecord[key];
  }
  Object.assign(target, next);
}

export function createRunResetState(
  current: WorkerGameState,
  overrides: Partial<WorkerGameState> = {},
): WorkerGameState {
  return {
    ...createInitialWorkerState(),
    totalLifeEarned: current.totalLifeEarned,
    clicksCount: current.clicksCount,
    starClicksTriggered: current.starClicksTriggered,
    secondsPlayed: current.secondsPlayed,
    prestigeCount: current.prestigeCount,
    unlockedCosmetics: [...current.unlockedCosmetics],
    cosmeticRarityLevels: { ...current.cosmeticRarityLevels },
    glitterDust: current.glitterDust,
    shootingStarsCount: current.shootingStarsCount,
    blackHoleSize: current.blackHoleSize,
    craftedItems: { ...(current.craftedItems || {}) },
    galaxyShards: current.galaxyShards,
    zodiacLevels: { ...(current.zodiacLevels || {}) },
    slummerGlassLevel: current.slummerGlassLevel,
    catalystLevel: current.catalystLevel,
    doubleStellarLevel: current.doubleStellarLevel,
    unlockedGlitchGalaxy: current.unlockedGlitchGalaxy,
    spentGalaxyShards: current.spentGalaxyShards,
    glitchBenchmarks: current.glitchBenchmarks ? { ...current.glitchBenchmarks } : undefined,
    glitchCooldown: current.glitchCooldown,
    ...overrides,
  };
}
