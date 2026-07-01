/**
 * Central registry of the lazy modal chunks.
 *
 * GameModalsContainer builds its React.lazy components from this map, and
 * `preloadModals()` warms every chunk during idle time after boot so the
 * first open doesn't stall on a network/parse round-trip. The chunks stay
 * code-split (the bundle budget only gates the entry/firebase/motion chunks).
 */

export const MODAL_IMPORTS = {
  ResetDialog: () => import("./modals/ResetDialog"),
  CheatEventModal: () => import("./modals/CheatEventModal"),
  UpgradesModal: () => import("./modals/UpgradesModal"),
  AnimalsModal: () => import("./modals/AnimalsModal"),
  StarsModal: () => import("./modals/StarsModal"),
  CraftingModal: () => import("./modals/CraftingModal"),
  StatsModal: () => import("./modals/StatsModal"),
  OfflineEarningsModal: () => import("./modals/OfflineEarningsModal"),
  AchievementsModal: () => import("./modals/AchievementsModal"),
  MusicSettingsModal: () => import("./modals/MusicSettingsModal"),
  CloudSyncModal: () => import("./modals/CloudSyncModal"),
  SyncConflictDialog: () => import("./modals/SyncConflictDialog"),
  MissionsModal: () => import("./modals/MissionsModal"),
  OpeningResultModal: () => import("./modals/OpeningResultModal"),
  InventoryModal: () => import("./modals/InventoryModal"),
  ZodiacModal: () => import("./modals/ZodiacModal"),
  LeaderboardModal: () => import("./modals/LeaderboardModal"),
  ProfileModal: () => import("./modals/ProfileModal"),
  PrestigeModal: () => import("./modals/PrestigeModal"),
} as const;

let preloaded = false;

export function preloadModals(): void {
  if (preloaded) return;
  preloaded = true;
  for (const load of Object.values(MODAL_IMPORTS)) {
    void load().catch(() => {
      // Preload is best-effort; a failed warm-up retries on actual open.
      preloaded = false;
    });
  }
}

/** Schedules `preloadModals` for browser idle time (Safari has no rIC). */
export function schedulePreloadModals(): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => preloadModals(), { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(preloadModals, 2000);
  return () => window.clearTimeout(id);
}
