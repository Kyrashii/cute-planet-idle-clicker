import { INITIAL_ANIMALS, getPrestigeRequirement } from "../data";
import { CRAFTING_RECIPES } from "../data/recipes";
import { COSMETIC_ITEMS } from "../data/cosmetics";
import { ZODIACS } from "../data/zodiacs";
import { resolve, RECIPE_BY_RESULT, getItem } from "../data/craftingGraph";
import { rollTaskForLevel } from "./planetTasks";
import { handleUseCraftedItem } from "./itemHandlers";
import { rollLootboxes } from "./lootbox";
import { executeBlackHoleGamble } from "./blackHoleGamble";
import { formatCompactNumber } from "./achievements";
import { getMaxMoons } from "./maxMoons";
import { getAnimalBulkCost, getStarCost, getUpgradeCost, normalizePurchaseCount } from "./pricing";
import { createInitialWorkerState, createRunResetState, replaceWorkerState } from "./state";
import type { WorkerCommand, WorkerEvent, WorkerGameState, StatsResult } from "./protocol";

/** Hard safety cap per OPEN_LOOTBOXES command. */
export const MAX_LOOTBOX_BATCH = 500;
const MAX_CRAFT_BATCH = 1_000;
const CONSTELLATION_COSTS: Record<
  string,
  { baseStarsCost: number; baseMoonsCost: number; maxLevel: number }
> = {
  kuschel: { baseStarsCost: 10, baseMoonsCost: 0, maxLevel: 5 },
  mondhasen: { baseStarsCost: 25, baseMoonsCost: 1, maxLevel: 3 },
  supernova: { baseStarsCost: 100, baseMoonsCost: 0, maxLevel: 3 },
  stardust_rain: { baseStarsCost: 20, baseMoonsCost: 0, maxLevel: 5 },
  cosmic_harmony: { baseStarsCost: 40, baseMoonsCost: 2, maxLevel: 3 },
  ewiges_polarlicht: { baseStarsCost: 50, baseMoonsCost: 0, maxLevel: 3 },
};

const normalizePositiveCount = (value: unknown, fallback = 1): number => {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(MAX_CRAFT_BATCH, Math.max(0, Math.floor(parsed)));
};

const normalizePositiveCost = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
};

export interface WorkerActionHelpers {
  getLpsAndStats: () => StatsResult;
  setupActiveEvent: (event?: string | null) => void;
  updateTaskProgress: (type: string, amount: number) => void;
  broadcastStateUpdate: (forceRecalc?: boolean) => void;
  rollNewZodiac: (exclude?: string) => string;
  emit: (event: WorkerEvent) => void;
  stopTimers: () => void;
}

