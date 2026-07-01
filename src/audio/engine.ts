/**
 * Shared Web Audio graph:
 *
 *   music voices ─► musicGain ─┐
 *   sfx voices ───► sfxGain ───┼─► master ─► compressor ─► destination
 *   (sends) ──► reverb ─► reverbReturn ─┘
 *
 * The reverb impulse is generated (2s noise burst, exponential decay) so the
 * engine still ships zero audio assets. A soft voice cap keeps burst-heavy
 * moments from stacking unbounded oscillators.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let reverbInput: GainNode | null = null;

let muted = false;
let musicVolume = 0.35; // default cozy low volume
let activeVoices = 0;

export const MAX_VOICES = 24;
const SFX_LEVEL = 0.8;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(24, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    compressor.attack.setValueAtTime(0.01, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    compressor.connect(ctx.destination);

    masterGain = ctx.createGain();
    masterGain.connect(compressor);

    sfxGain = ctx.createGain();
    sfxGain.connect(masterGain);
    sfxGain.gain.setValueAtTime(muted ? 0 : SFX_LEVEL, ctx.currentTime);

    musicGain = ctx.createGain();
    musicGain.connect(masterGain);
    musicGain.gain.setValueAtTime(muted ? 0 : musicVolume, ctx.currentTime);

    const convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(ctx, 2.0, 2.8);
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.setValueAtTime(0.3, ctx.currentTime);
    reverbInput = ctx.createGain();
    reverbInput.connect(convolver);
    convolver.connect(reverbReturn);
    reverbReturn.connect(masterGain);
  }
  return ctx;
}

function makeImpulse(context: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = context.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = context.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export function resumeIfSuspended(): void {
  if (ctx?.state === "suspended") void ctx.resume();
}

export function buses(): {
  ctx: AudioContext;
  music: GainNode;
  sfx: GainNode;
  reverb: GainNode;
} | null {
  const context = getAudioContext();
  if (!context || !musicGain || !sfxGain || !reverbInput) return null;
  return { ctx: context, music: musicGain, sfx: sfxGain, reverb: reverbInput };
}

/** Voice budget so celebratory bursts can't stack unbounded oscillators. */
export function tryAcquireVoice(): boolean {
  if (activeVoices >= MAX_VOICES) return false;
  activeVoices++;
  return true;
}

export function releaseVoice(): void {
  activeVoices = Math.max(0, activeVoices - 1);
}

export function setMuted(nextMuted: boolean): void {
  muted = nextMuted;
  const now = ctx?.currentTime ?? 0;
  sfxGain?.gain.setValueAtTime(muted ? 0 : SFX_LEVEL, now);
  musicGain?.gain.setValueAtTime(muted ? 0 : musicVolume, now);
}

export function getMuted(): boolean {
  return muted;
}

export function getMusicVolume(): number {
  return musicVolume;
}

export function setMusicVolume(vol: number): void {
  musicVolume = vol;
  if (musicGain && !muted) {
    musicGain.gain.setValueAtTime(musicVolume, ctx?.currentTime ?? 0);
  }
}
