import { describe, it, expect } from "vitest";
import {
  rollLootboxRarity,
  pickCosmetic,
  getGlitterRefund,
  rollLootboxes,
  aggregateLootboxRolls,
} from "./lootbox";
import { COSMETIC_ITEMS } from "../data/cosmetics";
import type { LootboxRoll } from "./protocol";

describe("rollLootboxRarity", () => {
  it("uses the base weight table without the gacha magnet", () => {
    expect(rollLootboxRarity(0, false)).toBe("legendary");
    expect(rollLootboxRarity(5.99, false)).toBe("legendary");
    expect(rollLootboxRarity(6, false)).toBe("epic");
    expect(rollLootboxRarity(21.99, false)).toBe("epic");
    expect(rollLootboxRarity(22, false)).toBe("rare");
    expect(rollLootboxRarity(54.99, false)).toBe("rare");
    expect(rollLootboxRarity(55, false)).toBe("common");
    expect(rollLootboxRarity(99.99, false)).toBe("common");
  });

  it("uses the boosted table with the gacha magnet", () => {
    expect(rollLootboxRarity(8.99, true)).toBe("legendary");
    expect(rollLootboxRarity(9, true)).toBe("epic");
    expect(rollLootboxRarity(29.79, true)).toBe("epic");
    expect(rollLootboxRarity(29.8, true)).toBe("rare");
    expect(rollLootboxRarity(62.79, true)).toBe("rare");
    expect(rollLootboxRarity(62.8, true)).toBe("common");
  });
});

describe("getGlitterRefund", () => {
  it("matches the historical refund table", () => {
    expect(getGlitterRefund("legendary")).toBe(100);
    expect(getGlitterRefund("epic")).toBe(45);
    expect(getGlitterRefund("rare")).toBe(15);
    expect(getGlitterRefund("common")).toBe(5);
  });
});

describe("pickCosmetic", () => {
  it("picks from the requested rarity pool", () => {
    const item = pickCosmetic("legendary", 0);
    expect(item.rarity).toBe("legendary");
  });
});

describe("rollLootboxes", () => {
  it("marks repeats of the same cosmetic within one batch as duplicates", () => {
    // random() = 0 always: legendary rarity, first item of the legendary pool.
    const { results, totalRefund, newlyUnlockedIds } = rollLootboxes(3, {
      hasGachaMagnet: false,
      alreadyUnlocked: [],
      random: () => 0,
    });

    expect(results).toHaveLength(3);
    expect(results[0].duplicate).toBe(false);
    expect(results[0].refund).toBe(0);
    expect(results[1].duplicate).toBe(true);
    expect(results[1].refund).toBe(100);
    expect(results[2].duplicate).toBe(true);
    expect(newlyUnlockedIds).toEqual([results[0].cosmeticId]);
    expect(totalRefund).toBe(200);
  });

  it("treats already-owned cosmetics as duplicates", () => {
    const first = rollLootboxes(1, {
      hasGachaMagnet: false,
      alreadyUnlocked: [],
      random: () => 0,
    });
    const owned = first.results[0].cosmeticId;

    const { results, newlyUnlockedIds } = rollLootboxes(1, {
      hasGachaMagnet: false,
      alreadyUnlocked: [owned],
      random: () => 0,
    });

    expect(results[0].duplicate).toBe(true);
    expect(newlyUnlockedIds).toEqual([]);
  });
});

describe("aggregateLootboxRolls", () => {
  it("stacks repeated cosmetics and sorts new unlocks first, then rarity", () => {
    const common = COSMETIC_ITEMS.find((i) => i.rarity === "common")!;
    const legendary = COSMETIC_ITEMS.find((i) => i.rarity === "legendary")!;
    const rolls: LootboxRoll[] = [
      { cosmeticId: legendary.id, rarity: "legendary", duplicate: true, refund: 100 },
      { cosmeticId: common.id, rarity: "common", duplicate: false, refund: 0 },
      { cosmeticId: legendary.id, rarity: "legendary", duplicate: true, refund: 100 },
    ];

    const stacks = aggregateLootboxRolls(rolls);
    expect(stacks).toHaveLength(2);
    expect(stacks[0].cosmetic.id).toBe(common.id);
    expect(stacks[0].isNew).toBe(true);
    expect(stacks[1].cosmetic.id).toBe(legendary.id);
    expect(stacks[1].count).toBe(2);
    expect(stacks[1].refund).toBe(200);
  });
});
