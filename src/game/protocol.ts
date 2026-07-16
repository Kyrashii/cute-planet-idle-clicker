/**
 * Typed contract for the main-thread <-> game-worker boundary.
 *
 * This is the single source of truth for:
 *   - `WorkerGameState`  — the worker's authoritative, mutable game state.
 *   - `WorkerCommand`    — messages the UI thread sends TO the worker.
 *   - `WorkerEvent`      — messages the worker sends BACK to the UI thread.
 *
 * Both `game.worker.ts` / `game/workerActions.ts` (worker side) and the
 * `useGameWorker` hook (UI side) import from here, so a payload mismatch is a
 * compile error rather than a silent runtime break. Types are erased at build
 * time, so adopting this contract changes no runtime behaviour.
 */
import type { PlanetTask, ActiveCosmicEvent, Achievement, PlacedAnimal } from "../types";
import type { getLpsAndStats } from "./statsCalculator";

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

/** The worker's full, mutable game state (previously `WorkerState`). */
export interface WorkerGameState {
  life: number;
  totalLifeEarned: number;
  starsCount: number;
  purchasedAnimals: Record<string, number>;
  purchasedUpgrades: string[];
  planetLevel: number;
  planetTask?: PlanetTask;
  clicksCount: number;
  starClicksTriggered: number;
  secondsPlayed: number;
  isNight: boolean;
  cycleProgress: number;
  activeEvent: string | null;
  activeEventDecision: string | null;
  activeEventDetails?: ActiveCosmicEvent | null;
  activeEventInstantClaimed?: boolean;
  eventTimeRemaining: number;
  prestigeCount: number;
  moonsCount: number;
  constellations: Record<string, number>;
  unlockedCosmetics: string[];
  cosmeticRarityLevels: Record<string, string>;
  glitterDust: number;
  shootingStarsCount: number;
  blackHoleSize?: number;
  craftedItems?: Record<string, number>;
  zodiac?: string;
  galaxyShards: number;
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
  superClickCharge: number;
  superClickArmed: boolean;
  placedAnimals?: PlacedAnimal[];
  animalLove?: Record<string, number>;
  animalLastPet?: Record<string, number>;
  bowlLastFed?: number;
  bowlFedMinutesCredited?: number;
}

export interface GlitchBenchmarks {
  prestigeTarget: number;
  stardustTarget: number;
  shardsTarget: number;
  phoenixTarget: number;
  glitterTarget: number;
}

/** Flat game-state snapshot carried by a `STATE_UPDATE` event. */
export interface WorkerStatePayload {
  life: number;
  totalLifeEarned: number;
  starsCount: number;
  purchasedAnimals: Record<string, number>;
  purchasedUpgrades: string[];
  planetLevel: number;
  planetTask?: PlanetTask;
  clicksCount: number;
  starClicksTriggered: number;
  secondsPlayed: number;
  isNight: boolean;
  cycleProgress: number;
  activeEvent: string | null;
  activeEventDecision: string | null;
  activeEventDetails: ActiveCosmicEvent | null;
  activeEventInstantClaimed: boolean;
  eventTimeRemaining: number;
  prestigeCount: number;
  moonsCount: number;
  constellations: Record<string, number>;
  unlockedCosmetics: string[];
  cosmeticRarityLevels: Record<string, string>;
  glitterDust: number;
  shootingStarsCount: number;
  blackHoleSize: number;
  craftedItems: Record<string, number>;
  zodiac: string;
  galaxyShards: number;
  zodiacLevels: Record<string, number>;
  slummerGlassLevel: number;
  catalystLevel: number;
  doubleStellarLevel: number;
  inGlitchGalaxy: boolean;
  glitchPending: boolean;
  unlockedGlitchGalaxy: boolean;
  spentGalaxyShards: number;
  glitchBenchmarks?: GlitchBenchmarks;
  glitchCooldown: boolean;
  superClickCharge: number;
  superClickArmed: boolean;
  placedAnimals: PlacedAnimal[];
  animalLove: Record<string, number>;
  animalLastPet: Record<string, number>;
  bowlLastFed: number;
  bowlFedMinutesCredited: number;
}

/** Raw LPS/stats result from `getLpsAndStats` (without the achievements count). */
export type StatsResult = ReturnType<typeof getLpsAndStats>;

/** Pure LPS/stats result from `getLpsAndStats`, plus the achievements count. */
export type CalculationsSnapshot = StatsResult & {
  unlockedAchievementsCount: number;
};

export interface CraftedItemRewards {
  lifeGained: number;
  starsGained: number;
  moonsGained: number;
  glitterGained: number;
  lootboxesGained: number;
  prestigeGained: number;
  unlockedCosmeticsList: Array<{
    id: string;
    name: string;
    emoji: string;
    duplicateRefund: boolean;
  }>;
  animalsSpawned: Record<string, number>;
  eventsTriggered: string[];
}

// ---------------------------------------------------------------------------
// UI -> worker commands
// ---------------------------------------------------------------------------

export type UpgradeBatchItem = { id: string; isGlitter: boolean };
export type PauseReason = "visibility" | "roguelite";

