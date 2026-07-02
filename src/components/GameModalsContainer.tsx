import React from "react";
import { MODAL_IMPORTS } from "./modalPreload";
import { useModalPresence, useLatchedValue } from "../hooks/useModalPresence";
import { useModalSettings } from "./ui/Modal";

const ResetDialog = React.lazy(() =>
  MODAL_IMPORTS.ResetDialog().then((m) => ({ default: m.ResetDialog })),
);
const CheatEventModal = React.lazy(() =>
  MODAL_IMPORTS.CheatEventModal().then((m) => ({ default: m.CheatEventModal })),
);
const UpgradesModal = React.lazy(() =>
  MODAL_IMPORTS.UpgradesModal().then((m) => ({ default: m.UpgradesModal })),
);
const AnimalsModal = React.lazy(() =>
  MODAL_IMPORTS.AnimalsModal().then((m) => ({ default: m.AnimalsModal })),
);
const StarsModal = React.lazy(() =>
  MODAL_IMPORTS.StarsModal().then((m) => ({ default: m.StarsModal })),
);
const CraftingModal = React.lazy(() =>
  MODAL_IMPORTS.CraftingModal().then((m) => ({ default: m.CraftingModal })),
);
const StatsModal = React.lazy(() =>
  MODAL_IMPORTS.StatsModal().then((m) => ({ default: m.StatsModal })),
);
const OfflineEarningsModal = React.lazy(() =>
  MODAL_IMPORTS.OfflineEarningsModal().then((m) => ({ default: m.OfflineEarningsModal })),
);
const AchievementsModal = React.lazy(() =>
  MODAL_IMPORTS.AchievementsModal().then((m) => ({ default: m.AchievementsModal })),
);
const MusicSettingsModal = React.lazy(() =>
  MODAL_IMPORTS.MusicSettingsModal().then((m) => ({ default: m.MusicSettingsModal })),
);
const CloudSyncModal = React.lazy(() =>
  MODAL_IMPORTS.CloudSyncModal().then((m) => ({ default: m.CloudSyncModal })),
);
const SyncConflictDialog = React.lazy(() =>
  MODAL_IMPORTS.SyncConflictDialog().then((m) => ({ default: m.SyncConflictDialog })),
);
const MissionsModal = React.lazy(() =>
  MODAL_IMPORTS.MissionsModal().then((m) => ({ default: m.MissionsModal })),
);
const OpeningResultModal = React.lazy(() =>
  MODAL_IMPORTS.OpeningResultModal().then((m) => ({ default: m.OpeningResultModal })),
);
const InventoryModal = React.lazy(() =>
  MODAL_IMPORTS.InventoryModal().then((m) => ({ default: m.InventoryModal })),
);
const ZodiacModal = React.lazy(() =>
  MODAL_IMPORTS.ZodiacModal().then((m) => ({ default: m.ZodiacModal })),
);
const LeaderboardModal = React.lazy(() =>
  MODAL_IMPORTS.LeaderboardModal().then((m) => ({ default: m.LeaderboardModal })),
);
const ProfileModal = React.lazy(() =>
  MODAL_IMPORTS.ProfileModal().then((m) => ({ default: m.ProfileModal })),
);
const PrestigeModal = React.lazy(() =>
  MODAL_IMPORTS.PrestigeModal().then((m) => ({ default: m.PrestigeModal })),
);
import type { User } from "firebase/auth";
import type { FontScaleOption } from "../hooks/useDisplayPreferences";
import type { AccountSwitchPrompt, CloudSaveData } from "../hooks/useFirebaseSync";
import type { Achievement, Upgrade } from "../types";
import type { LootboxesOpenedEvent, OpeningResult, StatsResult } from "../game/protocol";
import type { MusicStyleId } from "../utils/audio";

import { INITIAL_ANIMALS, calculateCost } from "../data";

