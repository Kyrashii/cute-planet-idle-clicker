import { buses, getMuted, releaseVoice, resumeIfSuspended, tryAcquireVoice } from "./engine";
import { getIntensity } from "./adaptive";

/**
 * The five game SFX, parameterized: every hit gets a few cents of random
 * detune so rapid clicking never sounds machine-gunned, pops brighten as the
 * play intensity rises, and celebratory sounds get a touch of reverb.
 */

function detune(): number {
  return 1 + (Math.random() - 0.5) * 0.018; // ±~15 cents
}

function playTone({
  startFreq,
  endFreq,
  duration,
  type = "sine",
  gainStart = 0.15,
  swell = false,
  reverbSend = 0,
}: {
  startFreq: number;
  endFreq: number;
  duration: number;
  type?: OscillatorType;
  gainStart?: number;
  swell?: boolean;
  reverbSend?: number;
}) {
  if (getMuted()) return;
  const graph = buses();
  if (!graph) return;
  const { ctx, sfx, reverb } = graph;
  resumeIfSuspended();
  if (!tryAcquireVoice()) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

  if (swell) {
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gainStart, ctx.currentTime + duration * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  } else {
    gainNode.gain.setValueAtTime(gainStart, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }

  osc.connect(gainNode);
  gainNode.connect(sfx);
  if (reverbSend > 0) {
    const send = ctx.createGain();
    send.gain.setValueAtTime(reverbSend, ctx.currentTime);
    gainNode.connect(send);
    send.connect(reverb);
  }

  osc.onended = releaseVoice;
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// 1. Cute bubble pop for planet clicks — brightens with play intensity.
export function playPop() {
  const lift = 1 + getIntensity() * 0.25;
  playTone({
    startFreq: 400 * lift * detune(),
    endFreq: 950 * lift,
    duration: 0.08,
    type: "sine",
    gainStart: 0.13,
  });
}

// 2. Ascending cute arpeggio for pet buying
export function playBuy() {
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
  const wobble = detune();
  notes.forEach((freq, index) => {
    setTimeout(() => {
      playTone({
        startFreq: freq * wobble,
        endFreq: freq * wobble * 1.05,
        duration: 0.14,
        type: "sine",
        gainStart: 0.1,
      });
    }, index * 75);
  });
}

// 3. Magical sparkle sweep for upgrades
export function playUpgrade() {
  const startFreq = 620 * detune();
  playTone({
    startFreq,
    endFreq: startFreq * 2.1,
    duration: 0.32,
    type: "triangle",
    gainStart: 0.07,
    swell: true,
    reverbSend: 0.25,
  });

  setTimeout(() => {
    playTone({
      startFreq: startFreq * 1.25,
      endFreq: startFreq * 2.5,
      duration: 0.28,
      type: "sine",
      gainStart: 0.04,
      reverbSend: 0.25,
    });
  }, 45);
}

// 4. Soft wooden-chime click for automatic star tapping
export function playTick() {
  playTone({
    startFreq: 330 * detune(),
    endFreq: 160,
    duration: 0.03,
    type: "triangle",
    gainStart: 0.05,
  });
}

// 5. Bright chord sparkle for a gorgeous Level Up celebration
export function playLevelUp() {
  const baseFreqs = [329.63, 440.0, 554.37, 659.25, 880.0]; // E4, A4, C#5, E5, A5 (Joyful A Major)
  baseFreqs.forEach((freq, idx) => {
    setTimeout(() => {
      playTone({
        startFreq: freq,
        endFreq: freq * 1.15,
        duration: 0.55,
        type: "sine",
        gainStart: 0.06,
        reverbSend: 0.35,
      });
    }, idx * 55);
  });
}
