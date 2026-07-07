import { describe, expect, it } from "vitest";
import { calculateSuperClickReward, chargeSuperClick, getSuperClickConfig } from "./superClick";

describe("super click", () => {
  it("charges to 100 percent without overflowing", () => {
    expect(chargeSuperClick(98, 4)).toBe(100);
  });

  it("starts with 30 seconds of production", () => {
    const config = getSuperClickConfig([]);
    expect(calculateSuperClickReward(12, config)).toBe(360);
  });

  it("can be upgraded to hit three times", () => {
    const config = getSuperClickConfig(["upg-super-hit-2", "upg-super-hit-3"]);
    expect(config.hits).toBe(3);
    expect(calculateSuperClickReward(10, config)).toBe(900);
  });

  it("unlocks stardust and star rain rewards", () => {
    const config = getSuperClickConfig([
      "upg-super-stardust-1",
      "upg-super-stardust-2",
      "upg-super-rain-1",
      "upg-super-rain-2",
    ]);
    expect(config.stardust).toBe(3);
    expect(config.starRainDuration).toBe(90);
  });
});
