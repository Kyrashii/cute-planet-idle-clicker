import React, { useState } from "react";
import { motion } from "motion/react";
import { Modal } from "../ui/Modal";
import { DeferredModalContent } from "../ui/DeferredModalContent";
import { Tabs } from "../ui/Tabs";
import { LootboxWaveReveal } from "./LootboxWaveReveal";
import type { LootboxesOpenedEvent } from "../../game/protocol";
import { Sparkles, Check, Lock } from "lucide-react";
import { COSMETIC_ITEMS, RARITY_STYLES } from "../../data/cosmetics";
import { CRAFTING_RECIPES } from "../../data/recipes";
import { useGameState } from "../../contexts/GameStateContext";
import { ROGUELITE_PLANET_SKINS } from "../../roguelite/data";

// Forest-green tint for the selected star-colour card (cosmetic, off-palette).
const STAR_CARD_SELECTED = "bg-[#18392c]/50 border-green-400 shadow-md scale-102";

function handleCardKeyDown(event: React.KeyboardEvent<HTMLElement>, onActivate: () => void) {
  if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) {
    return;
  }

  event.preventDefault();
  onActivate();
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNight: boolean;
  unlockedCosmetics: string[];
  activeStarColor: string;
  activeAccessory: string;
  activeFrame: string;
  activeMoonSkin: string;
  activePlanetSkin: string;
  unlockedPlanetSkins: string[];
  onOpenLootboxes: (count: number) => void;
  lootboxResult: LootboxesOpenedEvent | null;
  onClearLootboxResult: () => void;
  onApplyCosmetic: (
    id: string,
    type: "star_color" | "planet_accessory" | "frame_style" | "moon_skin",
  ) => void;
  onApplyPlanetSkin: (skinId: string) => void;

  // Glitter Dust props
  purchasedUpgrades: string[];
  cosmeticRarityLevels: Record<string, string>;
  onUnlockCosmeticDirect: (cosmeticId: string, cost: number) => void;
  onUpgradeCosmeticRarity: (cosmeticId: string, nextRarity: string, cost: number) => void;

  // Crafted items
  craftedItems?: Record<string, number>;
  onUseCraftedItem?: (itemId: string, count: number) => void;
  zodiac?: string;
  onSelectZodiac?: (zodiacId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = React.memo(
  ({
    isOpen,
    onClose,
    isNight,
    unlockedCosmetics,
    activeStarColor,
    activeAccessory,
    activeFrame,
    activeMoonSkin,
    activePlanetSkin,
    unlockedPlanetSkins,
    onOpenLootboxes,
    lootboxResult,
    onClearLootboxResult,
    onApplyCosmetic,
    onApplyPlanetSkin,
    purchasedUpgrades,
    cosmeticRarityLevels,
    onUnlockCosmeticDirect,
    onUpgradeCosmeticRarity,
    craftedItems = {},
    onUseCraftedItem,
    zodiac,
  }) => {
    const { glitterDust, shootingStarsCount } = useGameState();
    const [activeTab, setActiveTab] = useState<string>("star_color");
    // True from the OPEN_LOOTBOXES send until the reveal overlay is dismissed.
    const [rolling, setRolling] = useState(false);

    const getDirectPurchaseCost = (rarity: string) => {
      let cost = 15;
      switch (rarity) {
        case "legendary":
          cost = 300;
          break;
        case "epic":
          cost = 100;
          break;
        case "rare":
          cost = 40;
          break;
        default:
          cost = 15;
      }
      if (zodiac === "einhorn") {
        cost = Math.ceil(cost * 0.8);
      }
      return cost;
    };

    const getRarityUpgradeDetails = (currentRarity: string) => {
      let details = { nextRarity: "rare", cost: 20, name: "Selten" };
      switch (currentRarity) {
        case "common":
          details = { nextRarity: "rare", cost: 20, name: "Selten" };
          break;
        case "rare":
          details = { nextRarity: "epic", cost: 50, name: "Episch" };
          break;
        case "epic":
          details = { nextRarity: "legendary", cost: 120, name: "Legendaer" };
          break;
        default:
          return null;
      }
      if (zodiac === "einhorn") {
        details.cost = Math.ceil(details.cost * 0.8);
      }
      return details;
    };

    // Rolls are authoritative in the worker; this only kicks off the request
    // and shows the gacha overlay until the LOOTBOXES_OPENED result is closed.
    const handleOpenBoxes = (count: number) => {
      if (shootingStarsCount <= 0 || rolling || lootboxResult) return;
      setRolling(true);
      onOpenLootboxes(count);
    };

    const handleCloseReveal = () => {
      setRolling(false);
      onClearLootboxResult();
    };

    // Tabs translation helpers
    const tabs: { id: string; label: string }[] = [
      { id: "star_color", label: "🪄 Click-Sterne" },
      { id: "planet_accessory", label: "👒 Planet-Huete" },
      { id: "frame_style", label: "🖼️ Fensterrahmen" },
      { id: "moon_skin", label: "🌙 Mond-Skins" },
      { id: "planet_skin", label: "🪐 Planeten-Skins" },
      { id: "crafted", label: "🔮 Kreationen" },
    ];

    const currentItems =
      activeTab === "crafted" || activeTab === "planet_skin"
        ? []
        : COSMETIC_ITEMS.filter((i) => i.type === activeTab);
    const sortedItems = [...currentItems].sort((a, b) => {
      const aUnlocked = unlockedCosmetics.includes(a.id);
      const bUnlocked = unlockedCosmetics.includes(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });

    return (
      <Modal
        presentation="auto"
        isOpen={isOpen}
        onClose={onClose}
        panelClassName={`flex flex-col max-w-2xl w-full max-h-[85vh] shadow-2xl rounded-[1.75rem] overflow-hidden border-3 transition-colors duration-500 text-cosmic-text relative ${
          isNight
            ? "bg-cosmic-bg-mid/95 border-cosmic-accent"
            : "bg-amber-50/95 border-amber-400 text-slate-800"
        }`}
      >
        {/* GACHA WAVE-REVEAL OVERLAY */}
        {(rolling || lootboxResult !== null) && (
          <LootboxWaveReveal result={lootboxResult} onClose={handleCloseReveal} />
        )}

        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b-3 flex items-center justify-between shrink-0 transition-colors duration-500 ${
            isNight
              ? "border-cosmic-accent/40 bg-cosmic-bg-deep"
              : "border-amber-300 bg-amber-100 text-cosmic-gold-ink"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 text-2xl sm:text-3xl select-none animate-pulse">🎒</span>
            <div className="min-w-0">
              <span
                className={`text-[9px] uppercase font-black tracking-wider block truncate ${isNight ? "text-purple-300" : "text-amber-700"}`}
              >
                Kosmetikkammer & Lootboxen
              </span>
              <h4 className="font-sans font-black text-sm uppercase tracking-wide truncate">
                Sterneninventar
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`size-8 shrink-0 rounded-full flex items-center justify-center font-bold text-lg hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer ${
              isNight
                ? "bg-cosmic-bg-mid border-2 border-cosmic-accent text-purple-200 hover:bg-cosmic-surface-hover"
                : "bg-white border-2 border-amber-450 text-amber-900 hover:bg-amber-100"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content Box — body defers one animation frame so the modal shell
            animates in on a light tree (see DeferredModalContent). */}
        <div className="p-4 sm:p-6 overflow-y-auto grow flex flex-col gap-5">
          <DeferredModalContent
            placeholder={<div className="h-40 rounded-3xl animate-pulse bg-cosmic-accent/10" />}
          >
            {/* LOOTBOX OPENER CARD */}
            <div
              className={`p-4 rounded-3xl border-2 flex flex-col md:flex-row items-center justify-between gap-5 transition-all ${
                isNight
                  ? "bg-linear-to-br from-cosmic-surface-mid to-cosmic-surface-hover border-cosmic-accent/30"
                  : "bg-linear-to-br from-amber-100 to-orange-100/50 border-amber-300"
              }`}
            >
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-2xl select-none">☄️</span>
                  <h5 className="font-sans font-extrabold text-sm uppercase tracking-wider text-amber-400">
                    Sternschnuppen-Lootbox
                  </h5>
                </div>
                <p
                  className={`text-[11px] font-bold ${isNight ? "text-purple-200" : "text-amber-900"}`}
                >
                  Du hast aktuell:{" "}
                  <strong className="text-sm bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400 text-amber-300 ml-1">
                    🌠 {shootingStarsCount} x
                  </strong>
                </p>
                <p
                  className={`text-[10px] font-bold opacity-75 max-w-sm ${isNight ? "text-slate-400" : "text-slate-600"}`}
                >
                  Oeffne eine Sternschnuppe, um Farben fuer deine Autoclicker-Sterne, Huete fuer den
                  Planeten oder edle Fensterrahmen freizuschalten!
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto">
                {shootingStarsCount <= 0 ? (
                  <div
                    className={`px-4 py-2.5 rounded-2xl border text-center font-sans font-black text-xs uppercase cursor-not-allowed select-none ${
                      isNight
                        ? "bg-cosmic-bg/55 border-cosmic-accent/10 text-purple-300/40"
                        : "bg-gray-200/55 border-gray-400/20 text-gray-500"
                    }`}
                  >
                    Keine Sternschnuppen
                  </div>
                ) : !rolling && lootboxResult === null ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenBoxes(1)}
                      className="w-full md:w-auto justify-center px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-450 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-sans font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2 border-2 border-yellow-300"
                    >
                      <Sparkles className="size-4  text-yellow-105 animate-spin" />
                      Oeffnen!
                    </motion.button>
                    {shootingStarsCount > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenBoxes(shootingStarsCount)}
                        title={`Oeffnet alle ${shootingStarsCount} Sternschnuppen auf einmal`}
                        className="w-full md:w-auto justify-center px-6 py-2.5 rounded-2xl bg-linear-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-sans font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2 border-2 border-fuchsia-300"
                      >
                        <span className="select-none">🌠</span>
                        Alle oeffnen ({shootingStarsCount}x)
                      </motion.button>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* GLITTER DUST DASHBOARD & SPECIAL SYSTEMS */}
            <div
              className={`p-4 rounded-3xl border-2 grid grid-cols-3 gap-2.5 sm:gap-3.5 ${
                isNight
                  ? "bg-cosmic-bg/60 border-purple-500/20 text-purple-200"
                  : "bg-amber-50 border-amber-300 text-amber-900"
              }`}
            >
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/25 text-center">
                <span className="text-xl">✨</span>
                <span className="text-[9px] uppercase font-bold text-cosmic-accent tracking-widest mt-1">
                  Glitzerstaub-Konto
                </span>
                <h5 className="text-lg font-black text-white mt-1">
                  {glitterDust ? glitterDust.toLocaleString() : "0"} ✨
                </h5>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/25 text-center">
                <span className="text-xl">🧲</span>
                <span className="text-[9px] uppercase font-bold text-cosmic-accent tracking-widest mt-1">
                  Lootbox-Magnet
                </span>
                <h5 className="text-xs font-black text-white mt-1">
                  {purchasedUpgrades.includes("upg-glitter-gacha")
                    ? "⚡ Boosted (+50% Leg.)"
                    : "Standard (6% Leg.)"}
                </h5>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/25 text-center">
                <span className="text-xl">🧩</span>
                <span className="text-[9px] uppercase font-bold text-cosmic-accent tracking-widest mt-1">
                  Set-Boni
                </span>
                <h5 className="text-[11px] font-black text-white mt-1 leading-tight">
                  {!purchasedUpgrades.includes("upg-glitter-set") ? (
                    <span className="opacity-50">Nicht erforscht</span>
                  ) : (
                    <span className="text-emerald-400">
                      {[
                        ["star_pink", "acc_flower_crown", "moon_sakura"].every((id) =>
                          unlockedCosmetics.includes(id),
                        )
                          ? "🌸"
                          : "",
                        ["star_cyber", "acc_space_glasses", "moon_cyber"].every((id) =>
                          unlockedCosmetics.includes(id),
                        )
                          ? "⚡"
                          : "",
                        ["star_gold", "acc_star_crown", "moon_gold"].every((id) =>
                          unlockedCosmetics.includes(id),
                        )
                          ? "👑"
                          : "",
                        ["star_ghostly", "frame_ghost", "moon_ghost"].every((id) =>
                          unlockedCosmetics.includes(id),
                        )
                          ? "👻"
                          : "",
                        [
                          "star_butterfly",
                          "acc_butterfly_wings",
                          "frame_butterfly",
                          "moon_butterfly",
                        ].every((id) => unlockedCosmetics.includes(id))
                          ? "🦋"
                          : "",
                      ].filter(Boolean).length > 0
                        ? "Aktiv: " +
                          [
                            ["star_pink", "acc_flower_crown", "moon_sakura"].every((id) =>
                              unlockedCosmetics.includes(id),
                            )
                              ? "Sakura"
                              : "",
                            ["star_cyber", "acc_space_glasses", "moon_cyber"].every((id) =>
                              unlockedCosmetics.includes(id),
                            )
                              ? "Cyber"
                              : "",
                            ["star_gold", "acc_star_crown", "moon_gold"].every((id) =>
                              unlockedCosmetics.includes(id),
                            )
                              ? "Gold"
                              : "",
                            ["star_ghostly", "frame_ghost", "moon_ghost"].every((id) =>
                              unlockedCosmetics.includes(id),
                            )
                              ? "Spuk"
                              : "",
                            [
                              "star_butterfly",
                              "acc_butterfly_wings",
                              "frame_butterfly",
                              "moon_butterfly",
                            ].every((id) => unlockedCosmetics.includes(id))
                              ? "Schmetterling"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : "Keine Sets voll"}
                    </span>
                  )}
                </h5>
              </div>
            </div>

            {/* CHERISHED COSMETIC SETS LIST */}
            {purchasedUpgrades.includes("upg-glitter-set") && (
              <div
                className={`p-4 rounded-3xl border-2 flex flex-col gap-3 ${
                  isNight
                    ? "bg-cosmic-bg-mid/70 border-purple-500/20 text-purple-200"
                    : "bg-orange-50/70 border-amber-300 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2 border-b border-purple-500/10 pb-2">
                  <span className="text-base">🧩</span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${isNight ? "text-purple-200" : "text-amber-900"}`}
                  >
                    Sammel-Sets &amp; Aktive Vorteile
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/20 ml-auto font-bold animate-pulse">
                    System Aktiv
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* SAKURA SET */}
                  {(() => {
                    const items = [
                      { id: "star_pink", name: "Rosa Stern 🌸" },
                      { id: "acc_flower_crown", name: "Blumenkranz 🌸" },
                      { id: "moon_sakura", name: "Sakura-Mond 🌸" },
                    ];
                    const unlockedCount = items.filter((it) =>
                      unlockedCosmetics.includes(it.id),
                    ).length;
                    const complete = unlockedCount === 3;
                    return (
                      <div
                        className={`p-2.5 rounded-2xl border transition-all ${
                          complete
                            ? "bg-pink-500/10 border-pink-500/40"
                            : isNight
                              ? "bg-black/20 border-purple-950/40 opacity-75"
                              : "bg-white/50 border-gray-200 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                            🌸 Sakura-Set{" "}
                            <span className="text-[10px] opacity-75 font-medium">
                              ({unlockedCount}/3)
                            </span>
                          </span>
                          {complete && (
                            <span className="text-[8.5px] uppercase font-black bg-pink-500/25 text-pink-300 px-1.5 py-0.2 rounded border border-pink-400/30">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 leading-tight">
                          Teile:{" "}
                          {items.map((it, i) => (
                            <span
                              key={it.id}
                              className={
                                unlockedCosmetics.includes(it.id) ? "text-pink-300" : "opacity-40"
                              }
                            >
                              {it.name}
                              {i < 2 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                        <p className="text-[10px] text-pink-200/90 font-mono mt-1.5 bg-pink-950/25 p-1.5 rounded-lg border border-pink-500/10">
                          🎁 Vorteil:{" "}
                          <strong className="text-pink-300 font-extrabold">
                            +20% Missions-Ertrag
                          </strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* CYBER SET */}
                  {(() => {
                    const items = [
                      { id: "star_cyber", name: "Cyber-Stern ⚡" },
                      { id: "acc_space_glasses", name: "Cyber-Brille 🕶️" },
                      { id: "moon_cyber", name: "Matrix-Mond 💾" },
                    ];
                    const unlockedCount = items.filter((it) =>
                      unlockedCosmetics.includes(it.id),
                    ).length;
                    const complete = unlockedCount === 3;
                    return (
                      <div
                        className={`p-2.5 rounded-2xl border transition-all ${
                          complete
                            ? "bg-cyan-500/10 border-cyan-500/40"
                            : isNight
                              ? "bg-black/20 border-purple-950/40 opacity-75"
                              : "bg-white/50 border-gray-200 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                            ⚡ Cyber-Set{" "}
                            <span className="text-[10px] opacity-75 font-medium">
                              ({unlockedCount}/3)
                            </span>
                          </span>
                          {complete && (
                            <span className="text-[8.5px] uppercase font-black bg-cyan-500/25 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-400/30">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 leading-tight">
                          Teile:{" "}
                          {items.map((it, i) => (
                            <span
                              key={it.id}
                              className={
                                unlockedCosmetics.includes(it.id) ? "text-cyan-300" : "opacity-40"
                              }
                            >
                              {it.name}
                              {i < 2 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                        <p className="text-[10px] text-cyan-200/90 font-mono mt-1.5 bg-cyan-950/25 p-1.5 rounded-lg border border-cyan-500/10">
                          🎁 Vorteil:{" "}
                          <strong className="text-cyan-300 font-extrabold">
                            +15% Sterne-Ertrag
                          </strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* GOLD SET */}
                  {(() => {
                    const items = [
                      { id: "star_gold", name: "Goldene Pracht 👑" },
                      { id: "acc_star_crown", name: "Kroenchen ♛" },
                      { id: "moon_gold", name: "Gold-Mond 👑" },
                    ];
                    const unlockedCount = items.filter((it) =>
                      unlockedCosmetics.includes(it.id),
                    ).length;
                    const complete = unlockedCount === 3;
                    return (
                      <div
                        className={`p-2.5 rounded-2xl border transition-all ${
                          complete
                            ? "bg-amber-500/10 border-amber-500/40"
                            : isNight
                              ? "bg-black/20 border-purple-950/40 opacity-75"
                              : "bg-white/50 border-gray-200 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                            👑 Gold-Set{" "}
                            <span className="text-[10px] opacity-75 font-medium">
                              ({unlockedCount}/3)
                            </span>
                          </span>
                          {complete && (
                            <span className="text-[8.5px] uppercase font-black bg-amber-500/25 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 leading-tight">
                          Teile:{" "}
                          {items.map((it, i) => (
                            <span
                              key={it.id}
                              className={
                                unlockedCosmetics.includes(it.id) ? "text-amber-300" : "opacity-40"
                              }
                            >
                              {it.name}
                              {i < 2 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                        <p className="text-[10px] text-amber-200/90 font-mono mt-1.5 bg-amber-950/25 p-1.5 rounded-lg border border-amber-500/30">
                          🎁 Vorteil:{" "}
                          <strong className="text-amber-300 font-extrabold">
                            +5% Alles (Generierung)
                          </strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* GHOST / SPUK SET */}
                  {(() => {
                    const items = [
                      { id: "star_ghostly", name: "Spektralgeist 👻" },
                      { id: "frame_ghost", name: "Geister-Rahmen 👻" },
                      { id: "moon_ghost", name: "Geister-Mond 👻" },
                    ];
                    const unlockedCount = items.filter((it) =>
                      unlockedCosmetics.includes(it.id),
                    ).length;
                    const complete = unlockedCount === 3;
                    return (
                      <div
                        className={`p-2.5 rounded-2xl border transition-all ${
                          complete
                            ? "bg-purple-500/10 border-purple-500/40"
                            : isNight
                              ? "bg-black/20 border-purple-950/40 opacity-75"
                              : "bg-white/50 border-gray-200 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                            👻 Spuk-Set{" "}
                            <span className="text-[10px] opacity-75 font-medium">
                              ({unlockedCount}/3)
                            </span>
                          </span>
                          {complete && (
                            <span className="text-[8.5px] uppercase font-black bg-purple-500/25 text-purple-300 px-1.5 py-0.2 rounded border border-purple-400/30">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 leading-tight">
                          Teile:{" "}
                          {items.map((it, i) => (
                            <span
                              key={it.id}
                              className={
                                unlockedCosmetics.includes(it.id) ? "text-purple-300" : "opacity-40"
                              }
                            >
                              {it.name}
                              {i < 2 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                        <p className="text-[10px] text-purple-200/90 font-mono mt-1.5 bg-purple-950/25 p-1.5 rounded-lg border border-purple-500/10">
                          🎁 Vorteil:{" "}
                          <strong className="text-purple-300 font-extrabold">
                            Staerkerer Nacht-Ertrag
                          </strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* BUTTERFLY / SCHMETTERLING SET */}
                  {(() => {
                    const items = [
                      { id: "star_butterfly", name: "Hauch 🦋" },
                      { id: "acc_butterfly_wings", name: "Fluegel 🦋" },
                      { id: "frame_butterfly", name: "Garten 🦋" },
                      { id: "moon_butterfly", name: "Traum 🦋" },
                    ];
                    const unlockedCount = items.filter((it) =>
                      unlockedCosmetics.includes(it.id),
                    ).length;
                    const complete = unlockedCount === 4;
                    return (
                      <div
                        className={`p-2.5 rounded-2xl border transition-all md:col-span-2 ${
                          complete
                            ? "bg-pink-500/10 border-pink-500/40"
                            : isNight
                              ? "bg-black/20 border-purple-950/40 opacity-75"
                              : "bg-white/50 border-gray-200 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                            🦋 Schmetterlings-Set{" "}
                            <span className="text-[10px] opacity-75 font-medium">
                              ({unlockedCount}/4)
                            </span>
                          </span>
                          {complete && (
                            <span className="text-[8.5px] uppercase font-black bg-pink-500/25 text-pink-300 px-1.5 py-0.2 rounded border border-pink-400/30">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 leading-tight">
                          Teile:{" "}
                          {items.map((it, i) => (
                            <span
                              key={it.id}
                              className={
                                unlockedCosmetics.includes(it.id) ? "text-pink-300" : "opacity-40"
                              }
                            >
                              {it.name}
                              {i < 3 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                        <p className="text-[10px] text-pink-200/90 font-mono mt-1.5 bg-pink-950/25 p-1.5 rounded-lg border border-pink-500/10">
                          🎁 Vorteil:{" "}
                          <strong className="text-pink-300 font-extrabold">
                            +15% passives Gesamteinkommen
                          </strong>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB BAR — scrollable chips (no cramming on narrow screens) */}
            <Tabs
              items={tabs}
              value={activeTab}
              onChange={setActiveTab}
              variant={isNight ? "dark" : "warm"}
              className="no-scrollbar shrink-0"
              aria-label="Inventar-Kategorien"
            />

            {/* GRID OF COSMETICS OR CRAFTED ITEMS */}
            {activeTab === "crafted" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1">
                {CRAFTING_RECIPES.filter((r) => r.category === "consumables").map((recipe) => {
                  const item = recipe.result;
                  const qty = craftedItems?.[item.id] || 0;
                  const canActivate = qty > 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 border-2 rounded-[1.25rem] flex flex-col justify-between text-center relative overflow-hidden min-h-[145px] transition-all bg-cosmic-bg-mid/45 ${
                        qty > 0
                          ? isNight
                            ? "border-cosmic-accent/50 bg-cosmic-surface-mid/50"
                            : "border-amber-450 bg-amber-100/40 text-slate-800"
                          : "opacity-45 border-gray-650/10 cursor-not-allowed select-none"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl select-none filter drop-shadow-md mb-1.5">
                          {item.emoji}
                        </span>
                        <h6
                          className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                        >
                          {item.germanName}
                        </h6>
                        <p
                          className={`text-[10px] sm:text-[10.5px] text-cosmic-accent-muted mt-1 leading-normal max-w-xs ${!isNight && "text-slate-600"}`}
                        >
                          {item.germanDescription}
                        </p>
                      </div>

                      <div className="mt-3.5 space-y-2">
                        <div className="text-[10.5px] font-mono leading-none text-purple-300">
                          Besitz:{" "}
                          <strong className="text-white font-extrabold bg-cosmic-bg-mid/80 px-2 py-0.5 rounded-md border border-purple-400/20">
                            {qty}x
                          </strong>
                        </div>

                        {!canActivate ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl text-[10px] font-black uppercase bg-slate-800/80 border border-cosmic-accent-muted/10 text-slate-500 cursor-not-allowed select-none"
                          >
                            Keine Exemplare
                          </button>
                        ) : qty > 1 ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onUseCraftedItem?.(item.id, 1)}
                              className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase text-white transition-all bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-sm cursor-pointer active:scale-[0.98] border border-green-400"
                            >
                              1x Oeffnen
                            </button>
                            <button
                              onClick={() => onUseCraftedItem?.(item.id, qty)}
                              className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase text-white transition-all bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm cursor-pointer active:scale-[0.98] border border-teal-400"
                              title={`Oeffnet alle ${qty} Exemplare auf einmal`}
                            >
                              Alle ({qty}x)
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onUseCraftedItem?.(item.id, 1)}
                            className="w-full py-2 rounded-xl text-[10px] font-black uppercase text-white transition-all bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md cursor-pointer active:scale-[0.98] border border-green-450"
                          >
                            1x Oeffnen ✨
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 mt-1 sm:grid-cols-2 md:grid-cols-3 *:cv-auto">
                {/* Hardcoded Default items */}
                {activeTab === "star_color" && (
                  <button
                    type="button"
                    aria-pressed={activeStarColor === "default"}
                    onClick={() => onApplyCosmetic("default", "star_color")}
                    className={`p-3.5 rounded-[1.25rem] border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer ${
                      activeStarColor === "default"
                        ? STAR_CARD_SELECTED
                        : isNight
                          ? "bg-cosmic-bg-mid/45 border-cosmic-accent/20 hover:bg-cosmic-surface-mid/60"
                          : "bg-white border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <div className="text-3xl filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] select-none">
                      🎨
                    </div>
                    <div className="mt-2 text-center">
                      <h6
                        className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                      >
                        Standard-Gelb
                      </h6>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5 uppercase">
                        Kostenlos
                      </span>
                    </div>
                    <div className="mt-3.5 w-full">
                      {activeStarColor === "default" ? (
                        <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1">
                          <Check className="size-3.5  stroke-3" /> Aktiviert
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] uppercase font-bold ${isNight ? "text-purple-300" : "text-amber-800"}`}
                        >
                          Aktivieren
                        </span>
                      )}
                    </div>
                  </button>
                )}

                {activeTab === "planet_accessory" && (
                  <button
                    type="button"
                    aria-pressed={activeAccessory === "none"}
                    onClick={() => onApplyCosmetic("none", "planet_accessory")}
                    className={`p-3.5 rounded-[1.25rem] border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer ${
                      activeAccessory === "none"
                        ? STAR_CARD_SELECTED
                        : isNight
                          ? "bg-cosmic-bg-mid/45 border-cosmic-accent/20 hover:bg-cosmic-surface-mid/60"
                          : "bg-white border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <div className="text-3xl select-none">❌</div>
                    <div className="mt-2 text-center">
                      <h6
                        className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                      >
                        Kein Hut
                      </h6>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5 uppercase">
                        Nackt
                      </span>
                    </div>
                    <div className="mt-3.5 w-full">
                      {activeAccessory === "none" ? (
                        <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1">
                          <Check className="size-3.5  stroke-3" /> Aktiviert
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] uppercase font-bold ${isNight ? "text-purple-300" : "text-amber-805"}`}
                        >
                          Aktivieren
                        </span>
                      )}
                    </div>
                  </button>
                )}

                {activeTab === "frame_style" && (
                  <button
                    type="button"
                    aria-pressed={activeFrame === "default"}
                    onClick={() => onApplyCosmetic("default", "frame_style")}
                    className={`p-3.5 rounded-[1.25rem] border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer ${
                      activeFrame === "default"
                        ? STAR_CARD_SELECTED
                        : isNight
                          ? "bg-cosmic-bg-mid/45 border-cosmic-accent/20 hover:bg-cosmic-surface-mid/60"
                          : "bg-white border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <div className="text-3xl select-none">🖼️</div>
                    <div className="mt-2 text-center">
                      <h6
                        className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                      >
                        Standard-Rahmen
                      </h6>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5 uppercase">
                        Klassisch
                      </span>
                    </div>
                    <div className="mt-3.5 w-full">
                      {activeFrame === "default" ? (
                        <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1">
                          <Check className="size-3.5  stroke-3" /> Aktiviert
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] uppercase font-bold ${isNight ? "text-purple-300" : "text-amber-808"}`}
                        >
                          Aktivieren
                        </span>
                      )}
                    </div>
                  </button>
                )}

                {activeTab === "moon_skin" && (
                  <button
                    type="button"
                    aria-pressed={activeMoonSkin === "default"}
                    onClick={() => onApplyCosmetic("default", "moon_skin")}
                    className={`p-3.5 rounded-[1.25rem] border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer ${
                      activeMoonSkin === "default"
                        ? STAR_CARD_SELECTED
                        : isNight
                          ? "bg-cosmic-bg-mid/45 border-cosmic-accent/20 hover:bg-cosmic-surface-mid/60"
                          : "bg-white border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <div className="text-3xl select-none">🌙</div>
                    <div className="mt-2 text-center">
                      <h6
                        className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                      >
                        Standard-Mond
                      </h6>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5 uppercase">
                        Klassisch
                      </span>
                    </div>
                    <div className="mt-3.5 w-full">
                      {activeMoonSkin === "default" ? (
                        <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1">
                          <Check className="size-3.5  stroke-3" /> Aktiviert
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] uppercase font-bold ${isNight ? "text-purple-300" : "text-amber-804"}`}
                        >
                          Aktivieren
                        </span>
                      )}
                    </div>
                  </button>
                )}

                {activeTab === "planet_skin" && (
                  <button
                    type="button"
                    aria-pressed={activePlanetSkin === "default"}
                    onClick={() => onApplyPlanetSkin("default")}
                    className={`p-3.5 rounded-[1.25rem] border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer ${
                      activePlanetSkin === "default"
                        ? STAR_CARD_SELECTED
                        : isNight
                          ? "bg-cosmic-bg-mid/45 border-cosmic-accent/20 hover:bg-cosmic-surface-mid/60"
                          : "bg-white border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <div className="text-3xl select-none">🪐</div>
                    <div className="mt-2 text-center">
                      <h6
                        className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                      >
                        Level-Skin
                      </h6>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5 uppercase">
                        Standard
                      </span>
                    </div>
                    <div className="mt-3.5 w-full">
                      {activePlanetSkin === "default" ? (
                        <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1">
                          <Check className="size-3.5  stroke-3" /> Aktiviert
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] uppercase font-bold ${isNight ? "text-purple-300" : "text-amber-804"}`}
                        >
                          Aktivieren
                        </span>
                      )}
                    </div>
                  </button>
                )}

                {activeTab === "planet_skin" &&
                  ROGUELITE_PLANET_SKINS.map((skin) => {
                    const isUnlocked = unlockedPlanetSkins.includes(skin.id);
                    const isActive = activePlanetSkin === skin.id;
                    return (
                      <button
                        type="button"
                        key={skin.id}
                        disabled={!isUnlocked}
                        aria-pressed={isActive}
                        onClick={() => onApplyPlanetSkin(skin.id)}
                        className={`p-2 border-2 rounded-[1.25rem] flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[145px] transition-all ${
                          isActive
                            ? STAR_CARD_SELECTED
                            : isUnlocked
                              ? isNight
                                ? "bg-cosmic-surface-mid/40 border-purple-500/20 hover:bg-cosmic-surface-mid/80 cursor-pointer"
                                : "bg-white border-amber-200 hover:bg-amber-50/50 cursor-pointer"
                              : "bg-cosmic-bg-mid/40 border-gray-600/10 opacity-45 cursor-not-allowed select-none"
                        }`}
                      >
                        {!isUnlocked && (
                          <div className="absolute right-2 top-2 size-4  rounded-full bg-slate-900/40 flex items-center justify-center">
                            <Lock className="size-2.5  text-gray-400" />
                          </div>
                        )}
                        <img
                          src={skin.previewImage}
                          alt={skin.name}
                          className="h-24 w-full rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="mt-3 text-center px-1">
                          <h6
                            className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                          >
                            {skin.name}
                          </h6>
                          <span className="text-[9px] font-mono text-gray-400 block mt-0.5 uppercase">
                            Roguelite
                          </span>
                        </div>
                        <div className="mt-3.5 w-full">
                          {isActive ? (
                            <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1">
                              <Check className="size-3.5  stroke-3" /> Aktiviert
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] uppercase font-bold ${
                                isUnlocked
                                  ? isNight
                                    ? "text-purple-300"
                                    : "text-amber-804"
                                  : "text-gray-500"
                              }`}
                            >
                              {isUnlocked ? "Aktivieren" : "Gesperrt"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                {sortedItems.map((cosmetic) => {
                  const isUnlocked = unlockedCosmetics.includes(cosmetic.id);
                  const hasWishUpgrade = purchasedUpgrades.includes("upg-glitter-wish");
                  const hasRarityUpgrade = purchasedUpgrades.includes("upg-glitter-rarity");

                  // Overwrite rarity if upgraded
                  const currentRarity = cosmeticRarityLevels?.[cosmetic.id] || cosmetic.rarity;
                  const rarityStyle =
                    RARITY_STYLES[currentRarity as keyof typeof RARITY_STYLES] ||
                    RARITY_STYLES[cosmetic.rarity];

                  const upgradeDetails = getRarityUpgradeDetails(currentRarity);

                  // Determine if active
                  let isActive = false;
                  if (activeTab === "star_color") isActive = activeStarColor === cosmetic.value;
                  else if (activeTab === "planet_accessory")
                    isActive = activeAccessory === cosmetic.value;
                  else if (activeTab === "frame_style") isActive = activeFrame === cosmetic.value;
                  else if (activeTab === "moon_skin") isActive = activeMoonSkin === cosmetic.value;

                  return (
                    <div
                      key={cosmetic.id}
                      role="button"
                      tabIndex={isUnlocked ? 0 : -1}
                      aria-disabled={!isUnlocked}
                      aria-pressed={isUnlocked ? isActive : undefined}
                      aria-label={`${cosmetic.germanName}${isUnlocked ? " ausruesten" : " gesperrt"}`}
                      onClick={() => isUnlocked && onApplyCosmetic(cosmetic.value, cosmetic.type)}
                      onKeyDown={(event) => {
                        if (isUnlocked) {
                          handleCardKeyDown(event, () =>
                            onApplyCosmetic(cosmetic.value, cosmetic.type),
                          );
                        }
                      }}
                      className={`p-3 border-2 rounded-[1.25rem] flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[145px] transition-all ${
                        isActive
                          ? STAR_CARD_SELECTED
                          : isUnlocked
                            ? isNight
                              ? "bg-cosmic-surface-mid/40 border-purple-500/20 hover:bg-cosmic-surface-mid/80 cursor-pointer"
                              : "bg-white border-amber-200 hover:bg-amber-50/50 cursor-pointer"
                            : hasWishUpgrade
                              ? isNight
                                ? "bg-cosmic-surface/90 border-pink-500/40 opacity-95 cursor-default"
                                : "bg-pink-50/90 hover:bg-pink-100 border-pink-300 opacity-95 cursor-default"
                              : "bg-cosmic-bg-mid/40 border-gray-600/10 opacity-45 cursor-not-allowed select-none"
                      }`}
                    >
                      {/* Lock symbol if not unlocked */}
                      {!isUnlocked && !hasWishUpgrade && (
                        <div className="absolute right-2 top-2 size-4  rounded-full bg-slate-900/40 flex items-center justify-center">
                          <Lock className="size-2.5  text-gray-400" />
                        </div>
                      )}

                      {/* Rarity Upgrade Chevron Button */}
                      {isUnlocked && hasRarityUpgrade && upgradeDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (glitterDust >= upgradeDetails.cost) {
                              onUpgradeCosmeticRarity(
                                cosmetic.id,
                                upgradeDetails.nextRarity,
                                upgradeDetails.cost,
                              );
                            }
                          }}
                          disabled={glitterDust < upgradeDetails.cost}
                          className={`absolute top-1.5 right-1.5 p-1 px-1.5 rounded-lg text-[8px] font-sans font-black z-15 transition-all text-white flex items-center gap-0.5 border ${
                            glitterDust >= upgradeDetails.cost
                              ? "bg-linear-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 border-pink-400 shadow-md scale-105 active:scale-95 cursor-pointer"
                              : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                          }`}
                          title={`Upgrade zu ${upgradeDetails.name} (+5% global LPS Boost) fuer ${upgradeDetails.cost} ✨`}
                        >
                          ▲ {upgradeDetails.cost}
                        </button>
                      )}

                      <div className="text-3xl select-none filter drop-shadow-md">
                        {cosmetic.emoji}
                      </div>

                      <div className="mt-1 flex flex-col items-center gap-0.5">
                        <h6
                          className={`font-sans font-black text-[11px] leading-tight ${isNight ? "text-white" : "text-slate-800"}`}
                        >
                          {cosmetic.germanName}
                        </h6>

                        <div className="flex flex-col items-center">
                          <span
                            className={`text-[8.5px] font-mono border px-1.5 py-0.2 rounded-full inline-block scale-90 ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}
                          >
                            {rarityStyle.name}
                          </span>
                          {cosmeticRarityLevels?.[cosmetic.id] && (
                            <span className="text-[7px] font-bold text-amber-300 tracking-wider uppercase mt-0.5">
                              ✨ Aufgewertet ✨
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 w-full select-none">
                        {isActive ? (
                          <span className="text-[10px] uppercase font-black text-green-400 flex items-center justify-center gap-1 leading-none">
                            <Check className="size-3.5  stroke-3" /> Aktiviert
                          </span>
                        ) : isUnlocked ? (
                          <span
                            className={`text-[9.5px] uppercase font-bold leading-none ${isNight ? "text-purple-300" : "text-amber-802"}`}
                          >
                            Ausruesten
                          </span>
                        ) : hasWishUpgrade ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const cost = getDirectPurchaseCost(cosmetic.rarity);
                              if (glitterDust >= cost) {
                                onUnlockCosmeticDirect(cosmetic.id, cost);
                              }
                            }}
                            disabled={glitterDust < getDirectPurchaseCost(cosmetic.rarity)}
                            className={`w-full py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white transition-all ${
                              glitterDust >= getDirectPurchaseCost(cosmetic.rarity)
                                ? "bg-linear-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 shadow-md cursor-pointer active:scale-95"
                                : "bg-slate-800/80 border border-cosmic-accent-muted/10 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            Kaufen: {getDirectPurchaseCost(cosmetic.rarity)} ✨
                          </button>
                        ) : (
                          <span className="text-[8px] uppercase font-mono text-gray-400 font-bold block leading-none">
                            Gesperrt
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DeferredModalContent>
        </div>
      </Modal>
    );
  },
);

InventoryModal.displayName = "InventoryModal";
