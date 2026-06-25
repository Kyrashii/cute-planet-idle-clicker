import { describe, expect, it, vi } from "vitest";
import {
  ANIMAL_MIN_DISTANCE,
  createTrackCluster,
  isPointInBowlZone,
  isValidEnclosurePosition,
  pickWanderTarget,
} from "./gehegeLayout";

describe("gehegeLayout helpers", () => {
  it("rejects positions inside the bowl zone", () => {
    expect(isPointInBowlZone(50, 78)).toBe(true);
    expect(isValidEnclosurePosition(50, 78, [])).toBe(false);
  });

  it("rejects positions that are too close to another animal", () => {
    expect(
      isValidEnclosurePosition(12, 12, [
        { id: "p1", animalId: "bunny", x: 10, y: 10, behaviorSeed: 1, facing: 1 },
      ]),
    ).toBe(false);
    expect(
      isValidEnclosurePosition(10 + ANIMAL_MIN_DISTANCE + 1, 10, [
        { id: "p1", animalId: "bunny", x: 10, y: 10, behaviorSeed: 1, facing: 1 },
      ]),
    ).toBe(true);
  });

  it("creates between one and three track marks", () => {
    const tracks = createTrackCluster("bunny", "paw", 40, 40, 1000, 18000);
    expect(tracks.length).toBeGreaterThanOrEqual(1);
    expect(tracks.length).toBeLessThanOrEqual(3);
    expect(tracks[0]).toMatchObject({ animalId: "bunny", profile: "paw" });
  });

  it("picks a valid wander target when randomness cooperates", () => {
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValueOnce(0.5);
    randomSpy.mockReturnValueOnce(0.1);
    const target = pickWanderTarget(
      { id: "p1", animalId: "bunny", x: 30, y: 30, behaviorSeed: 1, facing: 1 },
      [{ id: "p1", animalId: "bunny", x: 30, y: 30, behaviorSeed: 1, facing: 1 }],
      14,
    );
    expect(target.x).not.toBe(30);
    expect(target.y).not.toBe(30);
    randomSpy.mockRestore();
  });
});
