import { describe, it, expect } from "vitest";
import { planStep, CHORD_PRESETS, STYLE_FEEL, MUSIC_STYLES } from "./theory";
import { getIntensity, resetIntensity } from "./adaptive";
import { mulberry32 } from "../effects/particles";

describe("planStep", () => {
  it("is deterministic under a seeded RNG", () => {
    const a = planStep("classic", 0, 0.5, mulberry32(9));
    const b = planStep("classic", 0, 0.5, mulberry32(9));
    expect(a).toEqual(b);
  });

  it("always schedules a full pad chord from the style's progression", () => {
    for (const style of MUSIC_STYLES.map((s) => s.id)) {
      const chordSizes = CHORD_PRESETS[style].map((c) => c.length);
      const plan = planStep(style, 0, 0, mulberry32(1));
      const pads = plan.notes.filter((n) => n.kind === "pad");
      expect(chordSizes).toContain(pads.length);
      expect(pads.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("tightens the pulse and adds melody as intensity rises", () => {
    const calmPlans = Array.from({ length: 20 }, (_, i) => planStep("zen", i, 0, mulberry32(i)));
    const livelyPlans = Array.from({ length: 20 }, (_, i) => planStep("zen", i, 1, mulberry32(i)));

    const melodyNotes = (plans: ReturnType<typeof planStep>[]) =>
      plans.reduce((sum, p) => sum + p.notes.filter((n) => n.kind === "melody").length, 0);

    expect(melodyNotes(livelyPlans)).toBeGreaterThan(melodyNotes(calmPlans));
    expect(livelyPlans[0].nextStepMs).toBeLessThan(calmPlans[0].nextStepMs);
    expect(livelyPlans[0].nextStepMs).toBeCloseTo(STYLE_FEEL.zen.stepMs * 0.75, 5);
  });

  it("keeps note volumes in the cosy range", () => {
    for (let i = 0; i < 30; i++) {
      const plan = planStep("chiptune", i, 1, mulberry32(i * 3));
      for (const note of plan.notes) {
        expect(note.volume).toBeGreaterThan(0);
        expect(note.volume).toBeLessThan(0.12);
        expect(note.freq).toBeGreaterThan(40);
        expect(note.freq).toBeLessThan(2700);
      }
    }
  });
});

describe("adaptive intensity", () => {
  it("starts calm and stays within [0, 1]", () => {
    resetIntensity();
    const first = getIntensity(1_000_000);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThanOrEqual(1);
    const later = getIntensity(1_010_000);
    expect(later).toBeGreaterThanOrEqual(0);
    expect(later).toBeLessThanOrEqual(1);
  });
});
