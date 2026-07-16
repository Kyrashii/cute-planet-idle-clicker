import { describe, it, expect, vi } from "vitest";
import { handleWorkerAction, type WorkerActionHelpers } from "./workerActions";
import type { WorkerCommand, WorkerGameState, StatsResult } from "./protocol";
import { createInitialWorkerState } from "./state";

/** A complete, default worker state; override only the fields a test cares about. */
function makeState(overrides: Partial<WorkerGameState> = {}): WorkerGameState {
  return { ...createInitialWorkerState(), ...overrides };
}

function makeHelpers(): WorkerActionHelpers {
  return {
    getLpsAndStats: vi.fn(() => ({}) as unknown as StatsResult),
    setupActiveEvent: vi.fn(),
    updateTaskProgress: vi.fn(),
    broadcastStateUpdate: vi.fn(),
    rollNewZodiac: vi.fn(() => "katze"),
    emit: vi.fn(),
    stopTimers: vi.fn(),
  };
}

function dispatch(command: WorkerCommand, state: WorkerGameState, helpers = makeHelpers()) {
  handleWorkerAction(command, state, helpers);
  return helpers;
}

describe("handleWorkerAction", () => {
  describe("BUY_ANIMAL", () => {
    it("debits life, increments the animal count, and broadcasts", () => {
      const state = makeState({ life: 100 });
      const helpers = dispatch({ type: "BUY_ANIMAL", animalId: "bunny", count: 2 }, state);

      expect(state.life).toBe(68);
      expect(state.purchasedAnimals.bunny).toBe(2);
      expect(helpers.broadcastStateUpdate).toHaveBeenCalled();
    });

    it("is a no-op when life is insufficient", () => {
      const state = makeState({ life: 10 });
      const helpers = dispatch({ type: "BUY_ANIMAL", animalId: "bunny", count: 1 }, state);

      expect(state.life).toBe(10);
      expect(state.purchasedAnimals.bunny).toBeUndefined();
      expect(helpers.broadcastStateUpdate).not.toHaveBeenCalled();
    });
  });

  describe("BUY_UPGRADE", () => {
    it("debits life and records the upgrade once", () => {
      const state = makeState({ life: 100 });
      dispatch({ type: "BUY_UPGRADE", id: "upg-click-1" }, state);

      expect(state.life).toBe(40);
      expect(state.purchasedUpgrades).toEqual(["upg-click-1"]);
    });

    it("does not re-buy an already-owned upgrade", () => {
      const state = makeState({ life: 100, purchasedUpgrades: ["upg-click-1"] });
      const helpers = dispatch({ type: "BUY_UPGRADE", id: "upg-click-1" }, state);

      expect(state.life).toBe(100);
      expect(state.purchasedUpgrades).toEqual(["upg-click-1"]);
      expect(helpers.broadcastStateUpdate).not.toHaveBeenCalled();
    });
  });

  describe("BUY_STAR", () => {
    it("grants one star per purchase when the double-stellar perk is inactive", () => {
      const state = makeState({ life: 500, doubleStellarLevel: 0 });
      dispatch({ type: "BUY_STAR" }, state);

      expect(state.life).toBe(450);
      expect(state.starsCount).toBe(1);
    });
  });

  describe("transaction validation", () => {
    it("rejects invalid animal IDs and non-positive counts", () => {
      const state = makeState({ life: 1_000 });

      dispatch({ type: "BUY_ANIMAL", animalId: "unknown", count: 1 }, state);
      dispatch({ type: "BUY_ANIMAL", animalId: "bunny", count: -5 }, state);
      dispatch({ type: "BUY_ANIMAL", animalId: "bunny", count: Number.NaN }, state);

      expect(state.life).toBe(1_000);
      expect(state.purchasedAnimals).toEqual({});
    });

    it("rejects unknown upgrade IDs", () => {
      const state = makeState({ life: 1_000 });
      dispatch({ type: "BUY_UPGRADE", id: "unknown-upgrade" }, state);
      expect(state.purchasedUpgrades).toEqual([]);
      expect(state.life).toBe(1_000);
    });

    it("rejects negative glitter spending", () => {
      const state = makeState({ glitterDust: 50 });
      dispatch({ type: "SPEND_GLITTER_DUST", amount: -10 }, state);
      expect(state.glitterDust).toBe(50);
    });
  });

  describe("MERGE_MOONS", () => {
    it("allows one extra moon when full moon research stacks with the active moon zodiac", () => {
      const state = makeState({
        starsCount: 100,
        moonsCount: 10,
        zodiac: "mond",
        purchasedUpgrades: [
          "upg-moon-limit-1",
          "upg-moon-limit-2",
          "upg-moon-limit-3",
          "upg-moon-limit-4",
          "upg-moon-limit-5",
          "upg-moon-limit-6",
          "upg-moon-limit-7",
        ],
      });

      dispatch({ type: "MERGE_MOONS" }, state);

      expect(state.moonsCount).toBe(11);
      expect(state.starsCount).toBe(50);
    });

    it("blocks moon merging at the fully stacked moon cap", () => {
      const state = makeState({
        starsCount: 100,
        moonsCount: 11,
        zodiac: "mond",
        purchasedUpgrades: [
          "upg-moon-limit-1",
          "upg-moon-limit-2",
          "upg-moon-limit-3",
          "upg-moon-limit-4",
          "upg-moon-limit-5",
          "upg-moon-limit-6",
          "upg-moon-limit-7",
        ],
      });
      const helpers = dispatch({ type: "MERGE_MOONS" }, state);

      expect(state.moonsCount).toBe(11);
      expect(state.starsCount).toBe(100);
      expect(helpers.broadcastStateUpdate).not.toHaveBeenCalled();
    });
  });

  describe("SPEND_GLITTER_DUST", () => {
    it("spends when affordable", () => {
      const state = makeState({ glitterDust: 50 });
      dispatch({ type: "SPEND_GLITTER_DUST", amount: 20 }, state);
      expect(state.glitterDust).toBe(30);
    });

    it("is a no-op when the player cannot afford it", () => {
      const state = makeState({ glitterDust: 5 });
      const helpers = dispatch({ type: "SPEND_GLITTER_DUST", amount: 20 }, state);
      expect(state.glitterDust).toBe(5);
      expect(helpers.broadcastStateUpdate).not.toHaveBeenCalled();
    });
  });

  describe("OPEN_LOOTBOXES", () => {
    it("decrements boxes, unlocks fresh rolls once, and emits the batch result", () => {
      const state = makeState({ shootingStarsCount: 5 });
      const helpers = dispatch({ type: "OPEN_LOOTBOXES", count: 3 }, state);

      expect(state.shootingStarsCount).toBe(2);
      expect(helpers.broadcastStateUpdate).toHaveBeenCalledWith(true);
      expect(helpers.emit).toHaveBeenCalledTimes(1);

      const event = vi.mocked(helpers.emit).mock.calls[0][0];
      if (event.type !== "LOOTBOXES_OPENED") throw new Error("wrong event type");
      expect(event.opened).toBe(3);
      expect(event.results).toHaveLength(3);
      // Every non-duplicate roll landed in unlockedCosmetics exactly once.
      const freshIds = event.results.filter((r) => !r.duplicate).map((r) => r.cosmeticId);
      expect(new Set(state.unlockedCosmetics)).toEqual(new Set(freshIds));
      expect(state.unlockedCosmetics.length).toBe(new Set(state.unlockedCosmetics).size);
      // Refunds for duplicates are credited as glitter dust.
      expect(state.glitterDust).toBe(event.totalRefund);
    });

    it("clamps the batch to the available shooting stars", () => {
      const state = makeState({ shootingStarsCount: 2 });
      const helpers = dispatch({ type: "OPEN_LOOTBOXES", count: 99 }, state);

      expect(state.shootingStarsCount).toBe(0);
      const event = vi.mocked(helpers.emit).mock.calls[0][0];
      if (event.type !== "LOOTBOXES_OPENED") throw new Error("wrong event type");
      expect(event.opened).toBe(2);
    });

    it("is a no-op with zero boxes", () => {
      const state = makeState({ shootingStarsCount: 0 });
      const helpers = dispatch({ type: "OPEN_LOOTBOXES", count: 1 }, state);

      expect(helpers.emit).not.toHaveBeenCalled();
      expect(helpers.broadcastStateUpdate).not.toHaveBeenCalled();
    });
  });

  describe("SET_PLANET_LEVEL", () => {
    it("sets the requested level and creates a fresh task", () => {
      const state = makeState({ planetLevel: 3 });
      const helpers = dispatch({ type: "SET_PLANET_LEVEL", level: 12 }, state);

      expect(state.planetLevel).toBe(12);
      expect(state.planetTask).toBeDefined();
      expect(helpers.broadcastStateUpdate).toHaveBeenCalledWith(true);
    });

    it("clamps the level to the playable range", () => {
      const lowState = makeState();
      const highState = makeState();

      dispatch({ type: "SET_PLANET_LEVEL", level: -5 }, lowState);
      dispatch({ type: "SET_PLANET_LEVEL", level: 999 }, highState);

      expect(lowState.planetLevel).toBe(1);
      expect(highState.planetLevel).toBe(20);
    });
  });

  describe("reset and prestige contracts", () => {
    it("RESET clears every worker-owned field", () => {
      const state = makeState({
        life: 500,
        totalLifeEarned: 900,
        planetLevel: 12,
        activeEvent: "aurora",
        activeEventDecision: "collect",
        activeEventInstantClaimed: true,
        inGlitchGalaxy: true,
        glitchPending: true,
        unlockedGlitchGalaxy: true,
        spentGalaxyShards: 7,
        animalLove: { bunny: 300 },
      });

      dispatch({ type: "RESET" }, state);

      expect(state).toMatchObject({
        life: 0,
        totalLifeEarned: 0,
        planetLevel: 1,
        activeEvent: null,
        activeEventDecision: null,
        activeEventInstantClaimed: false,
        inGlitchGalaxy: false,
        glitchPending: false,
        unlockedGlitchGalaxy: false,
        spentGalaxyShards: 0,
        animalLove: {},
      });
      expect(state.planetTask).toBeDefined();
    });

    it("blocks prestige before its requirement", () => {
      const state = makeState({ planetLevel: 5, life: 100, prestigeCount: 2 });
      const helpers = dispatch({ type: "PRESTIGE" }, state);
      expect(state.prestigeCount).toBe(2);
      expect(helpers.broadcastStateUpdate).not.toHaveBeenCalled();
    });

    it("preserves lifetime totals across a valid prestige", () => {
      const state = makeState({
        planetLevel: 20,
        totalLifeEarned: 123_000,
        clicksCount: 55,
        starClicksTriggered: 80,
        prestigeCount: 2,
      });
      dispatch({ type: "PRESTIGE" }, state);
      expect(state).toMatchObject({
        planetLevel: 1,
        totalLifeEarned: 123_000,
        clicksCount: 55,
        starClicksTriggered: 80,
        prestigeCount: 3,
        shootingStarsCount: 1,
      });
    });
  });

  describe("glitch galaxy repair + cooldown", () => {
    it("REPAIR grants +2 shards, re-baselines benchmarks, and starts the cooldown", () => {
      const state = makeState({
        inGlitchGalaxy: true,
        glitchPending: false,
        planetLevel: 20,
        galaxyShards: 4,
        glitterDust: 100,
        prestigeCount: 3,
      });

      dispatch({ type: "REPAIR_GLITCH_GALAXY" }, state);

      expect(state.galaxyShards).toBe(6); // +2 splitters
      expect(state.glitterDust).toBe(177); // +77 dust
      expect(state.prestigeCount).toBe(4); // +1 prestige
      expect(state.inGlitchGalaxy).toBe(false);
      expect(state.glitchCooldown).toBe(true); // must do a normal voyage next
      expect(state.planetLevel).toBe(1); // full prestige-style reset
      // Benchmarks re-baselined to current totals + the default margins.
      expect(state.glitchBenchmarks).toEqual({
        prestigeTarget: 4 + 10,
        stardustTarget: 0 + 150,
        shardsTarget: 6 + 0 + 10,
        phoenixTarget: 0 + 5,
        glitterTarget: 177 + 150,
      });
    });

    it("a normal PRESTIGE clears the cooldown", () => {
      const state = makeState({ glitchCooldown: true, planetLevel: 20, prestigeCount: 4 });

      dispatch({ type: "PRESTIGE" }, state);

      expect(state.glitchCooldown).toBe(false);
      expect(state.prestigeCount).toBe(5);
    });

    it("ENTER clears the pending flag and flips into glitch mode", () => {
      const state = makeState({ glitchPending: true, planetLevel: 20 });

      dispatch({ type: "ENTER_GLITCH_GALAXY" }, state);

      expect(state.inGlitchGalaxy).toBe(true);
      expect(state.glitchPending).toBe(false);
      expect(state.unlockedGlitchGalaxy).toBe(true);
      expect(state.planetLevel).toBe(1);
    });
  });
});
