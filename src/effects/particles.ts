/**
 * CPU particle simulation for the FX canvas. Fixed-capacity pool packed into
 * one Float32Array instance buffer — a single instanced draw per frame.
 *
 * Instance layout (floats): x, y, size, rotation, r, g, b, alpha, shape
 * (0 = soft spark, 1 = star, 2 = heart).
 */
export const FLOATS_PER_PARTICLE = 9;
export const MAX_PARTICLES = 400;

export interface SpawnBurstOptions {
  x: number;
  y: number;
  count: number;
  speed: number;
  shape: 0 | 1 | 2;
  color: [number, number, number];
  size: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  r: number;
  g: number;
  b: number;
  life: number;
  maxLife: number;
  shape: number;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ParticleSystem {
  private particles: Particle[] = [];
  readonly buffer = new Float32Array(MAX_PARTICLES * FLOATS_PER_PARTICLE);
  private random: () => number;

  constructor(seed?: number) {
    this.random = seed === undefined ? Math.random : mulberry32(seed);
  }

  get count(): number {
    return this.particles.length;
  }

  spawnBurst(options: SpawnBurstOptions): void {
    const { x, y, count, speed, shape, color, size, life } = options;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const angle = this.random() * Math.PI * 2;
      const velocity = speed * (0.35 + this.random() * 0.65);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - speed * 0.4,
        size: size * (0.6 + this.random() * 0.8),
        rotation: this.random() * Math.PI * 2,
        spin: (this.random() - 0.5) * 4,
        r: color[0],
        g: color[1],
        b: color[2],
        life,
        maxLife: life,
        shape,
      });
    }
  }

  /** Advance the sim and repack the instance buffer. Returns live count. */
  step(dt: number): number {
    const drag = Math.pow(0.4, dt);
    let write = 0;
    const survivors: Particle[] = [];
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.vx *= drag;
      p.vy = p.vy * drag + 60 * dt; // gentle gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
      const t = p.life / p.maxLife;
      const base = write * FLOATS_PER_PARTICLE;
      this.buffer[base] = p.x;
      this.buffer[base + 1] = p.y;
      this.buffer[base + 2] = p.size * (0.5 + 0.5 * t);
      this.buffer[base + 3] = p.rotation;
      this.buffer[base + 4] = p.r;
      this.buffer[base + 5] = p.g;
      this.buffer[base + 6] = p.b;
      this.buffer[base + 7] = t * t; // ease-out fade
      this.buffer[base + 8] = p.shape;
      write++;
      survivors.push(p);
    }
    this.particles = survivors;
    return write;
  }

  clear(): void {
    this.particles = [];
  }
}

/** Pastel palette (matches the cosmic tokens) for burst colours. */
export const BURST_COLORS = {
  click: [1.0, 0.78, 0.9] as [number, number, number], // cosmic-glow-pink
  star: [0.996, 0.94, 0.54] as [number, number, number], // cosmic-yellow
  moon: [0.62, 0.72, 1.0] as [number, number, number], // cosmic-glow-blue
  level: [0.79, 0.65, 1.0] as [number, number, number], // cosmic-accent
};
