import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type {
  Animal,
  EnclosureBuff,
  EnclosureRewardOutcome,
  EnclosureRewardProfile,
  EnclosureTrack,
  PlacedAnimal,
} from "../../types";
import { playPop } from "../../utils/audio";
import { ENCLOSURE_ANIMAL_CONFIGS } from "../../game/enclosureConfig";
import { ENCLOSURE_TRACK_LIFETIME_MS, ENCLOSURE_TRACK_LIMIT } from "../../game/enclosureRewards";
import {
  BOWL_ZONE,
  createTrackCluster,
  isValidEnclosurePosition,
  pickWanderTarget,
} from "./gehegeLayout";

interface AuraConfig {
  classes: string;
  name: string;
}

export const getAuraConfig = (love: number): AuraConfig | null => {
  if (love <= 0) return null;
  if (love < 30) {
    return {
      classes:
        "shadow-[0_0_25px_rgba(255,255,255,0.75),inset_0_0_12px_rgba(255,255,255,0.4)] bg-white/20 border-2 border-white/50",
      name: "Sanfter Hauch Aura",
    };
  }
  if (love < 60) {
    return {
      classes:
        "shadow-[0_0_28px_rgba(253,224,71,0.8),inset_0_0_15px_rgba(253,224,71,0.4)] bg-yellow-400/20 border-2 border-yellow-400/50",
      name: "Lichtfunken Aura",
    };
  }
  if (love < 100) {
    return {
      classes:
        "shadow-[0_0_30px_rgba(244,114,182,0.85),inset_0_0_15px_rgba(244,114,182,0.45)] bg-pink-400/20 border-2 border-pink-400/55",
      name: "Rosige Kuschel-Aura",
    };
  }
  if (love < 140) {
    return {
      classes:
        "shadow-[0_0_32px_rgba(251,146,60,0.9),inset_0_0_15px_rgba(251,146,60,0.5)] bg-orange-400/20 border-2 border-orange-400/60",
      name: "Warme Herzens-Aura",
    };
  }
  if (love < 180) {
    return {
      classes:
        "shadow-[0_0_35px_rgba(52,211,153,0.95),inset_0_0_18px_rgba(52,211,153,0.55)] bg-emerald-400/20 border-2 border-emerald-400/65",
      name: "Naturkraft Aura",
    };
  }
  if (love < 220) {
    return {
      classes:
        "shadow-[0_0_38px_rgba(56,189,248,0.95),inset_0_0_18px_rgba(56,189,248,0.55)] bg-sky-400/20 border-2 border-sky-400/70",
      name: "Himmelsbrise Aura",
    };
  }
  if (love < 260) {
    return {
      classes:
        "shadow-[0_0_40px_rgba(129,140,248,1),inset_0_0_20px_rgba(129,140,248,0.6)] bg-indigo-400/20 border-2 border-indigo-400/75",
      name: "Sternenglanz Aura",
    };
  }
  if (love < 300) {
    return {
      classes:
        "shadow-[0_0_45px_rgba(167,139,250,1),inset_0_0_20px_rgba(167,139,250,0.65)] bg-violet-400/20 border-2 border-violet-400/80",
      name: "Kosmische Magie-Aura",
    };
  }
  return {
    classes:
      "shadow-[0_0_55px_rgba(239,68,68,1),inset_0_0_25px_rgba(245,158,11,0.7)] bg-gradient-to-tr from-rose-500/35 via-amber-500/25 to-pink-500/35 border-2 border-rose-500/90",
    name: "Ewige Zuneigungs-Meisteraura (+5% LPS)",
  };
};

interface GehegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNight: boolean;
  purchasedAnimals: Record<string, number>;
  animalDefs: Animal[];
  placedAnimals: PlacedAnimal[];
  onUpdatePlacedAnimals: (placed: PlacedAnimal[]) => void;
  animalLove?: Record<string, number>;
  onUpdateAnimalLove?: (love: Record<string, number>) => void;
  animalLastPet?: Record<string, number>;
  onUpdateAnimalLastPet?: (lastPet: Record<string, number>) => void;
  bowlLastFed?: number;
  onUpdateBowlLastFed?: (val: number) => void;
  bowlFedMinutesCredited?: number;
  onUpdateBowlFedMinutesCredited?: (val: number) => void;
  activeEnclosureBuffs: EnclosureBuff[];
  lastEnclosureReward: {
    animalId: string;
    trackId: string;
    reward: EnclosureRewardOutcome;
    receivedAt: number;
  } | null;
  onCollectEnclosureTrack: (
    animalId: string,
    profile: EnclosureRewardProfile,
    trackId: string,
  ) => void;
}

function colCountSafe(val: number): number {
  return typeof val === "number" && !Number.isNaN(val) ? val : 0;
}

function formatRewardText(reward: EnclosureRewardOutcome): string {
  if (reward.kind === "buff") {
    return `${reward.label}: x${reward.amount.toFixed(2)} fuer 20s`;
  }
  if (reward.kind === "instant_life") {
    return `${reward.label}: +${reward.amount.toLocaleString("de-DE")} Leben`;
  }
  if (reward.kind === "instant_stars") {
    return `${reward.label}: +${reward.amount} Sterne`;
  }
  return `${reward.label}: +${reward.amount} Liebe`;
}

