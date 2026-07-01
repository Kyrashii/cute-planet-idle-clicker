/**
 * Musical material and the pure, seeded step planner the sequencer plays.
 * Everything here is side-effect free so the generative logic is testable.
 */

export type MusicStyleId = "classic" | "rainy" | "space" | "chiptune" | "zen";

export interface MusicStyleDef {
  id: MusicStyleId;
  name: string;
  emoji: string;
  description: string;
}

export const MUSIC_STYLES: MusicStyleDef[] = [
  {
    id: "classic",
    name: "Gemuetlicher Klassiker",
    emoji: "🌸",
    description: "Warme, entspannende Jazz-Akkorde fuer kuscheliges Wohlfuehlen.",
  },
  {
    id: "rainy",
    name: "Regnerisches Café",
    emoji: "☕🌧️",
    description: "Sanfte Melodien untermalt von echtem, gemuetlichem Regenrauschen.",
  },
  {
    id: "space",
    name: "Kosmischer Traum",
    emoji: "🌌",
    description: "Tiefe, schwebende Sphaerenklaenge fuer traumfeste Sternenwanderer.",
  },
  {
    id: "chiptune",
    name: "Retro Pixel-Lofi",
    emoji: "🎮",
    description: "Suesser 8-Bit Lofi-Charme mit nostalgischen Konsolen-Keys.",
  },
  {
    id: "zen",
    name: "Heilender Buddha-Garten",
    emoji: "🍃",
    description: "Reine Natur-Harmonien und tiefe, meditative Glocken-Chimes.",
  },
];

// Different lush chords for each style (Hz) — the progressions the generator walks.
export const CHORD_PRESETS: Record<MusicStyleId, number[][]> = {
  classic: [
    [110.0, 220.0, 277.18, 329.63, 415.3, 493.88], // Amaj9 (Warm & cuddly)
    [130.81, 246.94, 329.63, 415.3, 493.88, 622.25], // C#m7 (Starry)
    [92.5, 185.0, 220.0, 277.18, 329.63, 415.3], // F#m9 (Introspective)
    [123.47, 246.94, 293.66, 369.99, 440.0, 554.37], // Bm11 (Calming)
  ],
  rainy: [
    [110.0, 220.0, 277.18, 329.63, 415.3, 493.88], // Amaj9
    [92.5, 185.0, 220.0, 277.18, 329.63, 415.3], // F#m9
    [146.83, 293.66, 369.99, 440.0, 554.37, 659.25], // Dmaj9 (Sheltering)
    [164.81, 329.63, 392.0, 440.0, 587.33, 659.25], // E7sus4 (Raindrops)
  ],
  space: [
    [130.81, 196.0, 246.94, 329.63, 392.0, 493.88], // Cmaj9 (Celestial depth)
    [110.0, 164.81, 220.0, 261.63, 329.63, 392.0], // Am9 (Cosmo floating)
    [87.31, 130.81, 174.61, 220.0, 261.63, 349.23], // Fmaj7/A
    [98.0, 146.83, 196.0, 246.94, 293.66, 392.0], // G6 (Universal)
  ],
  chiptune: [
    [130.81, 174.61, 220.0, 261.63, 329.63], // Am7 / F chord sweep
    [146.83, 196.0, 246.94, 293.66, 349.23], // G7 chord sweep
    [130.81, 164.81, 220.0, 261.63], // Am
    [164.81, 220.0, 261.63, 329.63], // C/E arcade nostalgic
  ],
  zen: [
    [174.61, 220.0, 261.63, 349.23, 440.0], // Fmaj7 (Forest ground)
    [130.81, 164.81, 196.0, 261.63, 329.63], // Cmaj7 (Deep stillness)
    [196.0, 246.94, 293.66, 392.0, 493.88], // Gmaj (Warm sunbeams)
    [146.83, 196.0, 220.0, 293.66, 369.99], // D7 (Gentle resolve)
  ],
};

// Pentatonic warm chime-bell frequencies (C5 - E6)
export const PENTATONIC_BELLS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

interface StyleFeel {
  type: OscillatorType;
  padDelayMs: number;
  stepMs: number;
  padVolume: number;
  bellVolume: number;
  padDuration: number;
}

