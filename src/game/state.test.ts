import { describe, expect, it } from "vitest";
import { createInitialWorkerState, createRunResetState, hydrateWorkerState } from "./state";

describe("worker state helpers", () => {
  it("returns fresh nested collections for every initial state", () => {
    const first = createInitialWorkerState();
    const second = createInitialWorkerState();

    first.purchasedAnimals.bunny = 3;
    first.purchasedUpgrades.push("upg-click-1");
    first.craftedItems!.mat_stardust = 2;

    expect(second.purchasedAnimals).toEqual({});
    expect(second.purchasedUpgrades).toEqual([]);
    expect(second.craftedItems).toEqual({});
  });

  it("hydrates onto fresh defaults and sanitizes invalid counters", () => {
    const hydrated = hydrateWorkerState({
      life: Number.NaN,
      starsCount: -3,
      planetLevel: 0,
      purchasedAnimals: { bunny: 2.9, cat: -1 },
      purchasedUpgrades: ["upg-click-1", "upg-click-1"],
      superClickCharge: 130,
    });

    expect(hydrated).toMatchObject({
      life: 0,
      starsCount: 0,
      planetLevel: 1,
      purchasedAnimals: { bunny: 2 },
      purchasedUpgrades: ["upg-click-1"],
      superClickCharge: 100,
      activeEvent: null,
      zodiac: "katze",
    });
  });

  it("resets run progression while preserving lifetime and permanent meta state", () => {
    const current = hydrateWorkerState({
      life: 500,
      totalLifeEarned: 12_000,
      clicksCount: 25,
      starClicksTriggered: 40,
      secondsPlayed: 90,
      planetLevel: 20,
      prestigeCount: 3,
      purchasedAnimals: { bunny: 10 },
      purchasedUpgrades: ["upg-click-1"],
      glitterDust: 80,
      galaxyShards: 4,
      unlockedCosmetics: ["star_pink"],
      unlockedGlitchGalaxy: true,
    });

    const reset = createRunResetState(current, { prestigeCount: 4, zodiac: "fuchs" });

    expect(reset).toMatchObject({
      life: 0,
      totalLifeEarned: 12_000,
      clicksCount: 25,
      starClicksTriggered: 40,
      secondsPlayed: 90,
      planetLevel: 1,
      prestigeCount: 4,
      purchasedAnimals: {},
      purchasedUpgrades: [],
      glitterDust: 80,
      galaxyShards: 4,
      unlockedCosmetics: ["star_pink"],
      unlockedGlitchGalaxy: true,
      zodiac: "fuchs",
    });
  });
});
