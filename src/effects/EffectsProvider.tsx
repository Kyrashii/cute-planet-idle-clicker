import React, { useEffect, useRef } from "react";
import { createRenderer, parseFxParams } from "./detect";
import type { EffectsRenderer } from "./renderer";
import { BURST_COLORS, ParticleSystem, mulberry32 } from "./particles";
import { effectsBus, type FxEvent } from "./effectsBus";

interface EffectsProviderProps {
  /** Low-memory / reduced-motion: don't mount canvases at all. */
  disabled: boolean;
}

const EVENT_TINTS: Record<string, [number, number, number, number]> = {
  meteor_shower: [1.0, 0.65, 0.35, 0.5],
  black_hole: [0.4, 0.2, 0.6, 0.6],
  star_rain: [1.0, 0.94, 0.54, 0.5],
};

function planetRect(): DOMRect | null {
  return document.getElementById("planet-container")?.getBoundingClientRect() ?? null;
}

/**
 * The GPU effects layer: a starfield/nebula sky canvas behind the UI (z-0)
 * and a particle canvas above the game surface but below modals (z-45).
 * WebGPU first, WebGL2 fallback, CSS-only when neither exists. One rAF
 * drives both; it pauses when hidden and halves resolution when slow.
 */
export const EffectsLayer: React.FC<EffectsProviderProps> = ({ disabled }) => {
  const skyRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);

  const params = parseFxParams(typeof window === "undefined" ? "" : window.location.search);
  const active = !disabled && params.mode !== "off";

  useEffect(() => {
    if (!active) return;
    const skyCanvas = skyRef.current;
    const fxCanvas = fxRef.current;
    if (!skyCanvas || !fxCanvas) return;

    let disposed = false;
    let sky: EffectsRenderer | null = null;
    let fx: EffectsRenderer | null = null;
    let raf = 0;
    let dprCap = 2;
    let degraded = false;

    const particles = new ParticleSystem(params.seed);
    const random = params.seed === undefined ? Math.random : mulberry32(params.seed + 1);
    const frozen = params.mode === "frozen";

    // Live inputs written by the bus subscription, read by the frame loop.
    let night = 0;
    let targetNight = 0;
    let eventTint: [number, number, number, number] = [0, 0, 0, 0];
    let cycleProgress = 0;
    let overlayActive = false;

    const spawnAtPlanet = (shape: 0 | 1 | 2, color: [number, number, number], count: number) => {
      if (overlayActive) return;
      const rect = planetRect();
      if (!rect) return;
      const x = rect.left + rect.width * (0.2 + random() * 0.6);
      const y = rect.top + rect.height * (0.2 + random() * 0.6);
      particles.spawnBurst({ x, y, count, speed: 140, shape, color, size: 9, life: 1.1 });
    };

    const unsubscribe = effectsBus.subscribe((event: FxEvent) => {
      switch (event.type) {
        case "STATE_UPDATE": {
          targetNight = event.state.isNight ? 1 : 0;
          cycleProgress = event.state.cycleProgress;
          const tint = event.state.activeEvent
            ? (EVENT_TINTS[event.state.activeEvent] ?? [0.79, 0.65, 1.0, 0.35])
            : [0, 0, 0, 0];
          eventTint = tint as [number, number, number, number];
          break;
        }
        case "CLICK_EFFECT": {
          if (overlayActive) break;
          const rect = planetRect();
          if (!rect) break;
          const crit = event.actualClickLife > 0 && random() < 0.15;
          particles.spawnBurst({
            x: rect.left + event.x,
            y: rect.top + event.y,
            count: crit ? 14 : 7,
            speed: crit ? 220 : 150,
            shape: 2,
            color: BURST_COLORS.click,
            size: crit ? 11 : 8,
            life: 0.9,
          });
          break;
        }
        case "STAR_TRIGGER":
          spawnAtPlanet(1, BURST_COLORS.star, 6);
          break;
        case "MOON_TRIGGER":
          spawnAtPlanet(0, BURST_COLORS.moon, 8);
          break;
        case "LEVEL_UP": {
          const rect = planetRect();
          if (!rect) break;
          particles.spawnBurst({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            count: 60,
            speed: 320,
            shape: 1,
            color: BURST_COLORS.level,
            size: 12,
            life: 1.6,
          });
          break;
        }
        default:
          break;
      }
    });

    const onOverlay = (e: Event) => {
      overlayActive = Boolean((e as CustomEvent).detail);
    };
    window.addEventListener("fx:overlay", onOverlay);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      for (const [canvas, renderer] of [
        [skyCanvas, sky],
        [fxCanvas, fx],
      ] as const) {
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        renderer?.resize(canvas.width, canvas.height);
      }
      return dpr;
    };

    let dpr = 1;
    const frameTimes: number[] = [];
    let last = performance.now();
    const start = last;

    const loop = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // Auto-degrade: p95 frame time > 24ms over a 5s window -> halve DPR once.
      if (!degraded) {
        frameTimes.push(dt * 1000);
        if (frameTimes.length > 300) {
          frameTimes.sort((a, b) => a - b);
          if (frameTimes[Math.floor(frameTimes.length * 0.95)] > 24) {
            degraded = true;
            dprCap = 1;
            dpr = resize();
          }
          frameTimes.length = 0;
        }
      }

      night = frozen ? targetNight : night + (targetNight - night) * Math.min(dt * 2, 1);
      const time = frozen ? 42 : (now - start) / 1000;

      sky?.renderSky({ time, night, cycleProgress, eventTint });
      const count = particles.step(frozen ? 0 : dt);
      // Instance positions are CSS pixels; scale to device pixels via resize DPR.
      if (fx) {
        if (dpr !== 1) {
          const buf = particles.buffer;
          for (let i = 0; i < count; i++) {
            const base = i * 9;
            scaled[base] = buf[base] * dpr;
            scaled[base + 1] = buf[base + 1] * dpr;
            scaled[base + 2] = buf[base + 2] * dpr;
            scaled[base + 3] = buf[base + 3];
            scaled[base + 4] = buf[base + 4];
            scaled[base + 5] = buf[base + 5];
            scaled[base + 6] = buf[base + 6];
            scaled[base + 7] = buf[base + 7];
            scaled[base + 8] = buf[base + 8];
          }
          fx.renderFx(scaled, count);
        } else {
          fx.renderFx(particles.buffer, count);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    const scaled = new Float32Array(particles.buffer.length);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!disposed) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    (async () => {
      const force = params.mode === "webgl2" || params.mode === "frozen" ? "webgl2" : undefined;
      sky = await createRenderer(skyCanvas, "sky", force, frozen);
      fx = await createRenderer(fxCanvas, "fx", force, frozen);
      if (disposed) {
        sky?.dispose();
        fx?.dispose();
        return;
      }
      if (!sky && !fx) return; // CSS fallback stays as-is
      skyCanvas.dataset.fxRenderer = sky?.kind ?? "none";
      dpr = resize();
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    })();

    const onContextLost = (e: Event) => {
      e.preventDefault();
      disposed = true;
      cancelAnimationFrame(raf);
    };
    skyCanvas.addEventListener("webglcontextlost", onContextLost);
    fxCanvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      unsubscribe();
      window.removeEventListener("fx:overlay", onOverlay);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      skyCanvas.removeEventListener("webglcontextlost", onContextLost);
      fxCanvas.removeEventListener("webglcontextlost", onContextLost);
      sky?.dispose();
      fx?.dispose();
    };
  }, [active, params.mode, params.seed]);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={skyRef}
        data-testid="fx-sky"
        className="pointer-events-none fixed inset-0 z-0 size-full "
        aria-hidden="true"
      />
      <canvas
        ref={fxRef}
        data-testid="fx-particles"
        className="pointer-events-none fixed inset-0 z-45 size-full "
        aria-hidden="true"
      />
    </>
  );
};

/** Signal the FX layer to stop spawning while a modal/overlay covers the game. */
export function setFxOverlayActive(active: boolean): void {
  window.dispatchEvent(new CustomEvent("fx:overlay", { detail: active }));
}
