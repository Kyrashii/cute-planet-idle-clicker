export interface SuperClickConfig {
  chargePerClick: number;
  productionSeconds: number;
  hits: number;
  rewardMultiplier: number;
  retainedCharge: number;
  stardust: number;
  stars: number;
  glitterDust: number;
  starRainDuration: number;
}

export const SUPER_CLICK_UPGRADE_IDS = [
  "upg-super-charge-1",
  "upg-super-duration-1",
  "upg-super-power-1",
  "upg-super-stardust-1",
  "upg-super-charge-2",
  "upg-super-stars-1",
  "upg-super-duration-2",
  "upg-super-glitter-1",
  "upg-super-power-2",
  "upg-super-hit-2",
  "upg-super-stardust-2",
  "upg-super-charge-3",
  "upg-super-duration-3",
  "upg-super-rain-1",
  "upg-super-retain-1",
  "upg-super-stars-2",
  "upg-super-power-3",
  "upg-super-duration-4",
  "upg-super-hit-3",
  "upg-super-rain-2",
] as const;

export function getSuperClickConfig(purchasedUpgrades: readonly string[]): SuperClickConfig {
  const upgrades = new Set(purchasedUpgrades);

  return {
    chargePerClick:
      2 +
      (upgrades.has("upg-super-charge-1") ? 1 : 0) +
      (upgrades.has("upg-super-charge-2") ? 1 : 0) +
      (upgrades.has("upg-super-charge-3") ? 2 : 0),
    productionSeconds:
      30 +
      (upgrades.has("upg-super-duration-1") ? 5 : 0) +
      (upgrades.has("upg-super-duration-2") ? 10 : 0) +
      (upgrades.has("upg-super-duration-3") ? 15 : 0) +
      (upgrades.has("upg-super-duration-4") ? 30 : 0),
    hits: 1 + (upgrades.has("upg-super-hit-2") ? 1 : 0) + (upgrades.has("upg-super-hit-3") ? 1 : 0),
    rewardMultiplier:
      1 +
      (upgrades.has("upg-super-power-1") ? 0.15 : 0) +
      (upgrades.has("upg-super-power-2") ? 0.25 : 0) +
      (upgrades.has("upg-super-power-3") ? 0.6 : 0),
    retainedCharge: upgrades.has("upg-super-retain-1") ? 20 : 0,
    stardust:
      (upgrades.has("upg-super-stardust-1") ? 1 : 0) +
      (upgrades.has("upg-super-stardust-2") ? 2 : 0),
    stars:
      (upgrades.has("upg-super-stars-1") ? 2 : 0) + (upgrades.has("upg-super-stars-2") ? 5 : 0),
    glitterDust: upgrades.has("upg-super-glitter-1") ? 3 : 0,
    starRainDuration:
      (upgrades.has("upg-super-rain-1") ? 45 : 0) + (upgrades.has("upg-super-rain-2") ? 45 : 0),
  };
}

export function chargeSuperClick(currentCharge: number, chargePerClick: number): number {
  return Math.min(100, Math.max(0, currentCharge) + Math.max(0, chargePerClick));
}

export function calculateSuperClickReward(
  totalLps: number,
  config: Pick<SuperClickConfig, "productionSeconds" | "hits" | "rewardMultiplier">,
): number {
  return Math.max(0, totalLps) * config.productionSeconds * config.hits * config.rewardMultiplier;
}