const AnimalImageComponent: React.FC<{
  image?: string;
  fallbackImage?: string;
  emoji: string;
  sizeClassName?: string;
  emojiSizeClassName?: string;
}> = ({
  image,
  fallbackImage,
  emoji,
  sizeClassName = "w-14 h-14 object-contain select-none pointer-events-none",
  emojiSizeClassName = "text-4xl select-none pointer-events-none",
}) => {
  const [errored, setErrored] = useState<string | null>(null);
  const primary = errored === image ? fallbackImage : image;

  if (primary) {
    return (
      <img
        src={primary}
        alt={emoji}
        onError={() => setErrored(primary)}
        className={sizeClassName}
        referrerPolicy="no-referrer"
        draggable={false}
      />
    );
  }

  return <span className={emojiSizeClassName}>{emoji}</span>;
};

const AnimalImage = React.memo(AnimalImageComponent);

type DragState = {
  animalId: string;
  originX: number;
  originY: number;
  x: number;
  y: number;
};

type PressState = {
  placedId: string;
  speciesId: string;
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
  pointerId: number;
  movedTooFar: boolean;
  timer: ReturnType<typeof setTimeout>;
};

interface PlacedAnimalItemProps {
  pa: PlacedAnimal;
  def: Animal | undefined;
  loveVal: number;
  lastPetTime: number;
  isDragging: boolean;
  dragState: DragState | null;
  onPointerDown: (animal: PlacedAnimal, event: React.PointerEvent<HTMLDivElement>) => void;
  onRemove: (id: string) => void;
  onWanderRequest: (animalId: string) => void;
  onTrackTrail: (animalId: string, profile: EnclosureRewardProfile, x: number, y: number) => void;
}

const PlacedAnimalItem = React.memo<PlacedAnimalItemProps>(
  ({
    pa,
    def,
    loveVal,
    lastPetTime,
    isDragging,
    dragState,
    onPointerDown,
    onRemove,
    onWanderRequest,
    onTrackTrail,
  }) => {
    const [now, setNow] = useState(Date.now());
    const [isWalking, setIsWalking] = useState(false);
    const [stepFrame, setStepFrame] = useState<0 | 1>(0);
    const prevPosRef = useRef({ x: pa.x, y: pa.y });
    const firstMountRef = useRef(true);
    const config = ENCLOSURE_ANIMAL_CONFIGS[pa.animalId];

    useEffect(() => {
      const cooldownMs = 30 * 60 * 1000;
      const elapsed = Date.now() - lastPetTime;
      if (elapsed >= cooldownMs || loveVal >= 300) return;
      const remaining = cooldownMs - elapsed;
      const timeout = setTimeout(() => setNow(Date.now()), remaining + 100);
      return () => clearTimeout(timeout);
    }, [lastPetTime, loveVal]);

    useEffect(() => {
      if (isDragging) return;
      const [minIdle, maxIdle] = config.idleRangeMs;
      const timeout = setTimeout(
        () => onWanderRequest(pa.id),
        minIdle + Math.random() * (maxIdle - minIdle),
      );
      return () => clearTimeout(timeout);
    }, [config.idleRangeMs, isDragging, onWanderRequest, pa.id, pa.x, pa.y]);

    useEffect(() => {
      const prev = prevPosRef.current;
      const dx = pa.x - prev.x;
      const dy = pa.y - prev.y;
      const dist = Math.hypot(dx, dy);
      prevPosRef.current = { x: pa.x, y: pa.y };

      if (firstMountRef.current) {
        firstMountRef.current = false;
        return;
      }

      if (isDragging || dist < 0.5) return;

      const walkMs = Math.max(800, (dist / config.travelSpeed) * 1000);
      setIsWalking(true);
      const stepTimer = setInterval(
        () => setStepFrame((prevFrame) => (prevFrame === 0 ? 1 : 0)),
        config.walkCycleMs / 2,
      );
      const stopTimer = setTimeout(() => {
        setIsWalking(false);
        setStepFrame(0);
        if (Math.random() < config.trackChance) {
          onTrackTrail(pa.animalId, config.rewardProfile, pa.x, pa.y);
        }
      }, walkMs);

      return () => {
        clearInterval(stepTimer);
        clearTimeout(stopTimer);
      };
    }, [
      config.rewardProfile,
      config.trackChance,
      config.travelSpeed,
      config.walkCycleMs,
      isDragging,
      onTrackTrail,
      pa.animalId,
      pa.x,
      pa.y,
    ]);

    const canPet = now - lastPetTime >= 30 * 60 * 1000 && loveVal < 300;
    const aura = getAuraConfig(loveVal);
    const spritePath = isDragging
      ? config.spritePaths.held
      : isWalking
        ? stepFrame === 0
          ? config.spritePaths.walkA
          : config.spritePaths.walkB
        : config.spritePaths.idle;

    const left = isDragging && dragState ? dragState.x : pa.x;
    const top = isDragging && dragState ? dragState.y : pa.y;

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          left: `${left}%`,
          top: `${top}%`,
          scale: isDragging ? 1.08 : 1,
          rotate: isDragging ? config.pickupRotation : 0,
          opacity: 1,
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={
          isDragging
            ? { type: "spring", stiffness: 260, damping: 20 }
            : { type: "spring", stiffness: 90, damping: 18 }
        }
        className="absolute p-2 group z-20"
        style={{
          x: "-50%",
          y: "-50%",
          pointerEvents: "auto",
        }}
      >
        <div className="relative group/animal">
          {canPet && !isDragging && (
            <div className="absolute -top-6 -left-3.5 z-30 pointer-events-none animate-pulse">
              <div className="relative bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center border border-pink-100 font-bold min-w-[24px] h-6 select-none">
                <span>Herz</span>
                <div className="absolute -bottom-0.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full border border-pink-100/50" />
                <div className="absolute -bottom-1.5 right-1 w-1 h-1 bg-white rounded-full border border-pink-100/50" />
              </div>
            </div>
          )}

          <div
            onPointerDown={(event) => onPointerDown(pa, event)}
            className={`relative z-10 touch-none ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`}
          >
            {aura && (
              <div
                className={`absolute -inset-4 rounded-full select-none pointer-events-none transition-all duration-1000 animate-pulse ${aura.classes}`}
                style={{ animationDuration: "3s" }}
              />
            )}

            <div
              className={`p-1.5 transition-all duration-200 relative z-10 ${
                isDragging ? "scale-110" : "hover:scale-110 active:scale-95"
              }`}
              style={{
                transform: `translate(${isDragging ? config.pickupOffset.x : 0}px, ${
                  isDragging ? config.pickupOffset.y : 0
                }px) scaleX(${isDragging ? pa.facing : pa.facing})`,
              }}
            >
              <div className={config.dropShadow}>
                <AnimalImage
                  image={spritePath}
                  fallbackImage={def?.image}
                  emoji={def?.emoji || "Tier"}
                  sizeClassName="w-12 h-12 md:w-16 md:h-16 object-contain pointer-events-none select-none"
                  emojiSizeClassName="text-3xl md:text-5xl pointer-events-none select-none"
                />
              </div>
            </div>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2.5 py-1 bg-slate-950/90 text-[10px] text-pink-200 font-bold rounded-lg border border-pink-500/15 opacity-0 group-hover/animal:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-30 select-none shadow-md">
            {def?.germanName || "Tier"} (Liebe {loveVal})
          </div>

          {!isDragging && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRemove(pa.id);
              }}
              className="absolute -top-2 -right-2 bg-red-500/95 hover:bg-red-600 border border-white text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover/animal:opacity-100 transition-opacity duration-150 shadow-md cursor-pointer z-20"
              title="Tier entfernen"
            >
              X
            </button>
          )}
        </div>
      </motion.div>
    );
  },
);

