import { createRogueliteMetaState } from "../roguelite/engine";

/**
 * localStorage save schema versioning with per-owner save slots.
 *
 * Guest progress lives under `cute_planet_save_guest`, authenticated users get
 * their own `cute_planet_save_user_<uid>` slots, and lightweight coordination
 * metadata lives in `cute_planet_save_meta`.
 */

export const LEGACY_SAVE_KEY = "cute_planet_save";
export const SAVE_KEY_PREFIX = "cute_planet_save";
export const SAVE_META_KEY = "cute_planet_save_meta";
export const SAVE_VERSION = 4;

const REMOVED_XP_UPGRADE_REFUNDS: Record<string, number> = {
  "upg-xp-1": 450,
  "upg-xp-2": 2_500,
  "upg-xp-3": 15_000,
  "upg-xp-4": 85_000,
  "upg-xp-5": 450_000,
};
const REMOVED_XP_UPGRADE_IDS = new Set(Object.keys(REMOVED_XP_UPGRADE_REFUNDS));

export type SaveOwnerId = string | null;

export interface SaveMetadata {
  version: number;
  ownerId: SaveOwnerId;
  lastSavedAt: number;
  lastCloudUpdatedAt?: number | null;
}

export type RawSave = Record<string, unknown> & SaveMetadata;

export interface SaveMetaState {
  activeOwnerId: SaveOwnerId;
  legacyMigrated: boolean;
}

const DEFAULT_META: SaveMetaState = {
  activeOwnerId: null,
  legacyMigrated: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getNumericField = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getNonNegativeField = (value: unknown, fallback = 0) =>
  Math.max(0, getNumericField(value, fallback));

const getStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];

const getNumberRecord = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, rawValue]) => [key, Math.floor(getNonNegativeField(rawValue))] as const)
      .filter(([, count]) => count > 0),
  );
};

export function getSaveKey(ownerId: SaveOwnerId): string {
  return ownerId ? `${SAVE_KEY_PREFIX}_user_${ownerId}` : `${SAVE_KEY_PREFIX}_guest`;
}

/**
 * True when any save slot (guest, per-user, or legacy) exists — a returning
 * player. Deliberately ignores `SAVE_META_KEY`: meta is written within the
 * first moments of any boot, long before a player counts as "returning".
 */
export function hasAnySaveData(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key === LEGACY_SAVE_KEY ||
        key === getSaveKey(null) ||
        key.startsWith(`${SAVE_KEY_PREFIX}_user_`)
      ) {
        return true;
      }
    }
  } catch {
    // storage unavailable
  }
  return false;
}

export function normalizeCloudTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    const millis = value.getTime();
    return Number.isFinite(millis) ? millis : null;
  }

  if (typeof value === "string") {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      return asNumber;
    }

    const millis = new Date(value).getTime();
    return Number.isFinite(millis) ? millis : null;
  }

  if (isRecord(value)) {
    const maybeToMillis = value.toMillis;
    if (typeof maybeToMillis === "function") {
      const millis = maybeToMillis.call(value);
      return typeof millis === "number" && Number.isFinite(millis) ? millis : null;
    }

    const seconds = typeof value.seconds === "number" ? value.seconds : null;
    const nanoseconds = typeof value.nanoseconds === "number" ? value.nanoseconds : 0;
    if (seconds !== null) {
      return seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
    }
  }

  return null;
}

