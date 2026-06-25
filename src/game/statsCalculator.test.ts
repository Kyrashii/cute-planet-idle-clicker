import { describe, it, expect } from "vitest";
import { getLpsAndStats } from "./statsCalculator";

/**
 * Characterization tests: they lock the *current* numeric output of the hot-path
 * stats calculator so behaviour-preserving refactors (e.g. Set-based upgrade
 * lookups) can be proven identical. Inline snapshots capture a stable subset of
 * the returned fields.
 */
const pick = (state: unknown) => {
  const s = getLpsAndStats(state) as Record<string, number>;
  return {
    totalLps: s.totalLps,
    totalAnimalsLps: s.totalAnimalsLps,
    totalStarsLps: s.totalStarsLps,
    clickPower: s.clickPower,
    rawClickPower: s.rawClickPower,
    starPowerPerStar: s.starPowerPerStar,
    xpMultiplier: s.xpMultiplier,
    totalAnimalsCount: s.totalAnimalsCount,
    researchedUpgradesCount: s.researchedUpgradesCount,
    planetExpNeeded: s.planetExpNeeded,
  };
};

describe("getLpsAndStats (characterization)", () => {
  it("default empty state", () => {
    expect(pick({})).toMatchInlineSnapshot(`
      {
        "clickPower": 1,
        "planetExpNeeded": NaN,
        "rawClickPower": 1,
        "researchedUpgradesCount": 0,
        "starPowerPerStar": 1.5,
        "totalAnimalsCount": 0,
        "totalAnimalsLps": 0,
        "totalLps": 0,
        "totalStarsLps": 0,
        "xpMultiplier": 1,
      }
    `);
  });

  it("mixed state: animals + stars + click/animal upgrades (night)", () => {
    const state = {
      purchasedAnimals: { bunny: 10, chick: 5, cat: 3 },
      purchasedUpgrades: [
        "upg-click-1",
        "upg-click-2",
        "upg-bunny-1",
        "upg-global-1",
        "upg-star-glow",
      ],
      starsCount: 20,
      planetLevel: 4,
      isNight: true,
      zodiac: "katze",
    };
    expect(pick(state)).toMatchInlineSnapshot(`
      {
        "clickPower": 7,
        "planetExpNeeded": 60000,
        "rawClickPower": 7,
        "researchedUpgradesCount": 5,
        "starPowerPerStar": 4.800000000000001,
        "totalAnimalsCount": 18,
        "totalAnimalsLps": 23.25,
        "totalLps": 119.25000000000001,
        "totalStarsLps": 96.00000000000001,
        "xpMultiplier": 1,
      }
    `);
  });

  it("daytime click bonus + fuchs zodiac", () => {
    const state = {
      purchasedAnimals: { bunny: 2 },
      purchasedUpgrades: ["upg-click-1", "upg-click-multiplier"],
      starsCount: 0,
      planetLevel: 2,
      isNight: false,
      zodiac: "fuchs",
      zodiacLevels: { fuchs: 3 },
    };
    expect(pick(state)).toMatchInlineSnapshot(`
      {
        "clickPower": 11,
        "planetExpNeeded": 5000,
        "rawClickPower": 4,
        "researchedUpgradesCount": 2,
        "starPowerPerStar": 1.6,
        "totalAnimalsCount": 2,
        "totalAnimalsLps": 0.2,
        "totalLps": 0.2,
        "totalStarsLps": 0,
        "xpMultiplier": 1,
      }
    `);
  });

  it("applies enclosure buffs to species and global animal output", () => {
    const state = {
      purchasedAnimals: { bunny: 10, chick: 5 },
      activeEnclosureBuffs: [
        {
          id: "buff-global",
          sourceAnimalId: "phoenix",
          profile: "mythic",
          label: "Mythen-Glanz",
          multiplier: 1.2,
          scope: "all_animals",
          expiresAt: Date.now() + 20_000,
        },
        {
          id: "buff-bunny",
          sourceAnimalId: "bunny",
          profile: "paw",
          label: "Pfoten-Power",
          multiplier: 1.5,
          scope: "species",
          animalId: "bunny",
          expiresAt: Date.now() + 20_000,
        },
      ],
    };

    const result = getLpsAndStats(state) as Record<string, unknown>;
    const animalLpsMap = result.animalLpsMap as Record<string, number>;
    expect(animalLpsMap.bunny).toBeCloseTo(1.8, 5);
    expect(animalLpsMap.chick).toBeCloseTo(3.6, 5);
    expect(result.totalAnimalsLps).toBeCloseTo(5.4, 5);
  });
});
