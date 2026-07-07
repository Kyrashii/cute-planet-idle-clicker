import type { ActiveRogueliteRun, RogueliteMetaState } from "./roguelite/types";
import type { GlitchBenchmarks } from "./game/protocol";

/** A single generated achievement (produced by `generateAchievements`, rendered by the modal). */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  isUnlocked: boolean;
  emoji: string;
}

export interface Animal {
  id: string;
  name: string;
  germanName: string;
  emoji: string;
  image?: string;
  sheetSrc?: string;
  frameWidth?: number;
  frameHeight?: number;
  columns?: number;
  walkFrames?: number;
  liftFrames?: number;
  baseCost: number;
  costMultiplier: number;
  baseLps: number; // Life Per Second
  count: number;
  description: string;
  germanDescription: string;
  color: string; // Pastel background color
}

export interface StarUpgrade {
  id: string;
  name: string;
  germanName: string;
  baseCost: number;
  costMultiplier: number;
  count: number;
  multiplier: number; // Click multiplier or LPS from stars
  description: string;
  germanDescription: string;
}

export interface Upgrade {
  id: string;
  name: string;
  germanName: string;
  cost: number;
  purchased: boolean;
  effect: (state: GameState) => GameState;
  effectDescription: string;
  germanEffectDescription: string;
  category: "click" | "animals" | "stars" | "special" | "super-click";
  emoji: string;
  costResource?: "life" | "glitterDust";
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  type: "click" | "crit-click" | "star-click" | "level" | "heart" | "star" | "moon-click";
  createdAt?: number;
}

export interface PlanetTask {
  id: string;
  name: string;
  description: string;
  type: string;
  progress: number;
  target: number;
  targetAnimalId?: string;
  isCumulative?: boolean;
}

export interface PlacedAnimal {
  id: string;
  animalId: string;
  x: number;
  y: number;
}

export interface GameState {
  life: number;
  totalLifeEarned: number;
  clickPower: number;
  animals: Record<string, number>; // animalId -> count
  starsCount: number;
  starLevel: number; // Star level determines clicking power per star
  purchasedUpgrades: string[]; // upgradeIds
  planetLevel: number;
  planetExp: number;
  planetExpNeeded: number;
  planetTask?: PlanetTask;
  unlockedCosmetics?: string[];
  activeStarColor?: string;
  activeAccessory?: string;
  activeFrame?: string;
  shootingStarsCount?: number;
  missionSetNumber?: number;
  claimedMissionIds?: string[];
  missionsCooldownEnd?: number | null;
  prestigeCount?: number;
  moonsCount?: number;
  constellations?: Record<string, number>; // constellationId -> level (0 if unpurchased)
  glitterDust?: number;
  blackHoleSize?: number;
  zodiac?: string;
  galaxyShards?: number;
  zodiacLevels?: Record<string, number>;
  slummerGlassLevel?: number;
  catalystLevel?: number;
  doubleStellarLevel?: number;
  activeEvent?: string | null;
  activeEventDecision?: string | null;
  eventTimeRemaining?: number;
  activeEventDetails?: ActiveCosmicEvent | null;
  inGlitchGalaxy?: boolean;
  glitchPending?: boolean;
  unlockedGlitchGalaxy?: boolean;
  spentGalaxyShards?: number;
  glitchBenchmarks?: {
    prestigeTarget: number;
    stardustTarget: number;
    shardsTarget: number;
    phoenixTarget: number;
    glitterTarget: number;
  };
  placedAnimals?: PlacedAnimal[];
  animalLove?: Record<string, number>; // animalId -> level of love
  animalLastPet?: Record<string, number>; // animalId -> timestamp (ms)
  bowlLastFed?: number; // timestamp (ms) of last feed click
  bowlFedMinutesCredited?: number; // number of minutes credited under current feed
  rogueliteMeta?: RogueliteMetaState;
  activeRogueliteRun?: ActiveRogueliteRun | null;
  activePlanetSkin?: string;
}

export interface CosmicEventOption {
  id: string;
  name: string;
  description: string;
  effectType: string;
  bonusLife?: number;
  bonusStars?: number;
  bonusDust?: number;
  bonusMoons?: number;
}

export interface ActiveCosmicEvent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  options: CosmicEventOption[];
}

/**
 * The persisted game-save shape assembled by the autosave / cloud-sync path (see the
 * `autoSaveStateRef` / `latestCloudSaveRef` literals and `writeSave`). Every field is optional so
 * the same type serves the slightly different snapshots written for local autosave vs. cloud sync,
 * and so partial snapshots (e.g. the cheat handler's offline recompute) remain assignable.
 */
export type GameSaveSnapshot = {
  isLoaded?: boolean;
  life?: number;
  totalLifeEarned?: number;
  starsCount?: number;
  moonsCount?: number;
  purchasedAnimals?: Record<string, number>;
  purchasedUpgrades?: string[];
  planetLevel?: number;
  planetExp?: number;
  planetTask?: PlanetTask;
  clicksCount?: number;
  starClicksTriggered?: number;
  secondsPlayed?: number;
  isNight?: boolean;
  unlockedCosmetics?: string[];
  activeStarColor?: string;
  activeAccessory?: string;
  activeFrame?: string;
  activeMoonSkin?: string;
  activePlanetSkin?: string;
  shootingStarsCount?: number;
  missionSetNumber?: number;
  claimedMissionIds?: string[];
  missionsCooldownEnd?: number | null;
  prestigeCount?: number;
  galaxyShards?: number;
  offlineSeconds?: number;
  offlineLpsRate?: number;
  offlineEarnedLife?: number;
  constellations?: Record<string, number>;
  craftedItems?: Record<string, number>;
  placedAnimals?: PlacedAnimal[];
  animalLove?: Record<string, number>;
  animalLastPet?: Record<string, number>;
  bowlLastFed?: number;
  bowlFedMinutesCredited?: number;
  glitterDust?: number;
  cosmeticRarityLevels?: Record<string, string>;
  blackHoleSize?: number;
  /** Local-autosave snapshots carry the zodiac id under `activeZodiacId`; cloud uses `zodiac`. */
  activeZodiacId?: string;
  zodiac?: string;
  zodiacLevels?: Record<string, number>;
  slummerGlassLevel?: number;
  catalystLevel?: number;
  doubleStellarLevel?: number;
  inGlitchGalaxy?: boolean;
  glitchPending?: boolean;
  unlockedGlitchGalaxy?: boolean;
  spentGalaxyShards?: number;
  glitchBenchmarks?: GlitchBenchmarks;
  glitchCooldown?: boolean;
  superClickCharge?: number;
  superClickArmed?: boolean;
  rogueliteMeta?: RogueliteMetaState;
  activeRogueliteRun?: ActiveRogueliteRun | null;
  lastSavedAt?: number;
};
