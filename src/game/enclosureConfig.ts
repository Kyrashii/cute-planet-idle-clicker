import { INITIAL_ANIMALS } from "../data";
import type { Animal, EnclosureRewardProfile } from "../types";
import { getAnimalRewardProfile } from "./enclosureRewards";

export interface EnclosureAnimalConfig {
  animalId: string;
  rewardProfile: EnclosureRewardProfile;
  walkCycleMs: number;
  travelSpeed: number;
  idleRangeMs: [number, number];
  wanderRadius: number;
  trackChance: number;
  pickupRotation: number;
  pickupOffset: { x: number; y: number };
  dropShadow: string;
  spritePaths: {
    idle: string;
    walkA: string;
    walkB: string;
    held: string;
    track: string;
  };
}

const SHADOWS = [
  "drop-shadow-[0_7px_10px_rgba(244,114,182,0.28)]",
  "drop-shadow-[0_7px_10px_rgba(56,189,248,0.28)]",
  "drop-shadow-[0_7px_10px_rgba(250,204,21,0.28)]",
  "drop-shadow-[0_7px_10px_rgba(129,140,248,0.32)]",
];

function buildConfig(def: Animal, index: number): EnclosureAnimalConfig {
  const rewardProfile = getAnimalRewardProfile(def.id);
  const walkCycleMs = 650 + (index % 4) * 90;
  const travelSpeed = 6 + (index % 5) * 0.7;
  const idleMin = 2_200 + (index % 3) * 350;
  const idleMax = idleMin + 1_700 + (index % 4) * 180;
  const wanderRadius = 10 + (index % 5) * 1.7;
  const trackChance =
    rewardProfile === "mythic"
      ? 0.34
      : rewardProfile === "wing"
        ? 0.26
        : rewardProfile === "splash"
          ? 0.28
          : 0.31;
  const pickupRotation =
    rewardProfile === "wing" ? (index % 2 === 0 ? -10 : 10) : rewardProfile === "splash" ? -6 : 6;
  const pickupOffset = {
    x: rewardProfile === "wing" ? 0 : rewardProfile === "splash" ? -2 : 1,
    y: rewardProfile === "mythic" ? -10 : -8,
  };

  return {
    animalId: def.id,
    rewardProfile,
    walkCycleMs,
    travelSpeed,
    idleRangeMs: [idleMin, idleMax],
    wanderRadius,
    trackChance,
    pickupRotation,
    pickupOffset,
    dropShadow: SHADOWS[index % SHADOWS.length],
    spritePaths: {
      idle: `/assets/animals/animated/${def.id}/idle.png`,
      walkA: `/assets/animals/animated/${def.id}/walk-a.png`,
      walkB: `/assets/animals/animated/${def.id}/walk-b.png`,
      held: `/assets/animals/animated/${def.id}/held.png`,
      track: `/assets/animals/tracks/${def.id}.png`,
    },
  };
}

export const ENCLOSURE_ANIMAL_CONFIGS = Object.fromEntries(
  INITIAL_ANIMALS.map((animal, index) => [animal.id, buildConfig(animal, index)]),
) as Record<string, EnclosureAnimalConfig>;
