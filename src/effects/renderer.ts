export interface SkyUniforms {
  time: number;
  /** 0..1 blended day/night factor (1 = deep night). */
  night: number;
  /** 0..100 progress through the current day/night half-cycle. */
  cycleProgress: number;
  /** Additive nebula tint while a cosmic event runs. */
  eventTint: [number, number, number, number];
}

export interface EffectsRenderer {
  readonly kind: "webgpu" | "webgl2";
  resize(width: number, height: number): void;
  /** Sky role: full-viewport starfield/nebula shader. */
  renderSky(uniforms: SkyUniforms): void;
  /** FX role: instanced particle quads from the packed buffer. */
  renderFx(buffer: Float32Array, count: number): void;
  dispose(): void;
}

export type RendererRole = "sky" | "fx";
