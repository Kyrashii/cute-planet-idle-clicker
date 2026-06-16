import React from "react";
import { ResetDialog } from "./modals/ResetDialog";
import { CheatEventModal } from "./modals/CheatEventModal";
import { UpgradesModal } from "./modals/UpgradesModal";
import { AnimalsModal } from "./modals/AnimalsModal";
import { StarsModal } from "./modals/StarsModal";
import { CraftingModal } from "./modals/CraftingModal";
import { StatsModal } from "./modals/StatsModal";
import { OfflineEarningsModal } from "./modals/OfflineEarningsModal";
import { AchievementsModal } from "./modals/AchievementsModal";
import { MusicSettingsModal } from "./modals/MusicSettingsModal";
import { CloudSyncModal } from "./modals/CloudSyncModal";
import { SyncConflictDialog } from "./modals/SyncConflictDialog";
import { MissionsModal } from "./modals/MissionsModal";
import { OpeningResultModal } from "./modals/OpeningResultModal";
import { InventoryModal } from "./modals/InventoryModal";
import { ZodiacModal } from "./modals/ZodiacModal";
import { LeaderboardModal } from "./modals/LeaderboardModal";
import { PrestigeModal } from "./modals/PrestigeModal";

import { INITIAL_ANIMALS, calculateCost } from "../data";

interface GameModalsContainerProps {
  // Modal visibility flags
  showResetDialog: boolean;
  setShowResetDialog: (show: boolean) => void;
  showCheatEventModal: boolean;
  setShowCheatEventModal: (show: boolean) => void;
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
  showConflictDialog: boolean;
  setShowConflictDialog: (show: boolean) => void;
  showMissionsModal: boolean;
  setShowMissionsModal: (show: boolean) => void;
  openingResult: any;
  setOpeningResult: (res: any) => void;
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
  handleInvestConstellation: (constellationId: string, starsCost: number, moonsCost: number) => void;
  handleCraftItem: (recipeId: string, count?: number) => void;
  handleClaimOfflineEarnings: (earnedLife: number) => void;
  handleClaimMissionReward: (missionId: string, starsReward: number) => void;
  handleOpenShootingStar: (cosmetic: any, alreadyUnlocked: boolean, refundAmt: number) => void;
  handleApplyCosmetic: (id: string, type: "star_color" | "planet_accessory" | "frame_style" | "moon_skin") => void;
  handleUnlockCosmeticDirect: (cosmeticId: string, cost: number) => void;
  handleUpgradeCosmeticRarity: (cosmeticId: string, targetRarity: string, cost: number) => void;
  handleUseCraftedItem: (itemId: string, count?: number) => void;
  handleSelectZodiac: (zodiacId: string) => void;
  handleConfirmPrestige: () => void;

  // State variables
  life: number;
  glitterDust: number;
  totalLps: number;
  purchasedUpgrades: string[];
  staticUpgrades: any;
  totalAnimalsLps: number;
  purchasedAnimals: Record<string, number>;
  starsCount: number;
  starPowerPerStar: number;
  starClicksTriggered: number;
  starCost: number;
  totalStarsLps: number;
  moonsCount: number;
  prestigeCount: number;
  maxMoons: number;
  constellations: Record<string, number>;
  isNightStyle: boolean;
  shootingStarsCount: number;
  craftedItems: Record<string, number>;
  totalLifeEarned: number;
  clicksCount: number;
  secondsPlayed: number;
  planetLevel: number;
  planetExp: number;
  formatCompactNumber: (num: number) => string;
  formatTimePlayed: (sec: number) => string;
  offlineSeconds: number;
  offlineLpsRate: number;
  offlineEarnedLife: number;
  achievements: any[];
  unlockedAchievementsCount: number;
  achievementCategoryFilter: string;
  setAchievementCategoryFilter: (filter: string) => void;
  achievementSearch: string;
  setAchievementSearch: (search: string) => void;
  playUpgrade: () => void;
  musicStyleState: any;
  setMusicStyleState: any;
  isLowMemory: boolean;
  setIsLowMemory: any;
  user: any;
  authLoading: boolean;
  syncing: boolean;
  lastSynced: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveStateToCloud: (state: any) => Promise<void>;
  cloudSaveFound: any;
  triggerCloudStateLoad: (data: any) => void;
  forceLocalOverwriteCloud: () => void;
  totalAnimalsCount: number;
  missionSetNumber: number;
  claimedMissionIds: string[];
  missionsCooldownEnd: number | null;
  activeFrame: string;
  unlockedCosmetics: string[];
  activeStarColor: string;
  activeAccessory: string;
  activeMoonSkin: string;
  activeZodiacId: string;
  cosmeticRarityLevels: Record<string, string>;
  upgradesSpecs: any;
}

