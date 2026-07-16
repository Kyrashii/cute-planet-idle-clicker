import { calculateCost, INITIAL_ANIMALS } from "../data";
import { STATIC_UPGRADES } from "../data/upgrades";

export const MAX_PURCHASE_BATCH = 1_000;

export function normalizePurchaseCount(value: unknown, fallback = 1): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(MAX_PURCHASE_BATCH, Math.max(0, Math.floor(parsed)));
}

export function getAnimalBulkCost(
  animalId: string,
  currentCount: number,
  requestedCount: number,
): number | null {
  const animal = INITIAL_ANIMALS.find((entry) => entry.id === animalId);
  const count = normalizePurchaseCount(requestedCount);
  if (!animal || count <= 0) return null;

  let total = 0;
  for (let offset = 0; offset < count; offset += 1) {
    total += calculateCost(animal.baseCost, currentCount + offset, animal.costMultiplier);
  }
  return Number.isFinite(total) ? total : null;
}

export function getStarCost(currentCount: number): number {
  return calculateCost(50, Math.max(0, Math.floor(currentCount)), 1.4);
}

export function getUpgradeCost(upgradeId: string): number | null {
  const upgrade = STATIC_UPGRADES.find((entry) => entry.id === upgradeId);
  return upgrade ? upgrade.cost : null;
}
