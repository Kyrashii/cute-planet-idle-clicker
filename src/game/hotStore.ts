import { useSyncExternalStore } from "react";

/**
 * The six per-tick scalars the worker broadcasts 4x/s. They live in this
 * plain subscribable store so the React tree doesn't re-render on every
 * tick: App propagates them into React state at 1 Hz for layout/logic,
 * while the fast-visible leaves (life counter, day/night arc, event
 * countdown) subscribe here for the full tick rate.
 */
export interface HotStats {
  life: number;
  totalLifeEarned: number;
  secondsPlayed: number;
  planetExp: number;
  cycleProgress: number;
  eventTimeRemaining: number;
}

const state: HotStats = {
  life: 0,
  totalLifeEarned: 0,
  secondsPlayed: 0,
  planetExp: 0,
  cycleProgress: 0,
  eventTimeRemaining: 0,
};

const listeners = new Set<() => void>();

export const hotStore = {
  get(): Readonly<HotStats> {
    return state;
  },
  set(partial: Partial<HotStats>): void {
    let changed = false;
    for (const key of Object.keys(partial) as (keyof HotStats)[]) {
      const value = partial[key];
      if (value !== undefined && state[key] !== value) {
        state[key] = value;
        changed = true;
      }
    }
    if (changed) listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useHotStat<T>(selector: (s: Readonly<HotStats>) => T): T {
  return useSyncExternalStore(hotStore.subscribe, () => selector(state));
}
