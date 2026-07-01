import { useMemo, useRef } from "react";
import { useModalStack, type ModalId } from "./useModalStack";

/**
 * Centralizes the visibility flags for every modal / dialog / overlay.
 *
 * Internally a single ordered modal stack (browser-back closes the top modal);
 * the returned API keeps the original independent flag/setter names so call
 * sites don't churn. `showTutorial` defaults to `true` (first-run tutorial).
 */
export function useModalState() {
  const { stack, openModal, closeModal, closeTop, isOpen } = useModalStack(["tutorial"]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const setters = useMemo(() => {
    const set = (id: ModalId) => (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(stackRef.current.includes(id)) : value;
      if (next) {
        openModal(id);
      } else {
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
      setShowTutorial: set("tutorial"),
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
