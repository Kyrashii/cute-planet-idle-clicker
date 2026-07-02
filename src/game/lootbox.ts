import { COSMETIC_ITEMS, type CosmeticItem } from "../data/cosmetics";
import type { LootboxRoll, LootboxRarity } from "./protocol";

/**
 * Pure Sternschnuppen-lootbox roll logic, shared by the worker (authoritative
 * rolls via OPEN_LOOTBOXES) and unit tests. All randomness is injected.
 */

/** Weighted rarity table; `rand` is uniform in [0, 100). */
export function rollLootboxRarity(rand: number, hasGachaMagnet: boolean): LootboxRarity {
  if (hasGachaMagnet) {
    // Legendary 9%, Epic 20.8%, Rare 33%, Common 37.2%
    if (rand < 9) return "legendary";
    if (rand < 29.8) return "epic";
    if (rand < 62.8) return "rare";
    return "common";
  }
  // Legendary 6%, Epic 16%, Rare 33%, Common 45%
  if (rand < 6) return "legendary";
  if (rand < 22) return "epic";
  if (rand < 55) return "rare";
  return "common";
}

/** `rand` is uniform in [0, 1). Falls back to the full pool for empty rarities. */
export function pickCosmetic(rarity: LootboxRarity, rand: number): CosmeticItem {
  let pool = COSMETIC_ITEMS.filter((item) => item.rarity === rarity);
  if (pool.length === 0) pool = COSMETIC_ITEMS;
  return pool[Math.floor(rand * pool.length)];
}

export function getGlitterRefund(rarity: string): number {
  if (rarity === "legendary") return 100;
  if (rarity === "epic") return 45;
  if (rarity === "rare") return 15;
  return 5;
}

export interface RollLootboxesResult {
  results: LootboxRoll[];
  totalRefund: number;
  newlyUnlockedIds: string[];
}

export function rollLootboxes(
  count: number,
  options: {
    hasGachaMagnet: boolean;
    alreadyUnlocked: readonly string[];
    random?: () => number;
  },
): RollLootboxesResult {
  const random = options.random ?? Math.random;
  const owned = new Set(options.alreadyUnlocked);
  const results: LootboxRoll[] = [];
  const newlyUnlockedIds: string[] = [];
  let totalRefund = 0;

  for (let i = 0; i < count; i++) {
    const rarity = rollLootboxRarity(random() * 100, options.hasGachaMagnet);
    const cosmetic = pickCosmetic(rarity, random());
    const duplicate = owned.has(cosmetic.id);
    const refund = duplicate ? getGlitterRefund(cosmetic.rarity) : 0;
    if (!duplicate) {
      owned.add(cosmetic.id);
      newlyUnlockedIds.push(cosmetic.id);
    }
    totalRefund += refund;
    results.push({ cosmeticId: cosmetic.id, rarity: cosmetic.rarity, duplicate, refund });
  }

  return { results, totalRefund, newlyUnlockedIds };
}

export interface LootboxRollStack {
  cosmetic: CosmeticItem;
  count: number;
  /** True when at least one roll in this stack was a fresh unlock. */
  isNew: boolean;
  refund: number;
}

const RARITY_ORDER: Record<LootboxRarity, number> = {
  legendary: 3,
  epic: 2,
  rare: 1,
  common: 0,
};

/** Groups a roll list into per-cosmetic stacks: new unlocks first, then rarity desc. */
export function aggregateLootboxRolls(results: readonly LootboxRoll[]): LootboxRollStack[] {
  const byId = new Map<string, LootboxRollStack>();
  for (const roll of results) {
    const existing = byId.get(roll.cosmeticId);
    if (existing) {
      existing.count += 1;
      existing.isNew = existing.isNew || !roll.duplicate;
      existing.refund += roll.refund;
      continue;
    }
    const cosmetic = COSMETIC_ITEMS.find((item) => item.id === roll.cosmeticId);
    if (!cosmetic) continue;
    byId.set(roll.cosmeticId, {
      cosmetic,
      count: 1,
      isNew: !roll.duplicate,
      refund: roll.refund,
    });
  }
  return [...byId.values()].sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return RARITY_ORDER[b.cosmetic.rarity] - RARITY_ORDER[a.cosmetic.rarity];
  });
}