export function handleWorkerAction(
  data: WorkerCommand,
  state: WorkerGameState,
  helpers: WorkerActionHelpers,
): void {
  const {
    getLpsAndStats,
    setupActiveEvent,
    updateTaskProgress,
    broadcastStateUpdate,
    rollNewZodiac,
    emit,
    stopTimers,
  } = helpers;

  switch (data.type) {
    case "CLAIM_OFFLINE_EARNINGS": {
      const requestedSeconds = Math.max(0, Math.floor(Number(data.seconds) || 0));
      const maxOfflineHours = 5 + Math.max(0, (state.slummerGlassLevel || 1) - 1) * 2;
      const seconds = Math.min(requestedSeconds, maxOfflineHours * 60 * 60);
      if (seconds <= 0) break;

      const previousEvent = state.activeEvent;
      const previousDecision = state.activeEventDecision;
      const previousDetails = state.activeEventDetails;
      state.activeEvent = null;
      state.activeEventDecision = null;
      state.activeEventDetails = null;
      const earnedLife = getLpsAndStats().totalLps * seconds;
      state.activeEvent = previousEvent;
      state.activeEventDecision = previousDecision;
      state.activeEventDetails = previousDetails;

      if (earnedLife > 0) {
        state.life += earnedLife;
        state.totalLifeEarned += earnedLife;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "SYNC_ENCLOSURE": {
      state.placedAnimals = data.placedAnimals
        .filter(
          (animal) =>
            typeof animal.id === "string" &&
            typeof animal.animalId === "string" &&
            Number.isFinite(animal.x) &&
            Number.isFinite(animal.y),
        )
        .map((animal) => ({ ...animal }));
      state.animalLove = Object.fromEntries(
        Object.entries(data.animalLove).map(([id, love]) => [
          id,
          Math.min(300, Math.max(0, Math.floor(Number(love) || 0))),
        ]),
      );
      state.animalLastPet = Object.fromEntries(
        Object.entries(data.animalLastPet).map(([id, timestamp]) => [
          id,
          Math.max(0, Math.floor(Number(timestamp) || 0)),
        ]),
      );
      state.bowlLastFed = Math.max(0, Number(data.bowlLastFed) || 0);
      state.bowlFedMinutesCredited = Math.max(0, Number(data.bowlFedMinutesCredited) || 0);
      broadcastStateUpdate(true);
      break;
    }
    case "BUY_ANIMAL": {
      const amount = normalizePurchaseCount(data.count);
      const currentCount = state.purchasedAnimals[data.animalId] || 0;
      const cost = getAnimalBulkCost(data.animalId, currentCount, amount);
      if (cost !== null && state.life >= cost) {
        state.life -= cost;
        state.purchasedAnimals[data.animalId] = currentCount + amount;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_UPGRADES_BATCH": {
      let updated = false;
      for (const item of data.upgradesList) {
        const cost = getUpgradeCost(item.id);
        if (cost === null || state.purchasedUpgrades.includes(item.id)) continue;
        if (item.isGlitter) {
          if (state.glitterDust < cost) continue;
          state.glitterDust -= cost;
        } else {
          if (state.life < cost) continue;
          state.life -= cost;
        }
        state.purchasedUpgrades.push(item.id);
        updated = true;
      }
      if (updated) broadcastStateUpdate(true);
      break;
    }
    case "BUY_STAR": {
      const cost = getStarCost(state.starsCount);
      if (state.life >= cost) {
        state.life -= cost;
        const doubleStellarLvl = state.doubleStellarLevel || 0;
        const amountGained = doubleStellarLvl > 0 && Math.random() < doubleStellarLvl * 0.1 ? 2 : 1;
        state.starsCount += amountGained;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_UPGRADE": {
      const cost = getUpgradeCost(data.id);
      if (cost !== null && state.life >= cost && !state.purchasedUpgrades.includes(data.id)) {
        state.life -= cost;
        state.purchasedUpgrades.push(data.id);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "CHIPS_CHEAT": {
      state.life += 1000000;
      state.totalLifeEarned += 1000000;
      state.starsCount += 2;
      state.purchasedAnimals.bunny = (state.purchasedAnimals.bunny || 0) + 1;
      state.purchasedAnimals.chick = (state.purchasedAnimals.chick || 0) + 1;
      state.purchasedAnimals.cat = (state.purchasedAnimals.cat || 0) + 1;
      state.purchasedAnimals.frog = (state.purchasedAnimals.frog || 0) + 1;
      state.prestigeCount = (state.prestigeCount || 0) + 5;

      state.planetLevel += 1;
      emit({
        type: "LEVEL_UP",
        level: state.planetLevel,
      });

      broadcastStateUpdate(true);
      break;
    }
    case "SET_PLANET_LEVEL": {
      const level = Math.min(20, Math.max(1, Math.trunc(data.level)));
      if (!Number.isFinite(level)) {
        break;
      }

      state.planetLevel = level;
      state.planetTask = rollTaskForLevel(level, state.prestigeCount || 0, INITIAL_ANIMALS);

      broadcastStateUpdate(true);
      break;
    }
    case "FORCE_TRIGGER_EVENT": {
      const { event } = data;
      setupActiveEvent(event);
      let duration = 120;
      if (state.purchasedUpgrades.includes("upg-event-duration")) {
        duration += 60;
      }
      duration += 60;
      state.eventTimeRemaining = duration;
      broadcastStateUpdate(true);
      break;
    }
    case "CRAFT_ITEM": {
      const { recipeId, count: rawCount } = data;
      const count = normalizePositiveCount(rawCount);
      if (count <= 0) break;
      const recipe = CRAFTING_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) break;

      const {
        life: reqLife,
        stars: reqStars,
        moons: reqMoons,
        glitter: reqGlitter,
        lootboxes: reqLootboxes,
        items: reqItems,
      } = recipe.ingredients;

      let canCraft = true;
      if (reqLife && state.life < reqLife * count) canCraft = false;
      if (reqStars && state.starsCount < reqStars * count) canCraft = false;
      if (reqMoons && state.moonsCount < reqMoons * count) canCraft = false;
      if (reqGlitter && state.glitterDust < reqGlitter * count) canCraft = false;
      if (reqLootboxes && state.shootingStarsCount < reqLootboxes * count) canCraft = false;

      if (reqItems) {
        if (!state.craftedItems) state.craftedItems = {};
        for (const [itemId, qty] of Object.entries(reqItems)) {
          const owned = state.craftedItems[itemId] || 0;
          if (owned < qty * count) {
            canCraft = false;
            break;
          }
        }
      }

      if (canCraft) {
        if (reqLife) state.life -= reqLife * count;
        if (reqStars) state.starsCount -= reqStars * count;
        if (reqMoons) state.moonsCount -= reqMoons * count;
        if (reqGlitter) state.glitterDust -= reqGlitter * count;
        if (reqLootboxes) state.shootingStarsCount -= reqLootboxes * count;

        if (reqItems) {
          if (!state.craftedItems) state.craftedItems = {};
          for (const [itemId, qty] of Object.entries(reqItems)) {
            state.craftedItems[itemId] = (state.craftedItems[itemId] || 0) - qty * count;
          }
        }

        if (!state.craftedItems) state.craftedItems = {};
        const resultId = recipe.result.id;
        const totalQty = recipe.result.quantity * count;
        state.craftedItems[resultId] = (state.craftedItems[resultId] || 0) + totalQty;

        updateTaskProgress("crafting", count);

        emit({
          type: "COSMETIC_FOUND",
          text: `Erfolgreich hergestellt: ${totalQty}x ${recipe.result.germanName} ${recipe.result.emoji}! 🔨`,
        });

        broadcastStateUpdate(true);
      }
      break;
    }
    case "CRAFT_RECURSIVE": {
      const { targetItemId, count: rawCountR } = data;
      const countR = normalizePositiveCount(rawCountR);
      if (countR <= 0) break;
      if (!state.craftedItems) state.craftedItems = {};

      const haveR: Record<string, number> = {
        life: state.life,
        stars: state.starsCount,
        moons: state.moonsCount,
        glitter: state.glitterDust,
        lootboxes: state.shootingStarsCount,
        ...state.craftedItems,
      };

      const { plan: planR, ok: okR } = resolve(targetItemId, countR, haveR);
      if (!okR) break;

      for (const step of planR) {
        const recipe = RECIPE_BY_RESULT.get(step.id);
        if (!recipe) continue;
        const {
          life: rl,
          stars: rs,
          moons: rm,
          glitter: rg,
          lootboxes: rlb,
          items: ri,
        } = recipe.ingredients;
        const ops = step.ops;
        if (rl) state.life -= rl * ops;
        if (rs) state.starsCount -= rs * ops;
        if (rm) state.moonsCount -= rm * ops;
        if (rg) state.glitterDust -= rg * ops;
        if (rlb) state.shootingStarsCount -= rlb * ops;
        if (ri) {
          for (const [iid, iqty] of Object.entries(ri)) {
            state.craftedItems[iid] = (state.craftedItems[iid] || 0) - iqty * ops;
          }
        }
        state.craftedItems[step.id] = (state.craftedItems[step.id] || 0) + step.produces;
      }

      let totalCraftOps = 0;
      for (const step of planR) {
        totalCraftOps += step.ops;
      }
      updateTaskProgress("crafting", totalCraftOps);

      const targetItemInfo = getItem(targetItemId);
      emit({
        type: "COSMETIC_FOUND",
        text: `Auto-geschmiedet: ${countR}x ${targetItemInfo.name} ${targetItemInfo.emoji}! 🔨`,
      });
      broadcastStateUpdate(true);
      break;
    }
    case "USE_CRAFTED_ITEM": {
      const { itemId, count: requestedCountRaw } = data;
      const requestedCount = requestedCountRaw ?? 1;
      const res = handleUseCraftedItem(
        state,
        itemId,
        requestedCount,
        getLpsAndStats,
        setupActiveEvent,
      );

      if (res.usedCount <= 0) break;

      emit({
        type: "CRAFTED_ITEMS_OPENED",
        itemId,
        itemName: res.itemName,
        itemEmoji: res.itemEmoji,
        count: res.usedCount,
        rewards: {
          lifeGained: res.lifeGained,
          starsGained: res.starsGained,
          moonsGained: res.moonsGained,
          glitterGained: res.glitterGained,
          lootboxesGained: res.lootboxesGained,
          prestigeGained: res.prestigeGained,
          unlockedCosmeticsList: res.unlockedCosmeticsList,
          animalsSpawned: res.animalsSpawned,
          eventsTriggered: res.eventsTriggered,
        },
        text: res.summaryText,
      });

      broadcastStateUpdate(true);
      break;
    }
    case "RESET": {
      const nextState = createInitialWorkerState();
      nextState.planetTask = rollTaskForLevel(1, 0, INITIAL_ANIMALS);
      replaceWorkerState(state, nextState);
      broadcastStateUpdate(true);
      break;
    }
    case "ENTER_GLITCH_GALAXY": {
      if (!state.glitchPending || state.inGlitchGalaxy) break;
      const nextState = createRunResetState(state, {
        inGlitchGalaxy: true,
        unlockedGlitchGalaxy: true,
        glitchPending: false,
        zodiac: rollNewZodiac(state.zodiac),
      });
      nextState.planetTask = rollTaskForLevel(1, nextState.prestigeCount, INITIAL_ANIMALS);
      replaceWorkerState(state, nextState);
      broadcastStateUpdate(true);
      break;
    }
    case "REPAIR_GLITCH_GALAXY": {
      if (!state.inGlitchGalaxy || state.planetLevel < 20) break;
      const nextPrestigeCount = state.prestigeCount + 1;
      const nextGalaxyShards = state.galaxyShards + 2;
      const nextGlitterDust = state.glitterDust + 77;
      const nextBenchmarks = {
        prestigeTarget: nextPrestigeCount + 10,
        stardustTarget: (state.craftedItems?.mat_stardust || 0) + 150,
        shardsTarget: nextGalaxyShards + (state.spentGalaxyShards || 0) + 10,
        phoenixTarget: (state.purchasedAnimals.phoenix || 0) + 5,
        glitterTarget: nextGlitterDust + 150,
      };
      const nextState = createRunResetState(state, {
        prestigeCount: nextPrestigeCount,
        galaxyShards: nextGalaxyShards,
        glitterDust: nextGlitterDust,
        shootingStarsCount: state.shootingStarsCount + 1,
        inGlitchGalaxy: false,
        glitchPending: false,
        glitchCooldown: true,
        glitchBenchmarks: nextBenchmarks,
        zodiac: rollNewZodiac(state.zodiac),
      });
      nextState.planetTask = rollTaskForLevel(1, nextPrestigeCount, INITIAL_ANIMALS);
      replaceWorkerState(state, nextState);
      broadcastStateUpdate(true);
      break;
    }
    case "PRESTIGE": {
      const canPrestige =
        state.planetLevel >= 20 || state.life >= getPrestigeRequirement(state.prestigeCount);
      if (!canPrestige || state.inGlitchGalaxy) break;

      const nextPrestigeCount = state.prestigeCount + 1;
      const nextState = createRunResetState(state, {
        prestigeCount: nextPrestigeCount,
        galaxyShards: state.galaxyShards + (state.planetLevel >= 20 ? 1 : 0),
        shootingStarsCount: state.shootingStarsCount + 1,
        glitchCooldown: false,
        zodiac: rollNewZodiac(state.zodiac),
      });
      nextState.planetTask = rollTaskForLevel(1, nextPrestigeCount, INITIAL_ANIMALS);
      replaceWorkerState(state, nextState);
      broadcastStateUpdate(true);
      break;
    }
    case "UPGRADE_ZODIAC_LEVEL": {
      const cost = normalizePositiveCost(data.cost);
      if (!ZODIACS.some((zodiac) => zodiac.id === data.id) || cost === null) break;
      if ((state.galaxyShards || 0) >= cost) {
        state.galaxyShards = (state.galaxyShards || 0) - cost;
        state.spentGalaxyShards = (state.spentGalaxyShards || 0) + cost;
        if (!state.zodiacLevels) state.zodiacLevels = {};
        state.zodiacLevels[data.id] = (state.zodiacLevels[data.id] || 1) + 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UPGRADE_SLUMMER_GLASS": {
      const cost = normalizePositiveCost(data.cost);
      if (cost !== null && (state.galaxyShards || 0) >= cost) {
        state.galaxyShards = (state.galaxyShards || 0) - cost;
        state.spentGalaxyShards = (state.spentGalaxyShards || 0) + cost;
        state.slummerGlassLevel = (state.slummerGlassLevel || 1) + 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UPGRADE_CATALYST": {
      const cost = normalizePositiveCost(data.cost);
      if (cost !== null && (state.galaxyShards || 0) >= cost) {
        state.galaxyShards = (state.galaxyShards || 0) - cost;
        state.spentGalaxyShards = (state.spentGalaxyShards || 0) + cost;
        state.catalystLevel = (state.catalystLevel || 0) + 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UPGRADE_DOUBLE_STELLAR": {
      const cost = normalizePositiveCost(data.cost);
      if (cost !== null && (state.galaxyShards || 0) >= cost) {
        state.galaxyShards = (state.galaxyShards || 0) - cost;
        state.spentGalaxyShards = (state.spentGalaxyShards || 0) + cost;
        state.doubleStellarLevel = (state.doubleStellarLevel || 0) + 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "INVEST_CONSTELLATION": {
      const definition = CONSTELLATION_COSTS[data.constellationId];
      if (!definition) break;
      const currentLevel = state.constellations?.[data.constellationId] || 0;
      if (currentLevel >= definition.maxLevel) break;
      const nextLevel = currentLevel + 1;
      const starsCost = nextLevel * definition.baseStarsCost;
      const moonsCost = nextLevel * definition.baseMoonsCost;
      if (state.starsCount >= starsCost && (state.moonsCount || 0) >= moonsCost) {
        state.starsCount -= starsCost;
        state.moonsCount = (state.moonsCount || 0) - moonsCost;
        if (!state.constellations) state.constellations = {};
        state.constellations[data.constellationId] = nextLevel;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "MERGE_MOONS": {
      const maxMoons = getMaxMoons({
        purchasedUpgrades: state.purchasedUpgrades,
        zodiac: state.zodiac,
      });

      if (state.starsCount >= 50 && (state.moonsCount || 0) < maxMoons) {
        state.starsCount -= 50;
        state.moonsCount = (state.moonsCount || 0) + 1;
        updateTaskProgress("merge_moons", 1);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "SET_ZODIAC": {
      if (!ZODIACS.some((zodiac) => zodiac.id === data.zodiacId)) break;
      state.zodiac = data.zodiacId;
      broadcastStateUpdate(true);
      break;
    }
    case "SET_NIGHT_CYCLE_FORCE": {
      state.isNight = data.isNight;
      state.cycleProgress = 0;
      broadcastStateUpdate();
      break;
    }
    case "ADD_GLITTER_DUST": {
      let amount = normalizePositiveCount(data.amount, 0);
      if (amount <= 0) break;
      const doubleStellarLvl = state.doubleStellarLevel || 0;
      if (doubleStellarLvl > 0 && Math.random() < doubleStellarLvl * 0.1) {
        amount = amount * 2;
      }

      const phoenixLvl = state.zodiacLevels?.phoenix || 1;
      const phoenixMultiplier = state.zodiac === "phoenix" ? 1.5 + (phoenixLvl - 1) * 0.15 : 1.0;
      state.glitterDust = (state.glitterDust || 0) + Math.ceil(Number(amount) * phoenixMultiplier);
      broadcastStateUpdate(true);
      break;
    }
    case "ADD_GALAXY_SHARDS": {
      const amount = Math.max(0, Math.trunc(Number(data.amount) || 0));
      if (amount <= 0) break;
      state.galaxyShards = (state.galaxyShards || 0) + amount;
      broadcastStateUpdate(true);
      break;
    }
    case "SPEND_GLITTER_DUST": {
      const amount = normalizePositiveCost(data.amount);
      if (amount !== null && state.glitterDust >= amount) {
        state.glitterDust -= amount;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_UPGRADE_GLITTER": {
      const cost = getUpgradeCost(data.id);
      if (
        cost !== null &&
        state.glitterDust >= cost &&
        !state.purchasedUpgrades.includes(data.id)
      ) {
        state.glitterDust -= cost;
        state.purchasedUpgrades.push(data.id);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UNLOCK_COSMETIC_DIRECT": {
      const cost = normalizePositiveCost(data.cost);
      const isKnownCosmetic = COSMETIC_ITEMS.some((cosmetic) => cosmetic.id === data.cosmeticId);
      if (
        isKnownCosmetic &&
        cost !== null &&
        state.glitterDust >= cost &&
        !state.unlockedCosmetics.includes(data.cosmeticId)
      ) {
        state.glitterDust -= cost;
        state.unlockedCosmetics.push(data.cosmeticId);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "OPEN_LOOTBOXES": {
      const available = state.shootingStarsCount || 0;
      const count = Math.min(Math.max(Math.floor(data.count), 0), available, MAX_LOOTBOX_BATCH);
      if (count <= 0) break;

      const { results, totalRefund, newlyUnlockedIds } = rollLootboxes(count, {
        hasGachaMagnet: state.purchasedUpgrades.includes("upg-glitter-gacha"),
        alreadyUnlocked: state.unlockedCosmetics,
      });

      state.shootingStarsCount = available - count;
      state.unlockedCosmetics.push(...newlyUnlockedIds);
      state.glitterDust = (state.glitterDust || 0) + totalRefund;
      broadcastStateUpdate(true);
      emit({ type: "LOOTBOXES_OPENED", results, totalRefund, opened: count });
      break;
    }
    case "UPGRADE_COSMETIC_RARITY": {
      const cost = normalizePositiveCost(data.cost);
      const validRarities = ["common", "rare", "epic", "legendary"];
      const isKnownCosmetic = COSMETIC_ITEMS.some((cosmetic) => cosmetic.id === data.cosmeticId);
      if (
        isKnownCosmetic &&
        state.unlockedCosmetics.includes(data.cosmeticId) &&
        validRarities.includes(data.targetRarity) &&
        cost !== null &&
        state.glitterDust >= cost
      ) {
        state.glitterDust -= cost;
        if (!state.cosmeticRarityLevels) state.cosmeticRarityLevels = {};
        state.cosmeticRarityLevels[data.cosmeticId] = data.targetRarity;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "SET_EVENT_DECISION": {
      const { decision } = data;
      const previous = state.activeEventDecision;

      if (state.activeEventInstantClaimed) {
        break;
      }

      state.activeEventDecision = decision;

      if (state.activeEvent && state.activeEventDetails && decision && decision !== "ignorieren") {
        const option = state.activeEventDetails.options.find((o) => o.id === decision);
        if (option && !state.activeEventInstantClaimed) {
          const eff = option.effectType;
          let rewardDesc = "";
          let claimed = false;

          if (eff === "instant_stars" && option.bonusStars !== undefined) {
            const amount = option.bonusStars;
            state.starsCount += amount;
            rewardDesc = `+${amount} ⭐ Sterne erhalten!`;
            claimed = true;
          } else if (eff === "instant_dust" && option.bonusDust !== undefined) {
            const amount = option.bonusDust;
            state.glitterDust += amount;
            rewardDesc = `+${amount} ✨ Glitzerstaub erhalten!`;
            claimed = true;
          } else if (eff === "instant_moons" && option.bonusMoons !== undefined) {
            const amount = option.bonusMoons;
            state.moonsCount = (state.moonsCount || 0) + amount;
            rewardDesc = `+${amount} 🌙 Mond(e) erhalten!`;
            claimed = true;
          } else if (eff === "instant_life" && option.bonusLife !== undefined) {
            const amount = option.bonusLife;
            state.life += amount;
            state.totalLifeEarned += amount;
            rewardDesc = `+${formatCompactNumber(amount)} Lebenskraft erhalten!`;
            claimed = true;
          } else if (
            eff === "instant_hybrid" &&
            option.bonusDust !== undefined &&
            option.bonusStars !== undefined
          ) {
            state.starsCount += option.bonusStars;
            state.glitterDust += option.bonusDust;
            rewardDesc = `+${option.bonusStars} ⭐ Sterne und +${option.bonusDust} ✨ Glitzerstaub erhalten!`;
            claimed = true;
          } else if (eff.startsWith("instant_stars_")) {
            const amount = parseInt(eff.replace("instant_stars_", ""), 10) || 10;
            state.starsCount += amount;
            rewardDesc = `+${amount} ⭐ Sterne erhalten!`;
            claimed = true;
          } else if (eff.startsWith("instant_dust_")) {
            const amount = parseInt(eff.replace("instant_dust_", ""), 10) || 5;
            state.glitterDust += amount;
            rewardDesc = `+${amount} ✨ Glitzerstaub erhalten!`;
            claimed = true;
          } else if (eff.startsWith("instant_moons_")) {
            const amount = parseInt(eff.replace("instant_moons_", ""), 10) || 1;
            state.moonsCount = (state.moonsCount || 0) + amount;
            rewardDesc = `+${amount} 🌙 Mond(e) erhalten!`;
            claimed = true;
          } else if (eff.startsWith("instant_life_")) {
            const minStr = eff.replace("instant_life_", "").replace("m", "");
            const minutes = parseInt(minStr, 10) || 5;
            const currentLps = getLpsAndStats().totalLps;
            const rewardLife = currentLps * minutes * 60;
            state.life += rewardLife;
            state.totalLifeEarned += rewardLife;
            rewardDesc = `+${formatCompactNumber(rewardLife)} Lebenskraft erhalten (Produktion von ${minutes}m)!`;
            claimed = true;
          } else if (eff === "instant_hybrid_dust_stars") {
            state.starsCount += 50;
            state.glitterDust += 20;
            rewardDesc = `+50 ⭐ Sterne und +20 ✨ Glitzerstaub erhalten!`;
            claimed = true;
          }

          if (claimed) {
            state.activeEventInstantClaimed = true;
            state.eventTimeRemaining = Math.min(5, state.eventTimeRemaining);
            emit({
              type: "COSMETIC_FOUND",
              text: `${rewardDesc} 🎉`,
            });
          }
        }
      }

      if (decision === "ignorieren" && previous !== "ignorieren") {
        state.eventTimeRemaining += 60;
      } else if (decision !== "ignorieren" && previous === "ignorieren") {
        state.eventTimeRemaining = Math.max(5, state.eventTimeRemaining - 60);
      }
      broadcastStateUpdate();
      break;
    }
    case "UPDATE_SHOOTING_STARS": {
      state.shootingStarsCount = data.count;
      broadcastStateUpdate();
      break;
    }
    case "MISSION_CLAIMED": {
      updateTaskProgress("missions_completed", 1);
      break;
    }
    case "BLACK_HOLE_GAMBLE": {
      const { sacrificeType } = data;
      const res = executeBlackHoleGamble(state, sacrificeType, getLpsAndStats, setupActiveEvent);

      if (res.success) {
        if (state.activeEvent === "black_hole") {
          state.activeEvent = null;
          state.activeEventDecision = null;

          let waitDuration = 120;
          if (state.purchasedUpgrades.includes("upg-event-frequency")) {
            waitDuration = 70;
          }
          const constellPolarlichtLvl = state.constellations?.ewiges_polarlicht || 0;
          waitDuration = Math.round(waitDuration * (1 - constellPolarlichtLvl * 0.15));
          state.eventTimeRemaining = waitDuration;

          emit({
            type: "EVENT_TRIGGER",
            event: null,
            active: false,
          });
        }

        emit({
          type: "BLACK_HOLE_GAMBLE_RESULT",
          success: true,
          roll: res.roll,
          outcomeType: res.outcomeType,
          title: res.title,
          text: res.text,
        });

        broadcastStateUpdate(true);
      } else {
        emit({
          type: "BLACK_HOLE_GAMBLE_RESULT",
          success: false,
          error: res.error,
        });
      }
      break;
    }
    case "CLEANUP": {
      stopTimers();
      break;
    }
    default:
      return;
  }
}
