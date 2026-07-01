import {
  buses,
  getAudioContext,
  getMuted,
  getMusicVolume,
  releaseVoice,
  tryAcquireVoice,
} from "./engine";
import { ensureAdaptiveTap, getIntensity } from "./adaptive";
import { planStep, type MusicStyleId, type PlannedNote } from "./theory";

/**
 * Generative background-music runner. Each step asks the pure planner for a
 * chord/bell/melody plan (seeded by real randomness at runtime, seedable in
 * tests) and schedules the notes on the AudioContext clock.
 */

let musicPlaying = false;
let currentStyle: MusicStyleId = "chiptune";
let chordIndex = 0;
let stepTimeout: ReturnType<typeof setTimeout> | null = null;

let rainSource: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;

export function isMusicPlaying(): boolean {
  return musicPlaying;
}

export function getMusicStyle(): MusicStyleId {
  return currentStyle;
}

export function setMusicStyle(style: MusicStyleId): void {
  currentStyle = style;
  localStorage.setItem("cute_planet_music_style", style);

  if (musicPlaying) {
    if (style === "rainy") {
      startRain();
    } else {
      stopRain();
    }
  }
}

export function startBackgroundMusic(): void {
  if (musicPlaying) return;
  musicPlaying = true;
  getAudioContext();
  ensureAdaptiveTap();
  if (currentStyle === "rainy") startRain();
  step();
}

export function stopBackgroundMusic(): void {
  musicPlaying = false;
  if (stepTimeout) {
    clearTimeout(stepTimeout);
    stepTimeout = null;
  }
  stopRain();
}

function step(): void {
  if (!musicPlaying) return;
  const graph = buses();
  if (!graph || graph.ctx.state === "suspended") {
    stepTimeout = setTimeout(step, 1000);
    return;
  }

  const plan = planStep(currentStyle, chordIndex, getIntensity(), Math.random);
  chordIndex = plan.nextChordIndex;
  for (const note of plan.notes) {
    scheduleNote(note);
  }
  stepTimeout = setTimeout(step, plan.nextStepMs);
}

function scheduleNote(note: PlannedNote): void {
  const graph = buses();
  if (!graph || getMuted()) return;
  const { ctx, music, reverb } = graph;
  if (!tryAcquireVoice()) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const start = ctx.currentTime + note.atMs / 1000;

  osc.type = note.type;
  osc.frequency.setValueAtTime(note.freq, start);

  if (note.kind === "pad") {
    gainNode.gain.setValueAtTime(0.001, start);
    gainNode.gain.linearRampToValueAtTime(note.volume, start + 1.2);
    gainNode.gain.setValueAtTime(note.volume, start + 2.4);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + note.durationS);
  } else {
    gainNode.gain.setValueAtTime(note.volume, start);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + note.durationS);
  }

  osc.connect(gainNode);
  gainNode.connect(music);
  if (note.kind !== "pad") {
    const send = ctx.createGain();
    send.gain.setValueAtTime(0.3, start);
    gainNode.connect(send);
    send.connect(reverb);
  }

  osc.onended = releaseVoice;
  osc.start(start);
  osc.stop(start + note.durationS);
}

/**
 * Procedural cozy rain: soft white noise through lowpass + warming peak
 * filters, looped — zero asset weight.
 */
function startRain(): void {
  if (rainSource) return;
  const graph = buses();
  if (!graph) return;
  const { ctx, music } = graph;

  try {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(450, ctx.currentTime);

    const warmer = ctx.createBiquadFilter();
    warmer.type = "peaking";
    warmer.frequency.setValueAtTime(120, ctx.currentTime);
    warmer.Q.setValueAtTime(1.0, ctx.currentTime);
    warmer.gain.setValueAtTime(6, ctx.currentTime);

    rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(getMuted() ? 0 : getMusicVolume() * 0.45, ctx.currentTime);

    rainSource.connect(lowpass);
    lowpass.connect(warmer);
    warmer.connect(rainGain);
    rainGain.connect(music);

    rainSource.start();
  } catch (err) {
    console.warn("Could not synth procedural rain: ", err);
  }
}

function stopRain(): void {
  if (rainSource) {
    try {
      rainSource.stop();
    } catch {
      // already stopped
    }
    rainSource.disconnect();
    rainSource = null;
  }
  if (rainGain) {
    rainGain.disconnect();
    rainGain = null;
  }
}