export function migrateSave(raw: unknown, ownerId: SaveOwnerId = null): RawSave | null {
  if (!isRecord(raw)) return null;

  let save: RawSave = raw as RawSave;
  const version = typeof save.version === "number" ? save.version : 0;

  if (version < 1) {
    save = { ...save, version: 1 } as RawSave;
  }

  if (save.version < 2) {
    save = {
      ...save,
      version: 2,
      ownerId,
      lastSavedAt: getNumericField(save.lastSavedAt, Date.now()),
      lastCloudUpdatedAt: normalizeCloudTimestamp(save.lastCloudUpdatedAt),
    };
  }

  if (save.version < 3) {
    const rogueliteMeta = createRogueliteMetaState();
    const legacyRogueliteMeta = isRecord(save.rogueliteMeta) ? save.rogueliteMeta : {};
    const { equippedRelicIds: _legacyEquippedRelics, ...sanitizedRogueliteMeta } =
      legacyRogueliteMeta;
    save = {
      ...save,
      version: 3,
      rogueliteMeta: {
        ...rogueliteMeta,
        ...sanitizedRogueliteMeta,
      },
      activeRogueliteRun: isRecord(save.activeRogueliteRun) ? save.activeRogueliteRun : null,
      activePlanetSkin:
        typeof save.activePlanetSkin === "string" ? save.activePlanetSkin : "default",
    };
  }

  if (save.version < 4) {
    const purchasedUpgrades = getStringArray(save.purchasedUpgrades);
    const removedXpUpgrades = purchasedUpgrades.filter((id) => REMOVED_XP_UPGRADE_IDS.has(id));
    const xpRefund = removedXpUpgrades.reduce(
      (total, id) => total + REMOVED_XP_UPGRADE_REFUNDS[id],
      0,
    );
    const craftedItems = getNumberRecord(save.craftedItems);
    const xpCapsules = craftedItems.use_xp_capsule || 0;
    delete craftedItems.use_xp_capsule;
    if (xpCapsules > 0) {
      craftedItems.mat_pure_essence = (craftedItems.mat_pure_essence || 0) + xpCapsules * 3;
    }
    const { planetExp: _legacyPlanetExp, ...saveWithoutXp } = save;

    save = {
      ...saveWithoutXp,
      version: 4,
      life: getNonNegativeField(save.life) + xpRefund + xpCapsules * 500_000,
      totalLifeEarned: getNonNegativeField(save.totalLifeEarned),
      starsCount: Math.floor(getNonNegativeField(save.starsCount)),
      moonsCount: Math.floor(getNonNegativeField(save.moonsCount)),
      purchasedAnimals: getNumberRecord(save.purchasedAnimals),
      purchasedUpgrades: purchasedUpgrades.filter((id) => !REMOVED_XP_UPGRADE_IDS.has(id)),
      planetLevel: Math.max(1, Math.floor(getNonNegativeField(save.planetLevel, 1))),
      clicksCount: Math.floor(getNonNegativeField(save.clicksCount)),
      starClicksTriggered: Math.floor(getNonNegativeField(save.starClicksTriggered)),
      secondsPlayed: Math.floor(getNonNegativeField(save.secondsPlayed)),
      isNight: typeof save.isNight === "boolean" ? save.isNight : true,
      cycleProgress: Math.min(100, getNonNegativeField(save.cycleProgress)),
      activeEvent: typeof save.activeEvent === "string" ? save.activeEvent : null,
      activeEventDecision:
        typeof save.activeEventDecision === "string" ? save.activeEventDecision : null,
      activeEventDetails: isRecord(save.activeEventDetails) ? save.activeEventDetails : null,
      activeEventInstantClaimed: save.activeEventInstantClaimed === true,
      eventTimeRemaining: getNonNegativeField(save.eventTimeRemaining, 120),
      prestigeCount: Math.floor(getNonNegativeField(save.prestigeCount)),
      constellations: getNumberRecord(save.constellations),
      craftedItems,
      glitterDust: Math.floor(getNonNegativeField(save.glitterDust)),
      shootingStarsCount: Math.floor(getNonNegativeField(save.shootingStarsCount)),
      cosmeticRarityLevels: isRecord(save.cosmeticRarityLevels)
        ? { ...save.cosmeticRarityLevels }
        : {},
      blackHoleSize: Math.max(1, Math.floor(getNonNegativeField(save.blackHoleSize, 1))),
      zodiac:
        typeof save.zodiac === "string"
          ? save.zodiac
          : typeof save.activeZodiacId === "string"
            ? save.activeZodiacId
            : "katze",
      galaxyShards: Math.floor(getNonNegativeField(save.galaxyShards)),
      zodiacLevels: getNumberRecord(save.zodiacLevels),
      slummerGlassLevel: Math.max(1, Math.floor(getNonNegativeField(save.slummerGlassLevel, 1))),
      catalystLevel: Math.floor(getNonNegativeField(save.catalystLevel)),
      doubleStellarLevel: Math.floor(getNonNegativeField(save.doubleStellarLevel)),
      inGlitchGalaxy: save.inGlitchGalaxy === true,
      glitchPending: save.glitchPending === true,
      unlockedGlitchGalaxy: save.unlockedGlitchGalaxy === true,
      spentGalaxyShards: Math.floor(getNonNegativeField(save.spentGalaxyShards)),
      glitchCooldown: save.glitchCooldown === true,
      superClickCharge: Math.min(100, getNonNegativeField(save.superClickCharge)),
      superClickArmed: save.superClickArmed === true,
      placedAnimals: Array.isArray(save.placedAnimals) ? [...save.placedAnimals] : [],
      animalLove: getNumberRecord(save.animalLove),
      animalLastPet: getNumberRecord(save.animalLastPet),
      bowlLastFed: getNonNegativeField(save.bowlLastFed),
      bowlFedMinutesCredited: getNonNegativeField(save.bowlFedMinutesCredited),
      missionSetNumber: Math.max(1, Math.floor(getNonNegativeField(save.missionSetNumber, 1))),
      claimedMissionIds: getStringArray(save.claimedMissionIds),
      missionsCooldownEnd:
        save.missionsCooldownEnd === null
          ? null
          : getNonNegativeField(save.missionsCooldownEnd) || null,
      offlineSeconds: getNonNegativeField(save.offlineSeconds),
      offlineLpsRate: getNonNegativeField(save.offlineLpsRate),
      offlineEarnedLife: getNonNegativeField(save.offlineEarnedLife),
      unlockedCosmetics: getStringArray(save.unlockedCosmetics),
      activeStarColor: typeof save.activeStarColor === "string" ? save.activeStarColor : "default",
      activeAccessory: typeof save.activeAccessory === "string" ? save.activeAccessory : "none",
      activeFrame: typeof save.activeFrame === "string" ? save.activeFrame : "default",
      activeMoonSkin: typeof save.activeMoonSkin === "string" ? save.activeMoonSkin : "default",
      activePlanetSkin:
        typeof save.activePlanetSkin === "string" ? save.activePlanetSkin : "default",
      activeRogueliteRun: isRecord(save.activeRogueliteRun)
        ? {
            ...save.activeRogueliteRun,
            metaWinsAtStart: getNonNegativeField(
              save.activeRogueliteRun.metaWinsAtStart,
              isRecord(save.rogueliteMeta) ? getNonNegativeField(save.rogueliteMeta.wins) : 0,
            ),
            unlockedPlanetSkinIdsAtStart: getStringArray(
              save.activeRogueliteRun.unlockedPlanetSkinIdsAtStart ??
                (isRecord(save.rogueliteMeta) ? save.rogueliteMeta.unlockedPlanetSkins : []),
            ),
          }
        : null,
    };
  }

  const { planetExp: _removedPlanetExp, ...normalizedSave } = save;
  return {
    ...normalizedSave,
    version: SAVE_VERSION,
    ownerId: save.ownerId ?? ownerId ?? null,
    lastSavedAt: getNumericField(save.lastSavedAt, Date.now()),
    lastCloudUpdatedAt: normalizeCloudTimestamp(save.lastCloudUpdatedAt),
  };
}