export const GameModalsContainer: React.FC<GameModalsContainerProps> = React.memo(({
  showResetDialog,
  setShowResetDialog,
  showCheatEventModal,
  setShowCheatEventModal,
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
  showConflictDialog,
  setShowConflictDialog,
  showMissionsModal,
  setShowMissionsModal,
  openingResult,
  setOpeningResult,
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
  handleClaimOfflineEarnings,
  handleClaimMissionReward,
  handleOpenShootingStar,
  handleApplyCosmetic,
  handleUnlockCosmeticDirect,
  handleUpgradeCosmeticRarity,
  handleUseCraftedItem,
  handleSelectZodiac,
  handleConfirmPrestige,

  life,
  glitterDust,
  totalLps,
  purchasedUpgrades,
  staticUpgrades,
  totalAnimalsLps,
  purchasedAnimals,
  starsCount,
  starPowerPerStar,
  starClicksTriggered,
  starCost,
  totalStarsLps,
  moonsCount,
  prestigeCount,
  maxMoons,
  constellations,
  isNightStyle,
  shootingStarsCount,
  craftedItems,
  totalLifeEarned,
  clicksCount,
  secondsPlayed,
  planetLevel,
  planetExp,
  formatCompactNumber,
  formatTimePlayed,
  offlineSeconds,
  offlineLpsRate,
  offlineEarnedLife,
  achievements,
  unlockedAchievementsCount,
  achievementCategoryFilter,
  setAchievementCategoryFilter,
  achievementSearch,
  setAchievementSearch,
  playUpgrade,
  musicStyleState,
  setMusicStyleState,
  isLowMemory,
  setIsLowMemory,
  user,
  authLoading,
  syncing,
  lastSynced,
  loginWithGoogle,
  logout,
  saveStateToCloud,
  cloudSaveFound,
  triggerCloudStateLoad,
  forceLocalOverwriteCloud,
  totalAnimalsCount,
  missionSetNumber,
  claimedMissionIds,
  missionsCooldownEnd,
  activeFrame,
  unlockedCosmetics,
  activeStarColor,
  activeAccessory,
  activeMoonSkin,
  activeZodiacId,
  cosmeticRarityLevels,
  upgradesSpecs,
}) => {
  return (
    <>
      {showResetDialog && (
        <ResetDialog
          isOpen={showResetDialog}
          onConfirm={handleGameReset}
          onCancel={() => setShowResetDialog(false)}
        />
      )}

      {showCheatEventModal && (
        <CheatEventModal
          isOpen={showCheatEventModal}
          onSelectEvent={(event) => {
            workerRef.current?.postMessage({
              type: "FORCE_TRIGGER_EVENT",
              event,
            });
          }}
          onClose={() => setShowCheatEventModal(false)}
        />
      )}

      {showUpgradesModal && (
        <UpgradesModal
          isOpen={showUpgradesModal}
          onClose={() => setShowUpgradesModal(false)}
          life={life}
          glitterDust={glitterDust}
          totalLps={totalLps}
          purchasedUpgrades={purchasedUpgrades}
          staticUpgrades={staticUpgrades}
          onBuyUpgrade={handleBuyUpgrade}
          onBuyUpgradesBatch={handleBuyUpgradesBatch}
          formatCompactNumber={formatCompactNumber}
        />
      )}

      {showAnimalsModal && (
        <AnimalsModal
          isOpen={showAnimalsModal}
          onClose={() => setShowAnimalsModal(false)}
          life={life}
          totalAnimalsLps={totalAnimalsLps}
          purchasedAnimals={purchasedAnimals}
          animalDefs={INITIAL_ANIMALS}
          onBuyAnimal={handleBuyAnimal}
          calculateCost={calculateCost}
          formatCompactNumber={formatCompactNumber}
          upgradesSpecs={upgradesSpecs}
        />
      )}

      {showStarsModal && (
        <StarsModal
          isOpen={showStarsModal}
          onClose={() => setShowStarsModal(false)}
          life={life}
          starsCount={starsCount}
          starPowerPerStar={starPowerPerStar}
          starClicksTriggered={starClicksTriggered}
          onBuyStar={handleBuyStar}
          starCost={starCost}
          totalStarsLps={totalStarsLps}
          formatCompactNumber={formatCompactNumber}
          moonsCount={moonsCount}
          onMergeMoons={handleMergeMoons}
          prestigeCount={prestigeCount}
          maxMoons={maxMoons}
          constellations={constellations}
          onInvestConstellation={handleInvestConstellation}
        />
      )}

      {showCraftingModal && (
        <CraftingModal
          isOpen={showCraftingModal}
          onClose={() => setShowCraftingModal(false)}
          isNight={isNightStyle}
          life={life}
          starsCount={starsCount}
          moonsCount={moonsCount}
          glitterDust={glitterDust}
          shootingStarsCount={shootingStarsCount}
          craftedItems={craftedItems}
          onCraftItem={handleCraftItem}
          formatCompactNumber={formatCompactNumber}
        />
      )}

      {showStatsModal && (
        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          totalLifeEarned={totalLifeEarned}
          clicksCount={clicksCount}
          totalStarsLps={totalStarsLps}
          secondsPlayed={secondsPlayed}
          purchasedAnimals={purchasedAnimals}
          starsCount={starsCount}
          planetLevel={planetLevel}
          totalLps={totalLps}
          prestigeCount={prestigeCount}
          formatCompactNumber={formatCompactNumber}
          formatTimePlayed={formatTimePlayed}
        />
      )}

      {showOfflineModal && (
        <OfflineEarningsModal
          isOpen={showOfflineModal}
          onClose={() => setShowOfflineModal(false)}
          secondsAway={offlineSeconds}
          offlineLps={offlineLpsRate}
          earnedLife={offlineEarnedLife}
          prestigeCount={prestigeCount}
          onClaim={handleClaimOfflineEarnings}
          formatCompactNumber={formatCompactNumber}
          isNight={isNightStyle}
        />
      )}

      {showAchievementsModal && (
        <AchievementsModal
          isOpen={showAchievementsModal}
          onClose={() => setShowAchievementsModal(false)}
          isNight={isNightStyle}
          achievements={achievements}
          unlockedAchievementsCount={unlockedAchievementsCount}
          achievementCategoryFilter={achievementCategoryFilter}
          setAchievementCategoryFilter={setAchievementCategoryFilter}
          achievementSearch={achievementSearch}
          setAchievementSearch={setAchievementSearch}
          life={life}
          formatCompactNumber={formatCompactNumber}
          playUpgrade={playUpgrade}
        />
      )}

      {showMusicSettingsModal && (
        <MusicSettingsModal
          isOpen={showMusicSettingsModal}
          onClose={() => setShowMusicSettingsModal(false)}
          isNight={isNightStyle}
          musicStyleState={musicStyleState}
          setMusicStyleState={setMusicStyleState}
          isLowMemory={isLowMemory}
          setIsLowMemory={setIsLowMemory}
        />
      )}

      {showCloudSyncModal && (
        <CloudSyncModal
          isOpen={showCloudSyncModal}
          onClose={() => setShowCloudSyncModal(false)}
          user={user}
          authLoading={authLoading}
          syncing={syncing}
          lastSynced={lastSynced}
          onLogin={loginWithGoogle}
          onLogout={logout}
          onForceSave={() => {
            saveStateToCloud({
              life,
              totalLifeEarned,
              starsCount,
              purchasedAnimals,
              purchasedUpgrades,
              planetLevel,
              planetExp,
              clicksCount,
              starClicksTriggered,
              secondsPlayed,
              unlockedCosmetics,
              activeStarColor,
              activeAccessory,
              activeFrame,
              activeMoonSkin,
              shootingStarsCount,
              missionSetNumber,
              claimedMissionIds,
              missionsCooldownEnd,
              prestigeCount,
              moonsCount,
              constellations,
            });
          }}
          onForceLoad={() => {
            if (cloudSaveFound) {
              triggerCloudStateLoad(cloudSaveFound);
            }
          }}
          localStats={{
            life,
            totalLifeEarned,
            planetLevel,
            secondsPlayed,
            prestigeCount,
            moonsCount,
            purchasedUpgrades,
          }}
          cloudStats={cloudSaveFound}
        />
      )}

      {showConflictDialog && (
        <SyncConflictDialog
          isOpen={showConflictDialog}
          cloudData={cloudSaveFound}
          localData={{
            life,
            planetLevel,
            secondsPlayed,
            prestigeCount,
            moonsCount,
            purchasedUpgrades,
          }}
          onKeepLocal={() => {
            forceLocalOverwriteCloud();
            setShowConflictDialog(false);
          }}
          onKeepCloud={() => {
            if (cloudSaveFound) {
              triggerCloudStateLoad(cloudSaveFound);
            }
            setShowConflictDialog(false);
          }}
        />
      )}

      {showMissionsModal && (
        <MissionsModal
          isOpen={showMissionsModal}
          onClose={() => setShowMissionsModal(false)}
          isNight={isNightStyle}
          clicksCount={clicksCount}
          totalAnimalsCount={totalAnimalsCount}
          starsCount={starsCount}
          missionSetNumber={missionSetNumber}
          claimedMissionIds={claimedMissionIds}
          missionsCooldownEnd={missionsCooldownEnd}
          onClaimReward={handleClaimMissionReward}
          activeFrame={activeFrame}
          unlockedCosmetics={unlockedCosmetics}
          purchasedUpgrades={purchasedUpgrades}
        />
      )}

      {openingResult !== null && (
        <OpeningResultModal
          isOpen={openingResult !== null}
          onClose={() => setOpeningResult(null)}
          isNight={isNightStyle}
          result={openingResult}
        />
      )}

      {showInventoryModal && (
        <InventoryModal
          isOpen={showInventoryModal}
          onClose={() => setShowInventoryModal(false)}
          isNight={isNightStyle}
          zodiac={activeZodiacId}
          shootingStarsCount={shootingStarsCount}
          unlockedCosmetics={unlockedCosmetics}
          activeStarColor={activeStarColor}
          activeAccessory={activeAccessory}
          activeFrame={activeFrame}
          activeMoonSkin={activeMoonSkin}
          onOpenShootingStar={handleOpenShootingStar}
          onApplyCosmetic={handleApplyCosmetic}
          glitterDust={glitterDust}
          purchasedUpgrades={purchasedUpgrades}
          cosmeticRarityLevels={cosmeticRarityLevels}
          onUnlockCosmeticDirect={handleUnlockCosmeticDirect}
          onUpgradeCosmeticRarity={handleUpgradeCosmeticRarity}
          craftedItems={craftedItems}
          onUseCraftedItem={handleUseCraftedItem}
          onSelectZodiac={handleSelectZodiac}
        />
      )}

      {showZodiacModal && (
        <ZodiacModal
          isOpen={showZodiacModal}
          onClose={() => setShowZodiacModal(false)}
          isNight={isNightStyle}
          activeZodiacId={activeZodiacId || "katze"}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
          currentUserId={user?.uid}
          formatCompactNumber={formatCompactNumber}
        />
      )}

      {showPrestigeModal && (
        <PrestigeModal
          isOpen={showPrestigeModal}
          onClose={() => setShowPrestigeModal(false)}
          isNight={isNightStyle}
          life={life}
          prestigeCount={prestigeCount}
          onPrestigeConfirm={handleConfirmPrestige}
          formatCompactNumber={formatCompactNumber}
        />
      )}
    </>
  );
});

GameModalsContainer.displayName = "GameModalsContainer";
