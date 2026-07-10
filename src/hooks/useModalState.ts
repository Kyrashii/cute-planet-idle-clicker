import { useMemo, useRef, useState } from "react";
import { hasAnySaveData } from "../utils/persistence";
import { useModalStack, type ModalId } from "./useModalStack";

export const TUTORIAL_SEEN_KEY = "cute_planet_tutorial_seen";

function hasSeenTutorial(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_SEEN_KEY) === "1";
  } catch {
    // Broken storage: never spam the tutorial.
    return true;
  }
}

function markTutorialSeen(): void {
  try {
    window.localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

/**
 * Centralizes the visibility flags for every modal / dialog / overlay.
 *
 * Internally a single ordered modal stack (browser-back closes the top modal);
 * the returned API keeps the original independent flag/setter names so call
 * sites don't churn. `showTutorial` starts open only for genuinely new players
 * (no seen flag, no save data); dismissing it persists a per-device seen flag.
 * It stays re-openable on demand (menu drawer "Anleitung").
 */
export function useModalState() {
  const [initialStack] = useState<readonly ModalId[]>(() =>
    hasSeenTutorial() || hasAnySaveData() ? [] : ["tutorial"],
  );
  const { stack, openModal, closeModal, closeTop, isOpen } = useModalStack(initialStack);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const setters = useMemo(() => {
    const set =
      (id: ModalId, onClose?: () => void) => (value: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof value === "function" ? value(stackRef.current.includes(id)) : value;
        if (next) {
          openModal(id);
        } else {
          onClose?.();
          closeModal(id);
        }
      };
    const open = (id: ModalId) => () => openModal(id);
    return {
      setShowAnimalsModal: set("animals"),
      setShowStarsModal: set("stars"),
      setShowStatsModal: set("stats"),
      setShowMusicSettingsModal: set("musicSettings"),
      setShowCloudSyncModal: set("cloudSync"),
      setShowLeaderboardModal: set("leaderboard"),
      setShowCraftingModal: set("crafting"),
      setShowGalaxyShardsShop: set("galaxyShardsShop"),
      setShowMissionsModal: set("missions"),
      setShowInventoryModal: set("inventory"),
      setShowPrestigeModal: set("prestige"),
      setShowVoyageModal: set("voyage"),
      setShowZodiacModal: set("zodiac"),
      setShowOfflineModal: set("offline"),
      setShowResetDialog: set("reset"),
      setShowRepairDialog: set("repair"),
      setShowCheatEventModal: set("cheatEvent"),
      setShowTutorial: set("tutorial", markTutorialSeen),
      setShowUpgradesModal: set("upgrades"),
      setShowAchievementsModal: set("achievements"),
      setShowGehegeModal: set("gehege"),
      setShowMenuDrawer: set("menu"),
      openPrestigeModal: open("prestige"),
      openOfflineModal: open("offline"),
      openZodiacModal: open("zodiac"),
      openAnimalsModal: open("animals"),
      openCraftingModal: open("crafting"),
      openStarsModal: open("stars"),
      openUpgradesModal: open("upgrades"),
      openAchievementsModal: open("achievements"),
      openStatsModal: open("stats"),
      openMissionsModal: open("missions"),
      openInventoryModal: open("inventory"),
      openGehegeModal: open("gehege"),
    };
  }, [openModal, closeModal]);

  return {
    ...setters,
    showAnimalsModal: isOpen("animals"),
    showStarsModal: isOpen("stars"),
    showStatsModal: isOpen("stats"),
    showMusicSettingsModal: isOpen("musicSettings"),
    showCloudSyncModal: isOpen("cloudSync"),
    showLeaderboardModal: isOpen("leaderboard"),
    showCraftingModal: isOpen("crafting"),
    showGalaxyShardsShop: isOpen("galaxyShardsShop"),
    showMissionsModal: isOpen("missions"),
    showInventoryModal: isOpen("inventory"),
    showPrestigeModal: isOpen("prestige"),
    showVoyageModal: isOpen("voyage"),
    showZodiacModal: isOpen("zodiac"),
    showOfflineModal: isOpen("offline"),
    showResetDialog: isOpen("reset"),
    showRepairDialog: isOpen("repair"),
    showCheatEventModal: isOpen("cheatEvent"),
    showTutorial: isOpen("tutorial"),
    showUpgradesModal: isOpen("upgrades"),
    showAchievementsModal: isOpen("achievements"),
    showGehegeModal: isOpen("gehege"),
    showMenuDrawer: isOpen("menu"),
    modalStack: stack,
    openModal,
    closeModal,
    closeTop,
    isModalOpen: isOpen,
  };
}