interface GameModalsContainerProps {
  // Modal visibility flags
  showResetDialog: boolean;
  setShowResetDialog: (show: boolean) => void;
  showCheatEventModal: boolean;
  setShowCheatEventModal: (show: boolean) => void;
  planetLevel: number;
  showUpgradesModal: boolean;
  setShowUpgradesModal: (show: boolean) => void;
  showAnimalsModal: boolean;
  setShowAnimalsModal: (show: boolean) => void;
  showStarsModal: boolean;
  setShowStarsModal: (show: boolean) => void;
  showCraftingModal: boolean;
  setShowCraftingModal: (show: boolean) => void;
  showStatsModal: boolean;
  setShowStatsModal: (show: boolean) => void;
  showOfflineModal: boolean;
  setShowOfflineModal: (show: boolean) => void;
  showAchievementsModal: boolean;
  setShowAchievementsModal: (show: boolean) => void;
  showMusicSettingsModal: boolean;
  setShowMusicSettingsModal: (show: boolean) => void;
  showCloudSyncModal: boolean;
  setShowCloudSyncModal: (show: boolean) => void;
  accountSwitchPrompt: AccountSwitchPrompt | null;
  showMissionsModal: boolean;
  setShowMissionsModal: (show: boolean) => void;
  openingResult: OpeningResult | null;
  setOpeningResult: (res: OpeningResult | null) => void;
  lootboxResult: LootboxesOpenedEvent | null;
  setLootboxResult: (res: LootboxesOpenedEvent | null) => void;
  showInventoryModal: boolean;
  setShowInventoryModal: (show: boolean) => void;
  showZodiacModal: boolean;
  setShowZodiacModal: (show: boolean) => void;
  showLeaderboardModal: boolean;
  setShowLeaderboardModal: (show: boolean) => void;
  showPrestigeModal: boolean;
  setShowPrestigeModal: (show: boolean) => void;

  // Handlers
  handleGameReset: () => void;
  workerRef: React.RefObject<Worker | null>;
  handleBuyUpgrade: (id: string, cost: number) => void;
  handleBuyUpgradesBatch: (list: { id: string; cost: number; isGlitter: boolean }[]) => void;
  handleBuyAnimal: (animalId: string, cost: number, countToBuy: number) => void;
  handleBuyStar: () => void;
  handleMergeMoons: () => void;
  handleInvestConstellation: (
    constellationId: string,
    starsCost: number,
    moonsCost: number,
  ) => void;
  handleCraftItem: (recipeId: string, count?: number) => void;
  handleCraftRecursive: (targetItemId: string, count?: number) => void;
  handleClaimOfflineEarnings: (earnedLife: number) => void;
  handleClaimMissionReward: (missionId: string, starsReward: number) => void;
  handleOpenLootboxes: (count: number) => void;
  handleApplyCosmetic: (
    id: string,
    type: "star_color" | "planet_accessory" | "frame_style" | "moon_skin",
  ) => void;
  handleApplyPlanetSkin: (skinId: string) => void;
  handleUnlockCosmeticDirect: (cosmeticId: string, cost: number) => void;
  handleUpgradeCosmeticRarity: (cosmeticId: string, targetRarity: string, cost: number) => void;
  handleUseCraftedItem: (itemId: string, count?: number) => void;
  handleSelectZodiac: (zodiacId: string) => void;
  handleConfirmPrestige: () => void;
  onForceSave: () => void;

  // Stable state — referentially guarded or changes only on user actions
  purchasedUpgrades: string[];
  staticUpgrades: Upgrade[];
  purchasedAnimals: Record<string, number>;
  constellations: Record<string, number>;
  isNightStyle: boolean;
  craftedItems: Record<string, number>;
  formatCompactNumber: (num: number) => string;
  formatTimePlayed: (sec: number) => string;
  offlineSeconds: number;
  offlineLpsRate: number;
  offlineEarnedLife: number;
  achievements: Achievement[];
  achievementCategoryFilter: string;
  setAchievementCategoryFilter: (filter: string) => void;
  achievementSearch: string;
  setAchievementSearch: (search: string) => void;
  playUpgrade: () => void;
  musicStyleState: MusicStyleId;
  setMusicStyleState: React.Dispatch<React.SetStateAction<MusicStyleId>>;
  isLowMemory: boolean;
  setIsLowMemory: React.Dispatch<React.SetStateAction<boolean>>;
  fontScale: FontScaleOption;
  setFontScale: (value: FontScaleOption) => void;
  user: User | null;
  authLoading: boolean;
  syncing: boolean;
  lastSynced: Date | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  cloudSaveFound: CloudSaveData | null;
  triggerCloudStateLoad: (data: CloudSaveData) => void;
  continueWithCurrentAccount: () => void;
  adoptPreviousLocalSave: () => void;
  missionSetNumber: number;
  claimedMissionIds: string[];
  missionsCooldownEnd: number | null;
  activeFrame: string;
  unlockedCosmetics: string[];
  activeStarColor: string;
  activeAccessory: string;
  activeMoonSkin: string;
  activePlanetSkin: string;
  unlockedPlanetSkins: string[];
  activeZodiacId: string;
  cosmeticRarityLevels: Record<string, string>;
  upgradesSpecs: StatsResult["upgradesSpecs"];
}

