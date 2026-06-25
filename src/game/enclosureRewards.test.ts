import { describe, expect, it, vi } from "vitest";
import {
  applyEnclosureRewardToState,
  getAnimalRewardProfile,
  resolveEnclosureReward,
} from "./enclosureRewards";
import type { StatsResult, WorkerGameState } from "./protocol";

function makeState(): WorkerGameState {
  return {
    life: 0,
    totalLifeEarned: 0,
    starsCount: 0,
    purchasedAnimals: {},
    purchasedUpgrades: [],
    planetLevel: 1,
    planetExp: 0,
    clicksCount: 0,
    starClicksTriggered: 0,
    secondsPlayed: 0,
    isNight: true,
    cycleProgress: 0,
    activeEvent: null,
    activeEventDecision: null,
    activeEventDetails: null,
    activeEventInstantClaimed: false,
    eventTimeRemaining: 120,
    prestigeCount: 0,
    moonsCount: 0,
    constellations: {},
    unlockedCosmetics: [],
    cosmeticRarityLevels: {},
    glitterDust: 0,
    shootingStarsCount: 0,
    blackHoleSize: 1,
    craftedItems: {},
    zodiac: "katze",
    galaxyShards: 0,
    zodiacLevels: {},
    slummerGlassLevel: 1,
    catalystLevel: 0,
    doubleStellarLevel: 0,
    placedAnimals: [],
    animalLove: {},
    animalLastPet: {},
    bowlLastFed: 0,
    bowlFedMinutesCredited: 0,
    activeEnclosureBuffs: [],
  };
}

describe("enclosureRewards", () => {
  it("classifies profiles by animal family", () => {
    expect(getAnimalRewardProfile("phoenix")).toBe("mythic");
    expect(getAnimalRewardProfile("dolphin")).toBe("splash");
    expect(getAnimalRewardProfile("bee")).toBe("wing");
    expect(getAnimalRewardProfile("bunny")).toBe("paw");
  });

  it("resolves wing instant-star rewards", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.2);
    const reward = resolveEnclosureReward(
      makeState(),
      { animalLpsMap: { bee: 12 } } as StatsResult,
      "bee",
      "wing",
      1000,
    );
    expect(reward).toMatchObject({ kind: "instant_stars" });
    randomSpy.mockRestore();
  });

  it("applies instant life rewards into worker state", () => {
    const state = makeState();
    applyEnclosureRewardToState(state, {
      kind: "instant_life",
      label: "Pfoten-Fund",
      amount: 25,
    });
    expect(state.life).toBe(25);
    expect(state.totalLifeEarned).toBe(25);
  });
});
