import { describe, expect, it } from "vitest";
import { commitGehegeDrag, resolveGehegeDrop } from "./gehegePlacement";

describe("gehege placement helpers", () => {
  it("commits calm drags to a clamped valid position", () => {
    const commit = commitGehegeDrag(
      [{ id: "placed-1", animalId: "bunny", x: 40, y: 50 }],
      "placed-1",
      50,
      60,
    );

    expect(commit).toEqual({
      accepted: true,
      x: 50,
      y: 60,
      placedAnimals: [{ id: "placed-1", animalId: "bunny", x: 50, y: 60 }],
    });
  });

  it("reverts bowl-zone drops to the original placed position", () => {
    expect(
      commitGehegeDrag([{ id: "placed-1", animalId: "bunny", x: 40, y: 50 }], "placed-1", 50, 78),
    ).toEqual({
      accepted: false,
      x: 40,
      y: 50,
      placedAnimals: [{ id: "placed-1", animalId: "bunny", x: 40, y: 50 }],
    });
  });

  it("clamps drops to the safe enclosure bounds", () => {
    expect(resolveGehegeDrop(-10, 120)).toEqual({ accepted: true, x: 5, y: 93 });
  });
});
