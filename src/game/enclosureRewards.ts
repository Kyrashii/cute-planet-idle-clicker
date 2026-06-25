import { INITIAL_ANIMALS } from "../data";
import type { EnclosureBuff, EnclosureRewardOutcome, EnclosureRewardProfile } from "../types";
import type { StatsResult, WorkerGameState } from "./protocol";

export const ENCLOSURE_BUFF_DURATION_MS = 20_000;
export const ENCLOSURE_TRACK_LIFETIME_MS = 18_000;
export const ENCLOSURE_TRACK_LIMIT = 5;

const MYTHIC_IDS = new Set(["unicorn", "dragon", "phoenix"]);
const SPLASH_IDS = new Set([
  "penguin",
  "seal",
  "otter",
  "turtle",
  "dolphin",
  "whale",
  "duck",
  "swan",
  "octopus",
]);
const WING_IDS = new Set([
  "chick",
  "ladybug",
  "bee",
  "butterfly",
  "owl",
  "dove",
  "parrot",
  "flamingo",
  "peacock",
  "phoenix",
]);

export function getAnimalRewardProfile(animalId: string): EnclosureRewardProfile {
  if (MYTHIC_IDS.has(animalId)) return "mythic";
  if (SPLASH_IDS.has(animalId)) return "splash";
  if (WING_IDS.has(animalId)) return "wing";
  return "paw";
}

export function getAnimalTierBucket(animalId: string): number {
  const idx = INITIAL_ANIMALS.findIndex((animal) => animal.id === animalId);
  if (idx < 0) return 0;
  return Math.max(0, Math.min(5, Math.floor(idx / 8)));
}

function buildBuff(
  sourceAnimalId: string,
  profile: EnclosureRewardProfile,
  label: string,
  multiplier: number,
  scope: EnclosureBuff["scope"],
  now: number,
  animalId?: string,
): EnclosureBuff {
  return {
    id: `buff-${sourceAnimalId}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    sourceAnimalId,
    profile,
    label,
    multiplier,
    scope,
    animalId,
    expiresAt: now + ENCLOSURE_BUFF_DURATION_MS,
  };
}

export function pruneExpiredEnclosureBuffs<T extends { expiresAt: number }>(
  buffs: T[] | undefined,
  now: number,
): T[] {
  return (buffs || []).filter((buff) => buff.expiresAt > now);
}

export function resolveEnclosureReward(
  state: WorkerGameState,
  stats: StatsResult,
  animalId: string,
  profile: EnclosureRewardProfile,
  now: number = Date.now(),
): EnclosureRewardOutcome {
  const roll = Math.random();
  const tierBucket = getAnimalTierBucket(animalId);
  const speciesLps = Math.max(0, stats.animalLpsMap?.[animalId] || 0);

  if (profile === "paw") {
    if (roll < 0.7) {
      return {
        kind: "buff",
        label: "Pfoten-Power",
        amount: 1.5,
        buff: buildBuff(animalId, profile, "Pfoten-Power", 1.5, "species", now, animalId),
      };
    }
    if (roll < 0.9) {
      return {
        kind: "love",
        label: "Kuschelherz",
        amount: 3,
        animalId,
      };
    }
    return {
      kind: "instant_life",
      label: "Pfoten-Fund",
      amount: Math.max(1, Math.round(speciesLps * 15)),
    };
  }

  if (profile === "wing") {
    if (roll < 0.6) {
      return {
        kind: "instant_stars",
        label: "Federfunkeln",
        amount: 1 + tierBucket,
      };
    }
    if (roll < 0.85) {
      return {
        kind: "buff",
        label: "Fluegelwind",
        amount: 1.15,
        buff: buildBuff(animalId, profile, "Fluegelwind", 1.15, "all_animals", now),
      };
    }
    return {
      kind: "love",
      label: "Zwitscherkuss",
      amount: 3,
      animalId,
    };
  }

  if (profile === "splash") {
    if (roll < 0.6) {
      return {
        kind: "instant_life",
        label: "Planschsegen",
        amount: Math.max(1, Math.round(speciesLps * 20)),
      };
    }
    if (roll < 0.85) {
      return {
        kind: "buff",
        label: "Wellenhuepfer",
        amount: 1.4,
        buff: buildBuff(animalId, profile, "Wellenhuepfer", 1.4, "species", now, animalId),
      };
    }
    const stars = Math.max(1, Math.min(4, 1 + tierBucket));
    return {
      kind: "instant_stars",
      label: "Schimmerperle",
      amount: stars,
    };
  }

  if (roll < 0.5) {
    return {
      kind: "buff",
      label: "Mythen-Glanz",
      amount: 1.2,
      buff: buildBuff(animalId, profile, "Mythen-Glanz", 1.2, "all_animals", now),
    };
  }
  if (roll < 0.8) {
    return {
      kind: "instant_stars",
      label: "Sternenkuss",
      amount: 2 + tierBucket,
    };
  }
  return {
    kind: "love",
    label: "Legendenschmuser",
    amount: 5,
    animalId,
  };
}

export function applyEnclosureRewardToState(
  state: WorkerGameState,
  reward: EnclosureRewardOutcome,
): void {
  if (reward.kind === "buff") {
    state.activeEnclosureBuffs = pruneExpiredEnclosureBuffs(state.activeEnclosureBuffs, Date.now());
    state.activeEnclosureBuffs.push(reward.buff);
    return;
  }

  if (reward.kind === "instant_life") {
    state.life += reward.amount;
    state.totalLifeEarned += reward.amount;
    return;
  }

  if (reward.kind === "instant_stars") {
    state.starsCount += reward.amount;
    return;
  }

  state.animalLove = state.animalLove || {};
  const currentLove = state.animalLove[reward.animalId] || 0;
  state.animalLove[reward.animalId] = Math.min(300, currentLove + reward.amount);
}
