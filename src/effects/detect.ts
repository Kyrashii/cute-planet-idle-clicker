/// <reference types="@webgpu/types" />
import type { EffectsRenderer, RendererRole } from "./renderer";

export type FxMode = "auto" | "webgl2" | "off" | "frozen";

export interface FxParams {
  mode: FxMode;
  seed: number | undefined;
}

/** Parse ?fx=off|webgl2|frozen&fxseed=N for tests and debugging. */
export function parseFxParams(search: string): FxParams {
  const params = new URLSearchParams(search);
  const raw = params.get("fx");
  const mode: FxMode = raw === "off" || raw === "webgl2" || raw === "frozen" ? raw : "auto";
  const seedRaw = params.get("fxseed");
  const seed = seedRaw === null ? undefined : Number(seedRaw) || 0;
  return { mode, seed };
}

export async function createRenderer(
  canvas: HTMLCanvasElement,
  role: RendererRole,
  force?: "webgl2",
  preserveDrawingBuffer = false,
): Promise<EffectsRenderer | null> {
  if (force !== "webgl2" && typeof navigator !== "undefined" && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        const { createWebGPURenderer } = await import("./webgpu");
        const renderer = await createWebGPURenderer(canvas, role, adapter);
        if (renderer) return renderer;
      }
    } catch {
      // fall through to WebGL2
    }
  }
  try {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer,
    });
    if (!gl) return null;
    const { createWebGL2Renderer } = await import("./webgl2");
    return createWebGL2Renderer(gl, role);
  } catch {
    return null;
  }
}