export type WorkerCommand =
  // Lifecycle
  | { type: "INIT"; savedState?: Partial<WorkerGameState> | null }
  | { type: "CLEANUP" }
  | { type: "SET_PAUSED"; reason: PauseReason; paused: boolean }
  // Interaction
  | { type: "CLICK"; x: number; y: number }
  | { type: "ACTIVATE_SUPER_CLICK" }
  | { type: "CLAIM_OFFLINE_EARNINGS"; seconds: number }
  | {
      type: "SYNC_ENCLOSURE";
      placedAnimals: PlacedAnimal[];
      animalLove: Record<string, number>;
      animalLastPet: Record<string, number>;
      bowlLastFed: number;
      bowlFedMinutesCredited: number;
    }
  // Purchases
  | { type: "BUY_ANIMAL"; animalId: string; count: number }
  | { type: "BUY_STAR" }
  | { type: "BUY_UPGRADE"; id: string }
  | { type: "BUY_UPGRADE_GLITTER"; id: string }
  | { type: "BUY_UPGRADES_BATCH"; upgradesList: UpgradeBatchItem[] }
  // Crafting / inventory
  | { type: "CRAFT_ITEM"; recipeId: string; count?: number }
  | { type: "CRAFT_RECURSIVE"; targetItemId: string; count?: number }
  | { type: "USE_CRAFTED_ITEM"; itemId: string; count?: number }
  // Progression / meta-currencies
  | { type: "PRESTIGE" }
  | { type: "MERGE_MOONS" }
  | { type: "INVEST_CONSTELLATION"; constellationId: string }
  | { type: "UPGRADE_ZODIAC_LEVEL"; id: string; cost: number }
  | { type: "UPGRADE_SLUMMER_GLASS"; cost: number }
  | { type: "UPGRADE_CATALYST"; cost: number }
  | { type: "UPGRADE_DOUBLE_STELLAR"; cost: number }
  | { type: "SET_ZODIAC"; zodiacId: string }
  | { type: "UPDATE_SHOOTING_STARS"; count: number }
  | { type: "MISSION_CLAIMED" }
  | { type: "ADD_GLITTER_DUST"; amount: number }
  | { type: "ADD_GALAXY_SHARDS"; amount: number }
  | { type: "SPEND_GLITTER_DUST"; amount: number }
  // Cosmetics
  | { type: "UNLOCK_COSMETIC_DIRECT"; cosmeticId: string; cost: number }
  | { type: "OPEN_LOOTBOXES"; count: number }
  | { type: "UPGRADE_COSMETIC_RARITY"; cosmeticId: string; targetRarity: string; cost: number }
  // Events
  | { type: "SET_EVENT_DECISION"; decision: string }
  | { type: "FORCE_TRIGGER_EVENT"; event: string }
  | { type: "SET_NIGHT_CYCLE_FORCE"; isNight: boolean }
  | { type: "BLACK_HOLE_GAMBLE"; sacrificeType: "life" | "stars" | "dust" }
  // Glitch galaxy
  | { type: "ENTER_GLITCH_GALAXY" }
  | { type: "REPAIR_GLITCH_GALAXY" }
  // Cheats / dev
  | { type: "CHIPS_CHEAT" }
  | { type: "SET_PLANET_LEVEL"; level: number }
  | { type: "RESET" };

export type WorkerCommandType = WorkerCommand["type"];

// ---------------------------------------------------------------------------
// Worker -> UI events
// ---------------------------------------------------------------------------

export interface StateUpdateEvent {
  type: "STATE_UPDATE";
  state: WorkerStatePayload;
  calculations: CalculationsSnapshot;
  achievements?: Achievement[];
}

/** Result payload the UI's opening-result modal renders after a crafted item is opened. */
export interface OpeningResult {
  itemId: string;
  itemName: string;
  itemEmoji: string;
  count: number;
  rewards: CraftedItemRewards;
}

/** UI state for the black-hole gamble result dialog. */
export interface BlackHoleResultState {
  show: boolean;
  title?: string;
  text?: string;
  success: boolean;
  outcomeType?: "good" | "bad";
}

export type LootboxRarity = "common" | "rare" | "epic" | "legendary";

/** One Sternschnuppen-lootbox roll, in roll order. */
export interface LootboxRoll {
  cosmeticId: string;
  rarity: LootboxRarity;
  duplicate: boolean;
  /** Glitter dust refunded for this roll (0 for fresh unlocks). */
  refund: number;
}

/** Batch result the UI's gacha wave-reveal renders after OPEN_LOOTBOXES. */
export interface LootboxesOpenedEvent {
  type: "LOOTBOXES_OPENED";
  results: LootboxRoll[];
  totalRefund: number;
  opened: number;
}

export type WorkerEvent =
  | StateUpdateEvent
  | { type: "STAR_TRIGGER"; reward: number; starsCount: number }
  | { type: "MOON_TRIGGER"; reward: number; moonsCount: number }
  | { type: "CLICK_EFFECT"; actualClickLife: number; isCritical: boolean; x: number; y: number }
  | {
      type: "SUPER_CLICK_TRIGGERED";
      reward: number;
      hits: number;
      productionSeconds: number;
      stardust: number;
      stars: number;
      glitterDust: number;
    }
  | { type: "LEVEL_UP"; level: number }
  | { type: "EVENT_TRIGGER"; event: string | null; active: boolean }
  | { type: "COSMETIC_FOUND"; text: string }
  | LootboxesOpenedEvent
  | {
      type: "CRAFTED_ITEMS_OPENED";
      itemId: string;
      count: number;
      rewards: CraftedItemRewards;
      text: string;
      itemName: string;
      itemEmoji: string;
    }
  | {
      type: "BLACK_HOLE_GAMBLE_RESULT";
      success: boolean;
      roll?: number;
      outcomeType?: "good" | "bad";
      title?: string;
      text?: string;
      error?: string;
    };

export type WorkerEventType = WorkerEvent["type"];