export function withSaveVersion<T extends object>(
  save: T,
  ownerId: SaveOwnerId = null,
): T & SaveMetadata {
  const source = save as Partial<SaveMetadata>;
  return {
    ...save,
    version: SAVE_VERSION,
    ownerId,
    lastSavedAt: getNumericField(source.lastSavedAt, Date.now()),
    lastCloudUpdatedAt: normalizeCloudTimestamp(source.lastCloudUpdatedAt),
  };
}

export function readSave(ownerId: SaveOwnerId): RawSave | null {
  const raw = localStorage.getItem(getSaveKey(ownerId));
  if (!raw) return null;

  try {
    return migrateSave(JSON.parse(raw), ownerId);
  } catch (error) {
    console.error("Failed to parse save slot:", error);
    return null;
  }
}

export function writeSave<T extends object>(ownerId: SaveOwnerId, save: T): T & SaveMetadata {
  const migrated = migrateSave(save, ownerId);
  if (!migrated) {
    throw new TypeError("Cannot persist a non-object save payload");
  }
  const stamped = migrated as T & SaveMetadata;
  localStorage.setItem(getSaveKey(ownerId), JSON.stringify(stamped));
  return stamped;
}

export function removeSave(ownerId: SaveOwnerId) {
  localStorage.removeItem(getSaveKey(ownerId));
}

export function readMeta(): SaveMetaState {
  const raw = localStorage.getItem(SAVE_META_KEY);
  if (!raw) return DEFAULT_META;

  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return DEFAULT_META;
    }

    return {
      activeOwnerId: typeof parsed.activeOwnerId === "string" ? parsed.activeOwnerId : null,
      legacyMigrated: parsed.legacyMigrated === true,
    };
  } catch (error) {
    console.error("Failed to parse save metadata:", error);
    return DEFAULT_META;
  }
}

export function writeMeta(next: Partial<SaveMetaState>): SaveMetaState {
  const merged: SaveMetaState = {
    ...readMeta(),
    ...next,
  };
  localStorage.setItem(SAVE_META_KEY, JSON.stringify(merged));
  return merged;
}

export function migrateLegacyGlobalSave() {
  const meta = readMeta();
  if (meta.legacyMigrated) {
    return;
  }

  const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
  if (legacyRaw) {
    try {
      const parsed = JSON.parse(legacyRaw);
      const migrated = migrateSave(parsed, null);
      if (migrated) {
        writeSave(null, migrated);
      }
      localStorage.removeItem(LEGACY_SAVE_KEY);
    } catch (error) {
      console.error("Failed to migrate legacy global save:", error);
    }
  }

  writeMeta({ legacyMigrated: true });
}
