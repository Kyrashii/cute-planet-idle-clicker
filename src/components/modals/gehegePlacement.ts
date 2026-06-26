import type { PlacedAnimal } from "../../types";

export const POSITION_PADDING_X = 5;
export const POSITION_PADDING_Y = 7;

export interface GehegeDropResult {
  accepted: boolean;
  x: number;
  y: number;
}

export interface GehegeDragCommitResult extends GehegeDropResult {
  placedAnimals: PlacedAnimal[];
}

export function clampPercent(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveGehegeDrop(xPercent: number, yPercent: number): GehegeDropResult {
  const clampedX = clampPercent(xPercent, POSITION_PADDING_X, 100 - POSITION_PADDING_X);
  const clampedY = clampPercent(yPercent, POSITION_PADDING_Y, 100 - POSITION_PADDING_Y);
  const distToBowlX = Math.abs(clampedX - 50);
  const distToBowlY = Math.abs(clampedY - 78);

  if (distToBowlX < 8 && distToBowlY < 10) {
    return {
      accepted: false,
      x: clampedX,
      y: clampedY,
    };
  }

  return {
    accepted: true,
    x: clampedX,
    y: clampedY,
  };
}

export function applyGehegeDrop(
  placedAnimals: PlacedAnimal[],
  id: string,
  drop: GehegeDropResult,
): PlacedAnimal[] {
  return placedAnimals.map((animal) =>
    animal.id === id ? { ...animal, x: drop.x, y: drop.y } : animal,
  );
}

export function commitGehegeDrag(
  placedAnimals: PlacedAnimal[],
  id: string,
  xPercent: number,
  yPercent: number,
): GehegeDragCommitResult {
  const currentAnimal = placedAnimals.find((animal) => animal.id === id);
  if (!currentAnimal) {
    return {
      accepted: false,
      x: xPercent,
      y: yPercent,
      placedAnimals,
    };
  }

  const resolvedDrop = resolveGehegeDrop(xPercent, yPercent);
  if (!resolvedDrop.accepted) {
    return {
      accepted: false,
      x: currentAnimal.x,
      y: currentAnimal.y,
      placedAnimals,
    };
  }

  return {
    ...resolvedDrop,
    placedAnimals: applyGehegeDrop(placedAnimals, id, resolvedDrop),
  };
}
