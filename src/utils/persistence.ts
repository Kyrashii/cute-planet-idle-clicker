/**
 * localStorage save schema versioning (Vercel client-localstorage-schema).
 *
 * Saves now carry a `version` field so the shape can evolve safely. Loads run
 * through `migrateSave`, which upgrades older payloads to the current version.
 * Pre-versioning saves are treated as v1 with no field changes, so existing
 * players lose nothing.
 */

export const SAVE_KEY = "cute_planet_save";
export const SAVE_VERSION = 1;

export type RawSave = Record<string, unknown>;

function normalizePlacedAnimalEntry(entry: unknown) {
  if (!entry || typeof entry !== "object") return null;
  const placed = entry as Record<string, unknown>;
  if (typeof placed.id !== "string" || typeof placed.animalId !== "string") return null;
  const x = typeof placed.x === "number" ? placed.x : Number(placed.x || 0);
  const y = typeof placed.y === "number" ? placed.y : Number(placed.y || 0);
  const behaviorSeed =
    typeof placed.behaviorSeed === "number"
      ? placed.behaviorSeed
      : Math.floor(Math.random() * 1_000_000);
  const facing = placed.facing === -1 ? -1 : 1;

  return {
    ...placed,
    x,
    y,
    behaviorSeed,
    facing,
  };
}

/**
 * Normalize a parsed save object to the current schema version. Returns `null`
 * for anything that isn't a usable object. Future migrations chain off the
 * detected version.
 */
export function migrateSave(raw: unknown): RawSave | null {
  if (!raw || typeof raw !== "object") return null;
  let save = raw as RawSave;

  const version = typeof save.version === "number" ? save.version : 0;

  // v0 (unversioned) -> v1: no field changes; just stamp the version.
  if (version < 1) {
    save = { ...save, version: 1 };
  }

  if (Array.isArray(save.placedAnimals)) {
    save = {
      ...save,
      placedAnimals: save.placedAnimals
        .map((entry) => normalizePlacedAnimalEntry(entry))
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    };
  }

  // (future) if (save.version < 2) { … }

  return save;
}

/** Stamp the current schema version onto an outgoing save payload. */
export function withSaveVersion<T extends object>(save: T): T & { version: number } {
  return { ...save, version: SAVE_VERSION };
}
