import { getLpsAndStats } from "../game/statsCalculator";
import { workerStateFromSave } from "../game/state";
import type { GameSaveSnapshot } from "../types";

export function calculateOfflineLps(savedState: GameSaveSnapshot | null | undefined): number {
  const workerState = workerStateFromSave(savedState);
  if (!workerState) return 0;

  return getLpsAndStats({
    ...workerState,
    activeEvent: null,
    activeEventDecision: null,
    activeEventDetails: null,
    activeEventInstantClaimed: false,
  }).totalLps;
}
