import { useEffect, useRef, useState } from "react";
import { calculateOfflineLps } from "../utils/offline";
import { readSave, type SaveOwnerId } from "../utils/persistence";

/**
 * Owns the offline-earnings state and the one-shot on-load check: once the game
 * has loaded, it reads the last save, works out capped offline seconds (bounded
 * by slummer-glass level), and computes the life earned while away. The values
 * feed the cycle-indicator "jar" the player taps to claim; the setters are
 * returned so the cheat path can top them up too.
 */
export function useOfflineEarnings(isLoaded: boolean, ownerId: SaveOwnerId, hydrationRevision = 0) {
  const [offlineSeconds, setOfflineSeconds] = useState<number>(0);
  const [offlineLpsRate, setOfflineLpsRate] = useState<number>(0);
  const [offlineEarnedLife, setOfflineEarnedLife] = useState<number>(0);
  const offlineCheckedRef = useRef<boolean>(false);

  useEffect(() => {
    offlineCheckedRef.current = false;
    setOfflineSeconds(0);
    setOfflineLpsRate(0);
    setOfflineEarnedLife(0);
  }, [hydrationRevision, ownerId]);

  useEffect(() => {
    if (isLoaded && !offlineCheckedRef.current) {
      offlineCheckedRef.current = true;
      try {
        const savedStateObj = readSave(ownerId);
        if (savedStateObj) {
          const cachedSecs = Number(savedStateObj.offlineSeconds || 0);

          let elapsedSecs = 0;
          if (savedStateObj.lastSavedAt) {
            const lastSavedAt = Number(savedStateObj.lastSavedAt);
            const elapsedMs = Date.now() - (Number.isFinite(lastSavedAt) ? lastSavedAt : 0);
            elapsedSecs = Math.floor(elapsedMs / 1000);
          }

          const totalOfflineSecs = cachedSecs + elapsedSecs;

          // Only calculate if the total accumulated secs is >= 10
          if (totalOfflineSecs >= 10) {
            const lvl = Number(savedStateObj.slummerGlassLevel || 1);
            const maxOfflineHours = 5 + (lvl - 1) * 2;
            const maxOfflineSecs = maxOfflineHours * 60 * 60;
            const cappedSecs = Math.min(totalOfflineSecs, maxOfflineSecs);
            const computedLps = calculateOfflineLps(savedStateObj);
            const lifeEarned = Math.floor(computedLps * cappedSecs);

            if (lifeEarned > 0) {
              setOfflineSeconds(cappedSecs);
              setOfflineLpsRate(computedLps);
              setOfflineEarnedLife(lifeEarned);
              // We do not open the modal automatically; the user taps the jar in the cycle indicator.
            }
          }
        }
      } catch (err) {
        console.error("Failed to check offline earnings:", err);
      }
    }
  }, [isLoaded, ownerId]);

  return {
    offlineSeconds,
    setOfflineSeconds,
    offlineLpsRate,
    setOfflineLpsRate,
    offlineEarnedLife,
    setOfflineEarnedLife,
  };
}
