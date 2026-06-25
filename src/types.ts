export interface Animal {
  id: string;
  name: string;
  germanName: string;
  emoji: string;
  image?: string;
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
  effect: (state: any) => any;
  effectDescription: string;
  germanEffectDescription: string;
  category: "click" | "animals" | "stars" | "special";
  emoji: string;
  costResource?: "life" | "glitterDust";
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  type: "click" | "star-click" | "level" | "heart" | "star" | "moon-click";
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
  behaviorSeed: number;
  facing: 1 | -1;
}

export type EnclosureRewardProfile = "paw" | "wing" | "splash" | "mythic";

export interface EnclosureTrack {
  id: string;
  animalId: string;
  profile: EnclosureRewardProfile;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  expiresAt: number;
}

export type EnclosureBuffScope = "all_animals" | "species";

export interface EnclosureBuff {
  id: string;
  sourceAnimalId: string;
  profile: EnclosureRewardProfile;
  label: string;
  multiplier: number;
  scope: EnclosureBuffScope;
  animalId?: string;
  expiresAt: number;
}

export type EnclosureRewardOutcome =
  | {
      kind: "buff";
      label: string;
      amount: number;
      buff: EnclosureBuff;
    }
  | {
      kind: "instant_life";
      label: string;
      amount: number;
    }
  | {
      kind: "instant_stars";
      label: string;
      amount: number;
    }
  | {
      kind: "love";
      label: string;
      amount: number;
      animalId: string;
    };

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
  activeEnclosureBuffs?: EnclosureBuff[];
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
