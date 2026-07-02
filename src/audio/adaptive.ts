import { effectsBus } from "../effects/effectsBus";

/**
 * Game-state -> musical intensity (0..1). Click cadence and cosmic events
 * push it up quickly (attack ~2s); calm play lets it drift back down slowly
 * (release ~8s), so the music breathes with the game instead of twitching.
 */

let rawTarget = 0;
let smoothed = 0;
let lastSampleTime = 0;

let clickHeat = 0;
let lastClickTime = 0;
let eventActive = false;
let levelSpike = 0;

let subscribed = false;

export function ensureAdaptiveTap(): void {
  if (subscribed) return;
  subscribed = true;
  effectsBus.subscribe((event) => {
    const now = Date.now();
    switch (event.type) {
      case "CLICK_EFFECT": {
        // Exponentially decayed click counter: ~6 clicks/s saturates.
        const dt = (now - lastClickTime) / 1000;
        clickHeat = clickHeat * Math.exp(-dt / 1.5) + 1;
        lastClickTime = now;
        break;
      }
      case "STATE_UPDATE":
        eventActive = Boolean(event.state.activeEvent);
        break;
      case "LEVEL_UP":
        levelSpike = 1;
        break;
      case "ROGUELITE_JUICE": {
        if (event.kind === "victory" || event.kind === "boss") {
          levelSpike = 1;
        } else if (event.kind === "defeat") {
          levelSpike = Math.max(levelSpike, 0.6);
        } else {
          const dt = (now - lastClickTime) / 1000;
          clickHeat = clickHeat * Math.exp(-dt / 1.5) + 2;
          lastClickTime = now;
        }
        break;
      }
      default:
        break;
    }
  });
}

export function getIntensity(now = Date.now()): number {
  const clickDecayed = clickHeat * Math.exp(-((now - lastClickTime) / 1000) / 1.5);
  levelSpike *= Math.exp(-((now - lastSampleTime) / 1000) / 4);

  rawTarget = Math.min(
    1,
    Math.min(clickDecayed / 8, 0.6) + (eventActive ? 0.3 : 0) + levelSpike * 0.5,
  );

  const dt = lastSampleTime === 0 ? 0 : (now - lastSampleTime) / 1000;
  lastSampleTime = now;
  const tau = rawTarget > smoothed ? 2 : 8;
  smoothed += (rawTarget - smoothed) * (1 - Math.exp(-dt / tau));
  return smoothed;
}

/** Test hook: reset the internal state. */
export function resetIntensity(): void {
  rawTarget = 0;
  smoothed = 0;
  lastSampleTime = 0;
  clickHeat = 0;
  lastClickTime = 0;
  eventActive = false;
  levelSpike = 0;
}