export const STYLE_FEEL: Record<MusicStyleId, StyleFeel> = {
  classic: {
    type: "sine",
    padDelayMs: 140,
    stepMs: 5800,
    padVolume: 0.08,
    bellVolume: 0.055,
    padDuration: 4.8,
  },
  rainy: {
    type: "sine",
    padDelayMs: 140,
    stepMs: 6200,
    padVolume: 0.075,
    bellVolume: 0.055,
    padDuration: 4.8,
  },
  space: {
    type: "sine",
    padDelayMs: 140,
    stepMs: 7400,
    padVolume: 0.09,
    bellVolume: 0.07,
    padDuration: 5.8,
  },
  chiptune: {
    type: "triangle",
    padDelayMs: 110,
    stepMs: 4500,
    padVolume: 0.045,
    bellVolume: 0.04,
    padDuration: 4.8,
  },
  zen: {
    type: "sine",
    padDelayMs: 140,
    stepMs: 6600,
    padVolume: 0.07,
    bellVolume: 0.065,
    padDuration: 4.8,
  },
};

export interface PlannedNote {
  freq: number;
  atMs: number;
  durationS: number;
  volume: number;
  type: OscillatorType;
  kind: "pad" | "bell" | "melody";
}

export interface StepPlan {
  notes: PlannedNote[];
  nextChordIndex: number;
  nextStepMs: number;
}

/**
 * Plan one generative step: the progression chord (with occasional
 * substitutions and octave inversions), sprinkled bells, and — as intensity
 * rises — short pentatonic melody fragments and a quicker pulse.
 */
export function planStep(
  style: MusicStyleId,
  chordIndex: number,
  intensity: number,
  rand: () => number,
): StepPlan {
  const chords = CHORD_PRESETS[style] ?? CHORD_PRESETS.classic;
  const feel = STYLE_FEEL[style] ?? STYLE_FEEL.classic;
  const notes: PlannedNote[] = [];

  // Occasional substitution keeps the loop from feeling fixed.
  let index = chordIndex % chords.length;
  if (rand() < 0.15) index = Math.floor(rand() * chords.length);

  const chord = [...chords[index]];
  // Voicing variation: sometimes lift or drop one inner note an octave.
  if (rand() < 0.4 && chord.length > 3) {
    const i = 1 + Math.floor(rand() * (chord.length - 2));
    chord[i] = rand() < 0.5 ? chord[i] * 2 : chord[i] / 2;
  }

  chord.forEach((freq, i) => {
    notes.push({
      freq,
      atMs: i * feel.padDelayMs,
      durationS: feel.padDuration,
      volume: feel.padVolume * (0.9 + rand() * 0.2),
      type: feel.type,
      kind: "pad",
    });
  });

  // Bells: denser when the game is lively.
  const bellCount = 1 + Math.floor(rand() * 2) + (rand() < intensity ? 1 : 0);
  for (let b = 0; b < bellCount; b++) {
    notes.push({
      freq: PENTATONIC_BELLS[Math.floor(rand() * PENTATONIC_BELLS.length)],
      atMs: 1800 + rand() * 2500,
      durationS: style === "space" ? 2.6 : 1.8,
      volume: feel.bellVolume,
      type: feel.type === "triangle" ? "triangle" : "sine",
      kind: "bell",
    });
  }

  // Melody fragments appear with intensity: 2-5 stepwise pentatonic notes.
  if (rand() < 0.2 + intensity * 0.6) {
    const length = 2 + Math.floor(rand() * (2 + intensity * 2));
    let degree = Math.floor(rand() * PENTATONIC_BELLS.length);
    const startMs = 900 + rand() * 1200;
    const gapMs = 320 - intensity * 120;
    for (let n = 0; n < length; n++) {
      degree = Math.min(PENTATONIC_BELLS.length - 1, Math.max(0, degree + (rand() < 0.5 ? -1 : 1)));
      notes.push({
        freq: PENTATONIC_BELLS[degree],
        atMs: startMs + n * gapMs,
        durationS: 1.1,
        volume: feel.bellVolume * 0.8,
        type: feel.type === "triangle" ? "triangle" : "sine",
        kind: "melody",
      });
    }
  }

  return {
    notes,
    nextChordIndex: (index + 1) % chords.length,
    // Lively play tightens the pulse by up to ~25%.
    nextStepMs: feel.stepMs * (1 - intensity * 0.25),
  };
}
