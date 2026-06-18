import { describe, it, expect } from "vitest";
import { calculateOfflineLps } from "./offline";

describe("calculateOfflineLps", () => {
  it("returns 0 for null/undefined input", () => {
    expect(calculateOfflineLps(null)).toBe(0);
    expect(calculateOfflineLps(undefined)).toBe(0);
  });

  it("returns 0 for empty save", () => {
    expect(calculateOfflineLps({})).toBe(0);
  });

  it("computes base star LPS at night", () => {
    // 1 star, no upgrades, night → star power = 1.0 * 1.5 (night) = 1.5 lps
    const result = calculateOfflineLps({
      starsCount: 1,
      isNight: true,
      purchasedUpgrades: [],
      purchasedAnimals: {},
      prestigeCount: 0,
      moonsCount: 0,
    });
    expect(result).toBeCloseTo(1.5);
  });

  it("computes base star LPS during day (no night bonus)", () => {
    const result = calculateOfflineLps({
      starsCount: 1,
      isNight: false,
      purchasedUpgrades: [],
      purchasedAnimals: {},
      prestigeCount: 0,
      moonsCount: 0,
    });
    expect(result).toBeCloseTo(1.0);
  });

  it("applies prestige multiplier", () => {
    // 1 prestige = +10% → multiplier 1.1
    // 1 star at night = 1.5 * 1.1 = 1.65
    const result = calculateOfflineLps({
      starsCount: 1,
      isNight: true,
      purchasedUpgrades: [],
      purchasedAnimals: {},
      prestigeCount: 1,
      moonsCount: 0,
    });
    expect(result).toBeCloseTo(1.5 * 1.1);
  });

  it("includes bunny animal LPS", () => {
    // 1 bunny, no upgrades. baseLps for bunny is 1.
    // Need to look it up from INITIAL_ANIMALS, so just check result > 0
    const result = calculateOfflineLps({
      starsCount: 0,
      isNight: true,
      purchasedUpgrades: [],
      purchasedAnimals: { bunny: 1 },
      prestigeCount: 0,
      moonsCount: 0,
    });
    expect(result).toBeGreaterThan(0);
  });

  it("applies bunny boost upgrade", () => {
    const withoutBoost = calculateOfflineLps({
      starsCount: 0,
      isNight: false,
      purchasedUpgrades: [],
      purchasedAnimals: { bunny: 1 },
      prestigeCount: 0,
      moonsCount: 0,
    });
    const withBoost = calculateOfflineLps({
      starsCount: 0,
      isNight: false,
      purchasedUpgrades: ["upg-bunny-1"],
      purchasedAnimals: { bunny: 1 },
      prestigeCount: 0,
      moonsCount: 0,
    });
    expect(withBoost).toBeCloseTo(withoutBoost * 2);
  });

  it("applies global animals boost upgrade (+50%)", () => {
    const without = calculateOfflineLps({
      starsCount: 0,
      isNight: false,
      purchasedUpgrades: [],
      purchasedAnimals: { bunny: 10 },
      prestigeCount: 0,
      moonsCount: 0,
    });
    const with_ = calculateOfflineLps({
      starsCount: 0,
      isNight: false,
      purchasedUpgrades: ["upg-global-1"],
      purchasedAnimals: { bunny: 10 },
      prestigeCount: 0,
      moonsCount: 0,
    });
    expect(with_).toBeCloseTo(without * 1.5);
  });

  it("adds flat moon LPS", () => {
    // 1 moon = 15000 * prestige(1.0)
    const result = calculateOfflineLps({
      starsCount: 0,
      isNight: false,
      purchasedUpgrades: [],
      purchasedAnimals: {},
      prestigeCount: 0,
      moonsCount: 1,
    });
    // flat moon LPS + moon multiplier: 15000 + 15000 * 1.5 = 37500
    expect(result).toBeCloseTo(15000 * (1 + 1.5));
  });

  it("applies nexus-core upgrade (+40%)", () => {
    const without = calculateOfflineLps({
      starsCount: 1,
      isNight: false,
      purchasedUpgrades: [],
      purchasedAnimals: {},
      prestigeCount: 0,
      moonsCount: 0,
    });
    const with_ = calculateOfflineLps({
      starsCount: 1,
      isNight: false,
      purchasedUpgrades: ["upg-nexus-core"],
      purchasedAnimals: {},
      prestigeCount: 0,
      moonsCount: 0,
    });
    expect(with_).toBeCloseTo(without * 1.4);
  });

  it("moon global multiplier stacks with flat moon LPS", () => {
    // 2 moons → flat = 2 * 15000 = 30000; then total *= (1 + 2*1.5) = 4.0
    const result = calculateOfflineLps({
      starsCount: 0,
      isNight: false,
      purchasedUpgrades: [],
      purchasedAnimals: {},
      prestigeCount: 0,
      moonsCount: 2,
    });
    const flatMoon = 2 * 15000;
    expect(result).toBeCloseTo(flatMoon * (1 + 2 * 1.5));
  });
});
