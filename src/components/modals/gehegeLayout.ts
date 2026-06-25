import type { EnclosureRewardProfile, EnclosureTrack, PlacedAnimal } from "../../types";

export const BOWL_ZONE = {
  x: 50,
  y: 78,
  radiusX: 8,
  radiusY: 10,
};

export const ENCL_MIN_X = 6;
export const ENCL_MAX_X = 94;
export const ENCL_MIN_Y = 8;
export const ENCL_MAX_Y = 90;
export const ANIMAL_MIN_DISTANCE = 8;

export function isPointInBowlZone(x: number, y: number): boolean {
  return (
    Math.abs(x - BOWL_ZONE.x) < BOWL_ZONE.radiusX && Math.abs(y - BOWL_ZONE.y) < BOWL_ZONE.radiusY
  );
}

export function isValidEnclosurePosition(
  x: number,
  y: number,
  placedAnimals: PlacedAnimal[],
  ignoreId?: string,
): boolean {
  if (x < ENCL_MIN_X || x > ENCL_MAX_X || y < ENCL_MIN_Y || y > ENCL_MAX_Y) return false;
  if (isPointInBowlZone(x, y)) return false;

  return placedAnimals.every((animal) => {
    if (animal.id === ignoreId) return true;
    const dist = Math.hypot(animal.x - x, animal.y - y);
    return dist >= ANIMAL_MIN_DISTANCE;
  });
}

export function pickWanderTarget(
  currentAnimal: PlacedAnimal,
  placedAnimals: PlacedAnimal[],
  wanderRadius: number,
): { x: number; y: number; facing: 1 | -1 } {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const radius = Math.max(4, Math.random() * wanderRadius);
    const angle = Math.random() * Math.PI * 2;
    const x = currentAnimal.x + Math.cos(angle) * radius;
    const y = currentAnimal.y + Math.sin(angle) * radius * 0.65;
    if (isValidEnclosurePosition(x, y, placedAnimals, currentAnimal.id)) {
      return {
        x,
        y,
        facing: x >= currentAnimal.x ? 1 : -1,
      };
    }
  }

  return {
    x: currentAnimal.x,
    y: currentAnimal.y,
    facing: currentAnimal.facing,
  };
}

export function createTrackCluster(
  animalId: string,
  profile: EnclosureRewardProfile,
  x: number,
  y: number,
  now: number,
  lifetimeMs: number,
): EnclosureTrack[] {
  const count = 1 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, index) => ({
    id: `track-${animalId}-${now}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    animalId,
    profile,
    x: Math.max(ENCL_MIN_X, Math.min(ENCL_MAX_X, x + (Math.random() * 6 - 3))),
    y: Math.max(ENCL_MIN_Y, Math.min(ENCL_MAX_Y, y + (Math.random() * 5 - 2.5))),
    scale: 0.9 + Math.random() * 0.35,
    rotation: Math.random() * 24 - 12,
    expiresAt: now + lifetimeMs,
  }));
}