export const GameModalsContainer: React.FC<GameModalsContainerProps> = React.memo(
  ({
    showResetDialog,
    setShowResetDialog,
    showCheatEventModal,
    setShowCheatEventModal,
    planetLevel,
    showUpgradesModal,
    setShowUpgradesModal,
    showAnimalsModal,
    setShowAnimalsModal,
    showStarsModal,
    setShowStarsModal,
    showCraftingModal,
    setShowCraftingModal,
    showStatsModal,
    setShowStatsModal,
    showOfflineModal,
    setShowOfflineModal,
    showAchievementsModal,
    setShowAchievementsModal,
    showMusicSettingsModal,
    setShowMusicSettingsModal,
    showCloudSyncModal,
    setShowCloudSyncModal,
    accountSwitchPrompt,
    showMissionsModal,
    setShowMissionsModal,
    openingResult,
    setOpeningResult,
    lootboxResult,
    setLootboxResult,
    showInventoryModal,
    setShowInventoryModal,
    showZodiacModal,
    setShowZodiacModal,
    showLeaderboardModal,
    setShowLeaderboardModal,
    showPrestigeModal,
    setShowPrestigeModal,

    handleGameReset,
    workerRef,
    handleBuyUpgrade,
    handleBuyUpgradesBatch,
    handleBuyAnimal,
    handleBuyStar,
    handleMergeMoons,
    handleInvestConstellation,
    handleCraftItem,
    handleCraftRecursive,
    handleClaimOfflineEarnings,
    handleClaimMissionReward,
    handleOpenLootboxes,
    handleApplyCosmetic,
    handleApplyPlanetSkin,
    handleUnlockCosmeticDirect,
    handleUpgradeCosmeticRarity,
    handleUseCraftedItem,
    handleSelectZodiac,
    handleConfirmPrestige,
    onForceSave,

    purchasedUpgrades,
    staticUpgrades,
    purchasedAnimals,
    constellations,
    isNightStyle,
    craftedItems,
    formatCompactNumber,
    formatTimePlayed,
    offlineSeconds,
    offlineLpsRate,
    offlineEarnedLife,
    achievements,
    achievementCategoryFilter,
    setAchievementCategoryFilter,
    achievementSearch,
    setAchievementSearch,
    playUpgrade,
    musicStyleState,
    setMusicStyleState,
    isLowMemory,
    setIsLowMemory,
    fontScale,
    setFontScale,
    user,
    authLoading,
    syncing,
    lastSynced,
    loginWithGoogle,
    logout,
    cloudSaveFound,
    triggerCloudStateLoad,
    continueWithCurrentAccount,
    adoptPreviousLocalSave,
    missionSetNumber,
    claimedMissionIds,
    missionsCooldownEnd,
    activeFrame,
    unlockedCosmetics,
    activeStarColor,
    activeAccessory,
    activeMoonSkin,
    activePlanetSkin,
    unlockedPlanetSkins,
    activeZodiacId,
    cosmeticRarityLevels,
    upgradesSpecs,
  }) => {
    // The public profile is only ever opened from within the leaderboard, so its selection lives
    // here rather than in the shared modal state.
    const [profileUserId, setProfileUserId] = React.useState<string | null>(null);

    // Mount gates: each modal stays mounted through its exit animation
    // instead of being ripped out the moment its show-flag flips false.
    const { disableAnimations } = useModalSettings();
    const mountResetDialog = useModalPresence(showResetDialog, disableAnimations);
    const mountCheatEvent = useModalPresence(showCheatEventModal, disableAnimations);
    const mountUpgrades = useModalPresence(showUpgradesModal, disableAnimations);
    const mountAnimals = useModalPresence(showAnimalsModal, disableAnimations);
    const mountStars = useModalPresence(showStarsModal, disableAnimations);
    const mountCrafting = useModalPresence(showCraftingModal, disableAnimations);
    const mountStats = useModalPresence(showStatsModal, disableAnimations);
    const mountOffline = useModalPresence(showOfflineModal, disableAnimations);
    const mountAchievements = useModalPresence(showAchievementsModal, disableAnimations);
    const mountMusicSettings = useModalPresence(showMusicSettingsModal, disableAnimations);
    const mountCloudSync = useModalPresence(showCloudSyncModal, disableAnimations);
    const mountSyncConflict = useModalPresence(accountSwitchPrompt !== null, disableAnimations);
    const mountMissions = useModalPresence(showMissionsModal, disableAnimations);
    const mountOpeningResult = useModalPresence(openingResult !== null, disableAnimations);
    const mountInventory = useModalPresence(showInventoryModal, disableAnimations);
    const mountZodiac = useModalPresence(showZodiacModal, disableAnimations);
    const mountLeaderboard = useModalPresence(showLeaderboardModal, disableAnimations);
    const mountProfile = useModalPresence(profileUserId !== null, disableAnimations);
    const mountPrestige = useModalPresence(showPrestigeModal, disableAnimations);

    // Data-carrying modals keep their last payload alive while exiting.
    const latchedAccountSwitchPrompt = useLatchedValue(accountSwitchPrompt);
    const latchedOpeningResult = useLatchedValue(openingResult);
    const latchedProfileUserId = useLatchedValue(profileUserId);

    return (
      <React.Suspense fallback={null}>
        {mountResetDialog && (
          <ResetDialog
            isOpen={showResetDialog}
            onConfirm={handleGameReset}
            onCancel={() => setShowResetDialog(false)}
          />
        )}

        {mountCheatEvent && (
          <CheatEventModal
            isOpen={showCheatEventModal}
            currentPlanetLevel={planetLevel}
            onSetPlanetLevel={(level) => {
              workerRef.current?.postMessage({
                type: "SET_PLANET_LEVEL",
                level,
              });
            }}
            onSelectEvent={(event) => {
              workerRef.current?.postMessage({
                type: "FORCE_TRIGGER_EVENT",
                event,
              });
            }}
            onClose={() => setShowCheatEventModal(false)}
          />
        )}

        {mountUpgrades && (
          <UpgradesModal
            isOpen={showUpgradesModal}
            onClose={() => setShowUpgradesModal(false)}
            purchasedUpgrades={purchasedUpgrades}
            staticUpgrades={staticUpgrades}
            onBuyUpgrade={handleBuyUpgrade}
            onBuyUpgradesBatch={handleBuyUpgradesBatch}
            formatCompactNumber={formatCompactNumber}
          />
        )}

        {mountAnimals && (
          <AnimalsModal
            isOpen={showAnimalsModal}
            onClose={() => setShowAnimalsModal(false)}
            purchasedAnimals={purchasedAnimals}
            animalDefs={INITIAL_ANIMALS}
            onBuyAnimal={handleBuyAnimal}
            calculateCost={calculateCost}
            formatCompactNumber={formatCompactNumber}
            upgradesSpecs={upgradesSpecs}
          />
        )}

        {mountStars && (
          <StarsModal
            isOpen={showStarsModal}
            onClose={() => setShowStarsModal(false)}
            onBuyStar={handleBuyStar}
            formatCompactNumber={formatCompactNumber}
            onMergeMoons={handleMergeMoons}
            constellations={constellations}
            onInvestConstellation={handleInvestConstellation}
          />
        )}

        {mountCrafting && (
          <CraftingModal
            isOpen={showCraftingModal}
            onClose={() => setShowCraftingModal(false)}
            craftedItems={craftedItems}
            onCraftRecursive={handleCraftRecursive}
            formatCompactNumber={formatCompactNumber}
          />
        )}

        {mountStats && (
          <StatsModal
            isOpen={showStatsModal}
            onClose={() => setShowStatsModal(false)}
            purchasedAnimals={purchasedAnimals}
            formatCompactNumber={formatCompactNumber}
            formatTimePlayed={formatTimePlayed}
          />
        )}

        {mountOffline && (
          <OfflineEarningsModal
            isOpen={showOfflineModal}
            onClose={() => setShowOfflineModal(false)}
            secondsAway={offlineSeconds}
            offlineLps={offlineLpsRate}
            earnedLife={offlineEarnedLife}
            onClaim={handleClaimOfflineEarnings}
            formatCompactNumber={formatCompactNumber}
            isNight={isNightStyle}
          />
        )}

        {mountAchievements && (
          <AchievementsModal
            isOpen={showAchievementsModal}
            onClose={() => setShowAchievementsModal(false)}
            isNight={isNightStyle}
            achievements={achievements}
            achievementCategoryFilter={achievementCategoryFilter}
            setAchievementCategoryFilter={setAchievementCategoryFilter}
            achievementSearch={achievementSearch}
            setAchievementSearch={setAchievementSearch}
            formatCompactNumber={formatCompactNumber}
            playUpgrade={playUpgrade}
          />
        )}

        {mountMusicSettings && (
          <MusicSettingsModal
            isOpen={showMusicSettingsModal}
            onClose={() => setShowMusicSettingsModal(false)}
            isNight={isNightStyle}
            musicStyleState={musicStyleState}
            setMusicStyleState={setMusicStyleState}
            isLowMemory={isLowMemory}
            setIsLowMemory={setIsLowMemory}
            fontScale={fontScale}
            setFontScale={setFontScale}
          />
        )}

        {mountCloudSync && (
          <CloudSyncModal
            isOpen={showCloudSyncModal}
            onClose={() => setShowCloudSyncModal(false)}
            user={user}
            authLoading={authLoading}
            syncing={syncing}
            lastSynced={lastSynced}
            onLogin={loginWithGoogle}
            onLogout={logout}
            onForceSave={onForceSave}
            onForceLoad={() => {
              if (cloudSaveFound) {
                triggerCloudStateLoad(cloudSaveFound);
              }
            }}
            purchasedUpgrades={purchasedUpgrades}
            cloudStats={cloudSaveFound}
          />
        )}

        {mountSyncConflict && latchedAccountSwitchPrompt && (
          <SyncConflictDialog
            isOpen={accountSwitchPrompt !== null}
            mode="account-switch"
            previousLocalSave={latchedAccountSwitchPrompt.previousLocalSave}
            purchasedUpgrades={purchasedUpgrades}
            onKeepCurrentAccount={() => {
              continueWithCurrentAccount();
            }}
            onAdoptPreviousLocalSave={() => {
              adoptPreviousLocalSave();
            }}
          />
        )}

        {mountMissions && (
          <MissionsModal
            isOpen={showMissionsModal}
            onClose={() => setShowMissionsModal(false)}
            isNight={isNightStyle}
            missionSetNumber={missionSetNumber}
            claimedMissionIds={claimedMissionIds}
            missionsCooldownEnd={missionsCooldownEnd}
            onClaimReward={handleClaimMissionReward}
            activeFrame={activeFrame}
            unlockedCosmetics={unlockedCosmetics}
            purchasedUpgrades={purchasedUpgrades}
          />
        )}

        {mountOpeningResult && latchedOpeningResult !== null && (
          <OpeningResultModal
            isOpen={openingResult !== null}
            onClose={() => setOpeningResult(null)}
            isNight={isNightStyle}
            result={latchedOpeningResult}
          />
        )}

        {mountInventory && (
          <InventoryModal
            isOpen={showInventoryModal}
            onClose={() => setShowInventoryModal(false)}
            isNight={isNightStyle}
            zodiac={activeZodiacId}
            unlockedCosmetics={unlockedCosmetics}
            activeStarColor={activeStarColor}
            activeAccessory={activeAccessory}
            activeFrame={activeFrame}
            activeMoonSkin={activeMoonSkin}
            activePlanetSkin={activePlanetSkin}
            unlockedPlanetSkins={unlockedPlanetSkins}
            onOpenLootboxes={handleOpenLootboxes}
            lootboxResult={lootboxResult}
            onClearLootboxResult={() => setLootboxResult(null)}
            onApplyCosmetic={handleApplyCosmetic}
            onApplyPlanetSkin={handleApplyPlanetSkin}
            purchasedUpgrades={purchasedUpgrades}
            cosmeticRarityLevels={cosmeticRarityLevels}
            onUnlockCosmeticDirect={handleUnlockCosmeticDirect}
            onUpgradeCosmeticRarity={handleUpgradeCosmeticRarity}
            craftedItems={craftedItems}
            onUseCraftedItem={handleUseCraftedItem}
            onSelectZodiac={handleSelectZodiac}
          />
        )}

        {mountZodiac && (
          <ZodiacModal
            isOpen={showZodiacModal}
            onClose={() => setShowZodiacModal(false)}
            isNight={isNightStyle}
            activeZodiacId={activeZodiacId || "katze"}
          />
        )}

        {mountLeaderboard && (
          <LeaderboardModal
            isOpen={showLeaderboardModal}
            onClose={() => setShowLeaderboardModal(false)}
            currentUserId={user?.uid}
            formatCompactNumber={formatCompactNumber}
            onOpenProfile={setProfileUserId}
          />
        )}

        {mountProfile && latchedProfileUserId !== null && (
          <ProfileModal
            isOpen={profileUserId !== null}
            onClose={() => setProfileUserId(null)}
            userId={latchedProfileUserId}
            currentUserId={user?.uid}
            formatCompactNumber={formatCompactNumber}
            animalDefs={INITIAL_ANIMALS}
          />
        )}

        {mountPrestige && (
          <PrestigeModal
            isOpen={showPrestigeModal}
            onClose={() => setShowPrestigeModal(false)}
            isNight={isNightStyle}
            onPrestigeConfirm={handleConfirmPrestige}
            formatCompactNumber={formatCompactNumber}
          />
        )}
      </React.Suspense>
    );
  },
);

GameModalsContainer.displayName = "GameModalsContainer";
