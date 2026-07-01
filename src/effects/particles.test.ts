import { describe, it, expect } from "vitest";
import { FLOATS_PER_PARTICLE, MAX_PARTICLES, ParticleSystem, mulberry32 } from "./particles";
import { parseFxParams } from "./detect";

describe("ParticleSystem", () => {
  const burst = (system: ParticleSystem, count = 10) =>
    system.spawnBurst({
      x: 100,
      y: 100,
      count,
      speed: 100,
      shape: 1,
      color: [1, 0.5, 0.25],
      size: 10,
      life: 1,
    });

  it("spawns and packs instances", () => {
    const system = new ParticleSystem(1);
    burst(system);
    const count = system.step(0.016);
    expect(count).toBe(10);
    expect(system.buffer[0]).not.toBe(0);
    expect(system.buffer[8]).toBe(1); // shape
  });

  it("expires particles after their lifetime", () => {
    const system = new ParticleSystem(1);
    burst(system);
    expect(system.step(0.5)).toBe(10);
    expect(system.step(0.6)).toBe(0);
  });

  it("caps the pool at MAX_PARTICLES", () => {
    const system = new ParticleSystem(1);
    burst(system, MAX_PARTICLES + 50);
    expect(system.count).toBe(MAX_PARTICLES);
    expect(system.buffer.length).toBe(MAX_PARTICLES * FLOATS_PER_PARTICLE);
  });

  it("is deterministic under a fixed seed", () => {
    const a = new ParticleSystem(7);
    const b = new ParticleSystem(7);
    burst(a);
    burst(b);
    a.step(0.016);
    b.step(0.016);
    expect(Array.from(a.buffer.slice(0, 90))).toEqual(Array.from(b.buffer.slice(0, 90)));
  });
});

describe("mulberry32", () => {
  it("produces a stable sequence in [0, 1)", () => {
    const rand = mulberry32(42);
    const values = [rand(), rand(), rand()];
    const rand2 = mulberry32(42);
    expect([rand2(), rand2(), rand2()]).toEqual(values);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("parseFxParams", () => {
  it("defaults to auto", () => {
    expect(parseFxParams("")).toEqual({ mode: "auto", seed: undefined });
  });
  it("parses mode and seed", () => {
    expect(parseFxParams("?fx=frozen&fxseed=5")).toEqual({ mode: "frozen", seed: 5 });
    expect(parseFxParams("?fx=off")).toEqual({ mode: "off", seed: undefined });
    expect(parseFxParams("?fx=webgl2")).toEqual({ mode: "webgl2", seed: undefined });
    expect(parseFxParams("?fx=bogus")).toEqual({ mode: "auto", seed: undefined });
  });
});