PlacedAnimalItem.displayName = "PlacedAnimalItem";

interface FeedBowlComponentProps {
  bowlLastFed: number;
  onUpdateBowlLastFed?: (val: number) => void;
  onUpdateBowlFedMinutesCredited?: (val: number) => void;
  onTriggerError: (msg: string) => void;
  spawnLocalHeart: (x: number, y: number) => void;
}

const FeedBowlComponent = React.memo<FeedBowlComponentProps>(
  ({
    bowlLastFed,
    onUpdateBowlLastFed,
    onUpdateBowlFedMinutesCredited,
    onTriggerError,
    spawnLocalHeart,
  }) => {
    const [, setLocalTick] = useState(0);

    useEffect(() => {
      const elapsedMsSinceFeed = Date.now() - bowlLastFed;
      const isFull = elapsedMsSinceFeed < 25 * 60 * 1000;
      const hasCooldown = elapsedMsSinceFeed < 30 * 60 * 1000;
      if (!isFull && !hasCooldown) return;
      const timer = setInterval(() => setLocalTick((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }, [bowlLastFed]);

    const elapsedMsSinceFeed = Date.now() - bowlLastFed;
    const isFull = elapsedMsSinceFeed < 25 * 60 * 1000;
    const hasCooldown = elapsedMsSinceFeed < 30 * 60 * 1000;

    let bowlTooltip = "";
    if (isFull) {
      const remainingMs = 25 * 60 * 1000 - elapsedMsSinceFeed;
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      bowlTooltip = `Tiere futtern noch ${mins}m ${secs}s`;
    } else if (hasCooldown) {
      const remainingMs = 30 * 60 * 1000 - elapsedMsSinceFeed;
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      bowlTooltip = `Kuschelpause, bereit in ${mins}m ${secs}s`;
    } else {
      bowlTooltip = "Fuettern fuer +1 Liebe pro Minute";
    }

    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      const currentNow = Date.now();
      const elapsed = currentNow - bowlLastFed;
      if (elapsed < 30 * 60 * 1000) {
        if (elapsed < 25 * 60 * 1000) {
          onTriggerError("Die Tiere futtern gerade noch ganz gluecklich.");
        } else {
          const remainingMs = 30 * 60 * 1000 - elapsed;
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          onTriggerError(`Der Napf braucht noch ${mins}m ${secs}s Pause.`);
        }
        return;
      }

      onUpdateBowlLastFed?.(currentNow);
      onUpdateBowlFedMinutesCredited?.(0);
      playPop();
      for (let i = 0; i < 5; i += 1) {
        setTimeout(() => spawnLocalHeart(50, 80 + Math.random() * 5), i * 150);
      }
    };

    return (
      <div
        onClick={handleClick}
        className="absolute group/bowl select-none z-30 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ left: "50%", top: "78%", transform: "translate(-50%, -50%)" }}
      >
        <div className="relative">
          {!hasCooldown && (
            <div
              className="absolute -inset-2 bg-pink-500/20 rounded-full blur animate-ping"
              style={{ animationDuration: "2s" }}
            />
          )}
          {isFull && (
            <div
              className="absolute -inset-1 bg-emerald-500/10 rounded-full blur animate-pulse"
              style={{ animationDuration: "1.5s" }}
            />
          )}
          <img
            src={isFull ? "/assets/stuff/futternapf_voll.png" : "/assets/stuff/futternapf_leer.png"}
            alt="Futternapf"
            className="w-14 h-14 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div
            className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white border border-white/20 shadow-md ${
              isFull
                ? "bg-emerald-500"
                : hasCooldown
                  ? "bg-amber-500 animate-pulse"
                  : "bg-indigo-600"
            }`}
          >
            {isFull ? "Fu" : hasCooldown ? "P" : "Go"}
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950/95 text-slate-100 text-[10px] font-bold rounded-xl border border-slate-800/80 shadow-xl opacity-0 group-hover/bowl:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 flex flex-col items-center gap-0.5 select-none text-center">
            <span className="text-pink-300 font-extrabold uppercase tracking-wide text-[9px]">
              Tier-Fuetterung
            </span>
            <span className="text-white text-[10px]">{bowlTooltip}</span>
          </div>
        </div>
      </div>
    );
  },
);

FeedBowlComponent.displayName = "FeedBowlComponent";

interface PurchasedAnimalCardProps {
  def: Animal;
  owned: number;
  placed: number;
  isGehegeFull: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PurchasedAnimalCard = React.memo<PurchasedAnimalCardProps>(
  ({ def, owned, placed, isGehegeFull, isSelected, onSelect }) => {
    const available = owned - colCountSafe(placed);
    const isFullyPlaced = available <= 0;

    return (
      <div
        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between items-center text-center gap-2 bg-slate-950/40 ${
          isSelected
            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
            : "border-slate-800 hover:border-slate-700"
        }`}
      >
        <div className="flex flex-col items-center">
          <AnimalImage
            image={def.image}
            emoji={def.emoji}
            sizeClassName="w-10 h-10 object-contain pointer-events-none select-none"
            emojiSizeClassName="text-2xl pointer-events-none select-none"
          />
          <span className="text-xs font-black text-slate-200 mt-1.5 truncate max-w-[120px]">
            {def.germanName || def.name}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">
            {placed} / {owned} Platziert
          </span>
        </div>
        <button
          disabled={isFullyPlaced || isGehegeFull}
          onClick={() => onSelect(def.id)}
          className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
            isFullyPlaced
              ? "bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed"
              : isGehegeFull
                ? "bg-amber-950/40 text-amber-500/80 border border-amber-900/40 cursor-not-allowed"
                : isSelected
                  ? "bg-indigo-500 text-white border border-indigo-400 animate-pulse"
                  : "bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/20"
          }`}
        >
          {isFullyPlaced
            ? "Vollstaendig"
            : isGehegeFull
              ? "Gehege voll"
              : isSelected
                ? "Bereit"
                : "Platzieren"}
        </button>
      </div>
    );
  },
);

PurchasedAnimalCard.displayName = "PurchasedAnimalCard";

interface LoveGalleryCardProps {
  def: Animal;
  loveVal: number;
  lastPetTime: number;
}

const LoveGalleryCard = React.memo<LoveGalleryCardProps>(({ def, loveVal, lastPetTime }) => {
  const [, setLocalTick] = useState(0);

  useEffect(() => {
    const cooldownMs = 30 * 60 * 1000;
    const initialNow = Date.now();
    if (initialNow - lastPetTime >= cooldownMs) return;
    const timer = setInterval(() => setLocalTick((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [lastPetTime]);

  const now = Date.now();
  const cooldownMs = 30 * 60 * 1000;
  const hasCooldown = now - lastPetTime < cooldownMs;
  let cooldownText = "Praechtig gelaunt";
  if (hasCooldown) {
    const diffMs = cooldownMs - (now - lastPetTime);
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    cooldownText = `Kuschelpause ${mins}m ${secs}s`;
  }

  const aura = getAuraConfig(loveVal);
  const percent = Math.min(100, (loveVal / 300) * 100);

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 hover:border-pink-500/20 p-4 rounded-2xl flex flex-col items-center text-center gap-3 relative transition-all group/gallery duration-200 overflow-hidden">
      {aura && (
        <div
          className={`absolute -inset-1 rounded-2xl opacity-60 select-none pointer-events-none group-hover/gallery:opacity-95 transition-opacity animate-pulse ${aura.classes}`}
          style={{ animationDuration: "3s" }}
        />
      )}
      <div className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner group-hover/gallery:scale-105 transition-transform duration-200 z-10">
        <AnimalImage
          image={def.image}
          emoji={def.emoji}
          sizeClassName="w-16 h-16 md:w-20 md:h-20 object-contain select-none pointer-events-none"
          emojiSizeClassName="text-4xl md:text-5xl select-none pointer-events-none"
        />
      </div>
      <div className="w-full flex flex-col items-center gap-1 z-10">
        <h3 className="text-xs font-black text-indigo-200 tracking-wide">
          {def.germanName || def.name}
        </h3>
        <div className="flex items-center gap-1 text-[11px] font-black text-pink-300">
          <span>{loveVal}</span>
          <span className="text-slate-500 font-normal">/ 300</span>
        </div>
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-full h-2 overflow-hidden mt-1 shadow-inner">
          <div
            className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
          Aura:{" "}
          <span className={aura ? "text-amber-400" : "text-slate-500"}>
            {aura ? aura.name : "Keine"}
          </span>
        </p>
        <span
          className={`text-[8px] font-mono font-bold uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-md ${
            hasCooldown ? "bg-slate-800 text-slate-400" : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {cooldownText}
        </span>
      </div>
    </div>
  );
});

LoveGalleryCard.displayName = "LoveGalleryCard";

export const GehegeModal: React.FC<GehegeModalProps> = ({
  isOpen,
  onClose,
  isNight,
  purchasedAnimals,
  animalDefs,
  placedAnimals,
  onUpdatePlacedAnimals,
  animalLove = {},
  onUpdateAnimalLove,
  animalLastPet = {},
  onUpdateAnimalLastPet,
  bowlLastFed = 0,
  onUpdateBowlLastFed,
  bowlFedMinutesCredited = 0,
  onUpdateBowlFedMinutesCredited,
  activeEnclosureBuffs,
  lastEnclosureReward,
  onCollectEnclosureTrack,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showLoveGallery, setShowLoveGallery] = useState(false);
  const [modalHearts, setModalHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [placingAnimalId, setPlacingAnimalId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tracks, setTracks] = useState<EnclosureTrack[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [, setBuffTick] = useState(0);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressRef = useRef<PressState | null>(null);
  const placedAnimalsRef = useRef(placedAnimals);
  const animalLoveRef = useRef(animalLove);
  const animalLastPetRef = useRef(animalLastPet);

  useEffect(() => {
    placedAnimalsRef.current = placedAnimals;
  }, [placedAnimals]);

  useEffect(() => {
    animalLoveRef.current = animalLove;
  }, [animalLove]);

  useEffect(() => {
    animalLastPetRef.current = animalLastPet;
  }, [animalLastPet]);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (rewardTimeoutRef.current) clearTimeout(rewardTimeoutRef.current);
      if (pressRef.current) clearTimeout(pressRef.current.timer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTracks((prev) => prev.filter((track) => track.expiresAt > Date.now()));
      setBuffTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!lastEnclosureReward) return;
    setRewardToast(formatRewardText(lastEnclosureReward.reward));
    if (rewardTimeoutRef.current) clearTimeout(rewardTimeoutRef.current);
    rewardTimeoutRef.current = setTimeout(() => setRewardToast(null), 3200);
  }, [lastEnclosureReward]);

  const spawnLocalHeart = useCallback((xPercent: number, yPercent: number) => {
    const id = Date.now() + Math.random();
    setModalHearts((prev) => [...prev, { id, x: xPercent, y: yPercent - 8 }]);
    setTimeout(() => {
      setModalHearts((prev) => prev.filter((heart) => heart.id !== id));
    }, 1200);
  }, []);

  const triggerError = useCallback((message: string) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setErrorMessage(null), 4000);
  }, []);

  const placedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    placedAnimals.forEach((animal) => {
      counts[animal.animalId] = (counts[animal.animalId] || 0) + 1;
    });
    return counts;
  }, [placedAnimals]);

  const animalMap = useMemo(() => {
    const map: Record<string, Animal> = {};
    animalDefs.forEach((def) => {
      map[def.id] = def;
    });
    return map;
  }, [animalDefs]);

  const purchasedList = useMemo(
    () => animalDefs.filter((def) => (purchasedAnimals[def.id] || 0) > 0),
    [animalDefs, purchasedAnimals],
  );

  const placingAnimalDef = placingAnimalId ? animalMap[placingAnimalId] : null;
  const isGehegeFull = placedAnimals.length >= 20;
  const visibleBuffs = activeEnclosureBuffs.filter((buff) => buff.expiresAt > Date.now());

  const clearPressState = useCallback(() => {
    if (pressRef.current) {
      clearTimeout(pressRef.current.timer);
      pressRef.current = null;
    }
  }, []);

  const handlePetPlaced = useCallback(
    (animalId: string, xPercent: number, yPercent: number) => {
      const lastPet = animalLastPetRef.current[animalId] || 0;
      const now = Date.now();
      const cooldownMs = 30 * 60 * 1000;
      if (now - lastPet < cooldownMs) {
        const diffMs = cooldownMs - (now - lastPet);
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        triggerError(
          `${animalMap[animalId]?.germanName || "Dieses Tier"} hat genug Streicheleinheiten. ${minutes}m ${seconds}s warten.`,
        );
        return;
      }

      const currentLove = animalLoveRef.current[animalId] || 0;
      if (currentLove >= 300) {
        triggerError("Dieses Tier hat schon die maximale Liebe erreicht.");
        return;
      }

      if (onUpdateAnimalLove) {
        onUpdateAnimalLove({
          ...animalLoveRef.current,
          [animalId]: Math.min(300, currentLove + 1),
        });
      }
      if (onUpdateAnimalLastPet) {
        onUpdateAnimalLastPet({
          ...animalLastPetRef.current,
          [animalId]: now,
        });
      }

      playPop();
      spawnLocalHeart(xPercent, yPercent);
    },
    [animalMap, onUpdateAnimalLastPet, onUpdateAnimalLove, spawnLocalHeart, triggerError],
  );

  const updatePlacedAnimal = useCallback(
    (animalId: string, nextX: number, nextY: number, facing: 1 | -1) => {
      onUpdatePlacedAnimals(
        placedAnimalsRef.current.map((animal) =>
          animal.id === animalId ? { ...animal, x: nextX, y: nextY, facing } : animal,
        ),
      );
    },
    [onUpdatePlacedAnimals],
  );

  const handleWanderRequest = useCallback(
    (animalId: string) => {
      if (dragState?.animalId === animalId) return;
      const currentAnimal = placedAnimalsRef.current.find((animal) => animal.id === animalId);
      if (!currentAnimal) return;
      const config = ENCLOSURE_ANIMAL_CONFIGS[currentAnimal.animalId];
      const target = pickWanderTarget(currentAnimal, placedAnimalsRef.current, config.wanderRadius);
      if (target.x === currentAnimal.x && target.y === currentAnimal.y) return;
      updatePlacedAnimal(animalId, target.x, target.y, target.facing);
    },
    [dragState?.animalId, updatePlacedAnimal],
  );

  const handleTrackTrail = useCallback(
    (animalId: string, profile: EnclosureRewardProfile, x: number, y: number) => {
      const cluster = createTrackCluster(
        animalId,
        profile,
        x,
        y,
        Date.now(),
        ENCLOSURE_TRACK_LIFETIME_MS,
      );
      setTracks((prev) => {
        const fresh = prev.filter((track) => track.expiresAt > Date.now());
        return [...fresh, ...cluster].slice(-ENCLOSURE_TRACK_LIMIT);
      });
    },
    [],
  );

  const handleLandscapeClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!placingAnimalId || !landscapeRef.current) return;
      if (placedAnimals.length >= 20) {
        triggerError("Das Gehege ist voll. Maximal 20 Tiere gleichzeitig.");
        setPlacingAnimalId(null);
        return;
      }

      const rect = landscapeRef.current.getBoundingClientRect();
      const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
      if (!isValidEnclosurePosition(xPercent, yPercent, placedAnimalsRef.current)) {
        triggerError("Dort ist es zu eng oder der Futternapf steht im Weg.");
        return;
      }

      const ownedCount = purchasedAnimals[placingAnimalId] || 0;
      const currentPlaced = placedCounts[placingAnimalId] || 0;
      if (currentPlaced >= ownedCount) {
        setPlacingAnimalId(null);
        return;
      }

      const newPlaced: PlacedAnimal = {
        id: `placed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        animalId: placingAnimalId,
        x: xPercent,
        y: yPercent,
        behaviorSeed: Math.floor(Math.random() * 1_000_000),
        facing: Math.random() > 0.5 ? 1 : -1,
      };

      onUpdatePlacedAnimals([...placedAnimalsRef.current, newPlaced]);

      if (currentPlaced + 1 >= ownedCount) {
        setPlacingAnimalId(null);
      }
    },
    [
      onUpdatePlacedAnimals,
      placedAnimals.length,
      placedCounts,
      placingAnimalId,
      purchasedAnimals,
      triggerError,
    ],
  );

  const handleRemovePlaced = useCallback(
    (id: string) => {
      onUpdatePlacedAnimals(placedAnimalsRef.current.filter((animal) => animal.id !== id));
    },
    [onUpdatePlacedAnimals],
  );

  const handleRecallAll = useCallback(() => {
    onUpdatePlacedAnimals([]);
    setPlacingAnimalId(null);
    setTracks([]);
  }, [onUpdatePlacedAnimals]);

  const handleSelectPlacing = useCallback((id: string) => {
    setPlacingAnimalId(id);
    setShowDrawer(false);
  }, []);

  const handleTrackCollect = useCallback(
    (track: EnclosureTrack) => {
      setTracks((prev) => prev.filter((candidate) => candidate.id !== track.id));
      onCollectEnclosureTrack(track.animalId, track.profile, track.id);
    },
    [onCollectEnclosureTrack],
  );

  const handleAnimalPointerDown = useCallback(
    (animal: PlacedAnimal, event: React.PointerEvent<HTMLDivElement>) => {
      if (placingAnimalId) return;
      event.preventDefault();
      clearPressState();

      const pressState: PressState = {
        placedId: animal.id,
        speciesId: animal.animalId,
        clientX: event.clientX,
        clientY: event.clientY,
        startX: animal.x,
        startY: animal.y,
        pointerId: event.pointerId,
        movedTooFar: false,
        timer: setTimeout(() => {
          setDragState({
            animalId: animal.id,
            originX: animal.x,
            originY: animal.y,
            x: animal.x,
            y: animal.y,
          });
        }, 350),
      };

      pressRef.current = pressState;
    },
    [clearPressState, placingAnimalId],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerMove = (event: PointerEvent) => {
      const pressState = pressRef.current;
      if (pressState && !dragState) {
        const moved = Math.hypot(
          event.clientX - pressState.clientX,
          event.clientY - pressState.clientY,
        );
        if (moved > 12) {
          pressState.movedTooFar = true;
          clearTimeout(pressState.timer);
        }
      }

      if (!dragState || !landscapeRef.current) return;
      const rect = landscapeRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
            }
          : prev,
      );
    };

    const handlePointerUp = () => {
      const pressState = pressRef.current;
      const activeDrag = dragState;

      if (activeDrag) {
        if (
          isValidEnclosurePosition(
            activeDrag.x,
            activeDrag.y,
            placedAnimalsRef.current,
            activeDrag.animalId,
          )
        ) {
          updatePlacedAnimal(
            activeDrag.animalId,
            activeDrag.x,
            activeDrag.y,
            activeDrag.x >= activeDrag.originX ? 1 : -1,
          );
          playPop();
        } else {
          triggerError("Hier kann das Tier nicht landen. Es kuschelt sich wieder zurueck.");
        }
        setDragState(null);
      } else if (pressState && !pressState.movedTooFar) {
        handlePetPlaced(pressState.speciesId, pressState.startX, pressState.startY);
      }

      clearPressState();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, handlePetPlaced, isOpen, triggerError, updatePlacedAnimal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950 flex flex-col font-sans">
      <header className="relative z-10 w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 md:px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none" id="gehege-title-emoji">
            Haus
          </span>
          <div>
            <h1 className="text-base md:text-lg font-black text-indigo-100 tracking-wide uppercase">
              Tier-Gehege
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {isNight ? "Nachtphase aktiv" : "Tagphase aktiv"}
            </p>
          </div>
        </div>

        {placingAnimalId && placingAnimalDef && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-xs text-indigo-200 font-bold animate-pulse">
            <span>{placingAnimalDef.emoji}</span>
            <span>Klicke auf die Landschaft zum Platzieren</span>
            <button
              onClick={() => setPlacingAnimalId(null)}
              className="ml-1 px-2 py-0.5 rounded bg-indigo-600/50 hover:bg-red-500/50 hover:text-white transition-colors cursor-pointer text-[10px]"
            >
              Abbrechen
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          id="btn-close-gehege"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider border border-slate-700 shadow transition-all duration-150 cursor-pointer"
        >
          Zurueck
        </button>
      </header>

      <div className="flex-grow relative overflow-hidden flex items-center justify-center bg-slate-950">
        <div
          ref={landscapeRef}
          onClick={handleLandscapeClick}
          className={`relative w-full h-full max-w-5xl md:max-h-[80vh] md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-150 ${
            placingAnimalId
              ? "cursor-crosshair border-2 border-indigo-500"
              : "border border-slate-800"
          }`}
          style={{ aspectRatio: "16/9" }}
        >
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-4 right-4 z-40 mx-auto max-w-md bg-amber-500 border border-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between text-xs cursor-default"
                onClick={(event) => event.stopPropagation()}
              >
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="ml-2 hover:bg-black/10 px-1.5 py-0.5 rounded text-slate-950 font-extrabold cursor-pointer"
                >
                  X
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {rewardToast && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-indigo-950/85 border border-indigo-400/30 text-indigo-100 text-xs font-black shadow-xl backdrop-blur-sm"
              >
                {rewardToast}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 select-none pointer-events-none">
            <img
              src={
                isNight
                  ? "/assets/stuff/gehegelandschaft_nacht.png"
                  : "/assets/stuff/gehegelandschaft_tag.png"
              }
              alt="Gehegelandschaft"
              className="w-full h-full object-cover transition-opacity duration-1000"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>

          {visibleBuffs.length > 0 && (
            <div className="absolute left-4 bottom-4 z-30 flex flex-wrap gap-2 max-w-[60%]">
              {visibleBuffs.map((buff) => {
                const remaining = Math.max(0, Math.ceil((buff.expiresAt - Date.now()) / 1000));
                return (
                  <div
                    key={buff.id}
                    className="px-3 py-1.5 rounded-full bg-slate-950/80 border border-emerald-400/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-sm"
                  >
                    {buff.label} x{buff.multiplier.toFixed(2)} {remaining}s
                  </div>
                );
              })}
            </div>
          )}

          <AnimatePresence>
            {tracks.map((track) => {
              const config = ENCLOSURE_ANIMAL_CONFIGS[track.animalId];
              return (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: track.scale }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTrackCollect(track);
                  }}
                  className="absolute z-20 cursor-pointer bg-transparent border-0 p-0"
                  style={{
                    left: `${track.x}%`,
                    top: `${track.y}%`,
                    transform: `translate(-50%, -50%) rotate(${track.rotation}deg)`,
                  }}
                >
                  <AnimalImage
                    image={config.spritePaths.track}
                    emoji="Track"
                    sizeClassName="w-8 h-8 object-contain pointer-events-none select-none opacity-90"
                    emojiSizeClassName="text-xl pointer-events-none select-none"
                  />
                </motion.button>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {placedAnimals.map((animal) => {
              const def = animalMap[animal.animalId];
              return (
                <PlacedAnimalItem
                  key={animal.id}
                  pa={animal}
                  def={def}
                  loveVal={animalLove[animal.animalId] || 0}
                  lastPetTime={animalLastPet[animal.animalId] || 0}
                  isDragging={dragState?.animalId === animal.id}
                  dragState={dragState?.animalId === animal.id ? dragState : null}
                  onPointerDown={handleAnimalPointerDown}
                  onRemove={handleRemovePlaced}
                  onWanderRequest={handleWanderRequest}
                  onTrackTrail={handleTrackTrail}
                />
              );
            })}
          </AnimatePresence>

          {placingAnimalId && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-rose-500/80 bg-rose-500/10 flex flex-col items-center justify-center pointer-events-none select-none z-20 animate-pulse"
              style={{
                left: `${BOWL_ZONE.x}%`,
                top: `${BOWL_ZONE.y}%`,
                width: "16%",
                height: "20%",
                animationDuration: "2s",
              }}
            >
              <span className="text-[9px] text-rose-200 font-extrabold uppercase tracking-widest bg-slate-950/80 px-1.5 py-0.5 rounded-md border border-rose-500/20 shadow-sm">
                Napf
              </span>
            </div>
          )}

          <FeedBowlComponent
            bowlLastFed={bowlLastFed}
            onUpdateBowlLastFed={onUpdateBowlLastFed}
            onUpdateBowlFedMinutesCredited={onUpdateBowlFedMinutesCredited}
            onTriggerError={triggerError}
            spawnLocalHeart={spawnLocalHeart}
          />

          <AnimatePresence>
            {modalHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 1, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 1.5, y: -45, x: (Math.random() - 0.5) * 12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute text-xl select-none pointer-events-none z-40 font-bold"
                style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
              >
                Herz
              </motion.div>
            ))}
          </AnimatePresence>

          {placedAnimals.length === 0 && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none select-none text-white/50 bg-black/30 backdrop-blur-xs p-6 rounded-2xl max-w-sm mx-auto border border-white/5 shadow">
              <span className="text-4xl mb-2">Pfote</span>
              <p className="text-sm font-black uppercase tracking-wide text-indigo-200">
                Dein Gehege ist leer
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Nutze unten Tiere platzieren und lass deine suessen Begleiter herumlaufen.
              </p>
            </div>
          )}
        </div>
      </div>

      {placingAnimalId && placingAnimalDef && (
        <div className="block sm:hidden flex items-center justify-between gap-2 px-4 py-3 bg-indigo-900/90 border-t border-indigo-700/50 text-xs text-indigo-100 font-bold animate-pulse z-10 w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-lg select-none">{placingAnimalDef.emoji}</span>
            <span>Tippe auf die Landschaft</span>
          </div>
          <button
            onClick={() => setPlacingAnimalId(null)}
            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 transition-colors uppercase font-black text-[10px]"
          >
            Abbrechen
          </button>
        </div>
      )}

      <footer className="w-full bg-slate-900 border-t border-slate-800/85 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner z-10">
        <div id="gehege-stats" className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            Platziert:{" "}
            <span
              className={`${
                placedAnimals.length >= 20
                  ? "text-amber-400 animate-pulse font-black"
                  : "text-indigo-300 font-black"
              }`}
            >
              {placedAnimals.length} / 20
            </span>
          </div>
          <div>
            Besessen:{" "}
            <span className="text-indigo-300 font-black">
              {Object.values(purchasedAnimals).reduce<number>(
                (sum, count) => sum + Number(count || 0),
                0,
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowLoveGallery(true)}
            id="btn-love-gallery"
            className="px-4 py-2.5 rounded-2xl bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 hover:text-white border border-pink-500/20 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-md shadow-pink-500/5 active:scale-95"
          >
            Liebesgalerie
          </button>

          {placedAnimals.length > 0 && (
            <button
              onClick={handleRecallAll}
              id="btn-recall-all"
              className="px-4 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
            >
              Alle einsammeln
            </button>
          )}

          <button
            onClick={() => setShowDrawer((prev) => !prev)}
            id="btn-toggle-placing"
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all duration-150 cursor-pointer flex items-center gap-2 shadow ${
              showDrawer
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 text-white shadow-indigo-500/10"
            }`}
          >
            <span>Tiere platzieren</span>
            <span>{showDrawer ? "Runter" : "Hoch"}</span>
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            id="animal-placer-drawer"
            className="fixed inset-x-0 bottom-[72px] sm:bottom-[72px] bg-slate-900 border-t border-slate-800 shadow-2xl p-4 md:p-6 z-40 max-h-[50vh] overflow-y-auto"
          >
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                  Waehle ein Tier zum Platzieren
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  (danach auf die Landschaft klicken)
                </span>
              </div>

              {placedAnimals.length >= 20 && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-300/20 rounded-xl text-xs text-amber-200 font-bold flex items-center justify-between gap-2">
                  <span>Maximale Anzahl von 20 platzierten Tieren erreicht.</span>
                  <span className="text-[10px] uppercase font-mono bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-300 whitespace-nowrap">
                    Gehege voll
                  </span>
                </div>
              )}

              {purchasedList.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl">Tier</span>
                  <p className="text-slate-400 font-black uppercase tracking-wider text-xs mt-2">
                    Du hast noch keine Tiere gekauft
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Bruete zuerst Tiere im Menue aus.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {purchasedList.map((def) => (
                    <PurchasedAnimalCard
                      key={def.id}
                      def={def}
                      owned={purchasedAnimals[def.id] || 0}
                      placed={placedCounts[def.id] || 0}
                      isGehegeFull={isGehegeFull}
                      isSelected={placingAnimalId === def.id}
                      onSelect={handleSelectPlacing}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoveGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-default"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">Liebe</span>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-pink-300">
                      Tierliebe und Auren
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Streichle deine Tiere im Gehege fuer Auren und Max-Liebe-Bonus
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoveGallery(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-wider border border-slate-700/80 shadow-md transition-all cursor-pointer"
                >
                  Schliessen
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow bg-slate-900/40">
                {purchasedList.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">Aura</span>
                    <p className="text-slate-400 font-extrabold uppercase text-xs mt-3">
                      Keine Tiere besessen
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1 max-w-xs mx-auto">
                      Adoptiere zuerst liebevolle Begleiter ueber Tiere zuechten.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {purchasedList.map((def) => (
                      <LoveGalleryCard
                        key={def.id}
                        def={def}
                        loveVal={animalLove[def.id] || 0}
                        lastPetTime={animalLastPet[def.id] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 text-center">
                <p className="text-[9px] text-slate-400 font-semibold max-w-md mx-auto leading-normal">
                  Tipp: Lange gedrueckt halten zum Umplatzieren. Kleine Spuren anklicken fuer
                  Mini-Buffs.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
