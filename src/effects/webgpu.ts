/// <reference types="@webgpu/types" />
import type { EffectsRenderer, RendererRole, SkyUniforms } from "./renderer";
import { FLOATS_PER_PARTICLE, MAX_PARTICLES } from "./particles";

// WGSL mirrors of the WebGL2 shaders (see webgl2.ts for the commented math).
const SKY_WGSL = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  time: f32,
  night: f32,
  eventTint: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn vsMain(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let pos = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(pos * 2.0 - 1.0, 0.0, 1.0);
}

fn hash21(pIn: vec2f) -> f32 {
  var p = fract(pIn * vec2f(234.34, 435.345));
  p = p + dot(p, p + 34.23);
  return fract(p.x * p.y);
}

fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  var f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

fn starLayer(uv: vec2f, scale: f32, threshold: f32, time: f32) -> f32 {
  let grid = uv * scale;
  let cell = floor(grid);
  let rnd = hash21(cell);
  if (rnd < threshold) { return 0.0; }
  let center = cell + 0.5 + (vec2f(hash21(cell + 7.0), hash21(cell + 13.0)) - 0.5) * 0.8;
  let dist = length(grid - center);
  let twinkle = 0.55 + 0.45 * sin(time * (1.0 + rnd * 2.5) + rnd * 40.0);
  return smoothstep(0.09, 0.0, dist) * twinkle * smoothstep(threshold, 1.0, rnd);
}

@fragment
fn fsMain(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
  let uv = fragCoord.xy / u.resolution;
  let suv = uv * vec2f(u.resolution.x / u.resolution.y, 1.0);

  var stars = starLayer(suv + u.time * 0.002, 42.0, 0.965, u.time)
            + starLayer(suv - u.time * 0.0012, 90.0, 0.982, u.time) * 0.6;
  stars = stars * mix(0.12, 1.0, u.night);

  var neb = vnoise(suv * 2.4 + u.time * 0.008) * 0.6
          + vnoise(suv * 5.2 - u.time * 0.005) * 0.4;
  neb = pow(max(neb - 0.45, 0.0) * 1.8, 1.6);
  var nebColor = mix(vec3f(1.0, 0.62, 0.72), vec3f(0.55, 0.42, 0.95), uv.y);
  nebColor = mix(nebColor, u.eventTint.rgb, u.eventTint.a);
  let nebAlpha = neb * mix(0.05, 0.16, u.night);

  let starColor = mix(vec3f(1.0, 0.93, 0.96), vec3f(0.79, 0.65, 1.0), hash21(floor(suv * 42.0)));
  let color = starColor * stars + nebColor * nebAlpha;
  let alpha = clamp(stars * 0.9 + nebAlpha, 0.0, 1.0);
  return vec4f(color, alpha);
}
`;

const FX_WGSL = /* wgsl */ `
struct Uniforms { resolution: vec2f, pad: vec2f };
@group(0) @binding(0) var<uniform> u: Uniforms;

struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) corner: vec2f,
  @location(1) color: vec4f,
  @location(2) @interpolate(flat) shape: f32,
};

@vertex
fn vsMain(
  @builtin(vertex_index) vi: u32,
  @location(0) pos: vec2f,
  @location(1) sizeRot: vec2f,
  @location(2) color: vec4f,
  @location(3) shape: f32,
) -> VsOut {
  var corners = array<vec2f, 4>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(1.0, 1.0));
  let corner = corners[vi];
  let c = cos(sizeRot.y);
  let s = sin(sizeRot.y);
  let rotated = mat2x2f(c, -s, s, c) * (corner * sizeRot.x);
  let px = pos + rotated;
  let clip = (px / u.resolution) * 2.0 - 1.0;
  var out: VsOut;
  out.position = vec4f(clip.x, -clip.y, 0.0, 1.0);
  out.corner = corner;
  out.color = color;
  out.shape = shape;
  return out;
}

fn starSdf(pIn: vec2f) -> f32 {
  let p = vec2f(abs(pIn.x), pIn.y);
  let a = atan2(p.x, -p.y) / 6.2831853;
  let seg = abs(fract(a * 5.0) - 0.5) * 2.0;
  return length(p) - mix(0.45, 1.0, pow(1.0 - seg, 2.2));
}

fn heartSdf(pIn: vec2f) -> f32 {
  var p = vec2f(abs(pIn.x), -pIn.y + 0.25);
  let d = length(p - vec2f(0.25, 0.0)) - 0.55;
  return min(d, length(p - vec2f(0.0, -0.35)) - 0.62);
}

@fragment
fn fsMain(vin: VsOut) -> @location(0) vec4f {
  var mask: f32;
  if (vin.shape < 0.5) {
    mask = smoothstep(1.0, 0.0, length(vin.corner));
    mask = mask * mask;
  } else if (vin.shape < 1.5) {
    mask = smoothstep(0.12, -0.05, starSdf(vin.corner));
  } else {
    mask = smoothstep(0.1, -0.05, heartSdf(vin.corner));
  }
  let a = vin.color.a * mask;
  return vec4f(vin.color.rgb * a, a);
}
`;

export async function createWebGPURenderer(
  canvas: HTMLCanvasElement,
  role: RendererRole,
  adapter: GPUAdapter,
): Promise<EffectsRenderer | null> {
  const context = canvas.getContext("webgpu");
  if (!context) return null;
  const device = await adapter.requestDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const blend: GPUBlendState = {
    color: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
    alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
  };

  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  let pipeline: GPURenderPipeline;
  let instanceBuffer: GPUBuffer | null = null;

  if (role === "sky") {
    const module = device.createShaderModule({ code: SKY_WGSL });
    pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module, entryPoint: "vsMain" },
      fragment: { module, entryPoint: "fsMain", targets: [{ format, blend }] },
      primitive: { topology: "triangle-list" },
    });
  } else {
    const module = device.createShaderModule({ code: FX_WGSL });
    instanceBuffer = device.createBuffer({
      size: MAX_PARTICLES * FLOATS_PER_PARTICLE * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module,
        entryPoint: "vsMain",
        buffers: [
          {
            arrayStride: FLOATS_PER_PARTICLE * 4,
            stepMode: "instance",
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" },
              { shaderLocation: 1, offset: 8, format: "float32x2" },
              { shaderLocation: 2, offset: 16, format: "float32x4" },
              { shaderLocation: 3, offset: 32, format: "float32" },
            ],
          },
        ],
      },
      fragment: { module, entryPoint: "fsMain", targets: [{ format, blend }] },
      primitive: { topology: "triangle-strip" },
    });
  }
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  let width = canvas.width;
  let height = canvas.height;

  const beginPass = () => {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    return { encoder, pass };
  };

  return {
    kind: "webgpu",
    resize(w: number, h: number) {
      width = w;
      height = h;
    },
    renderSky(uniforms: SkyUniforms) {
      const data = new Float32Array(8);
      data.set([width, height, uniforms.time, uniforms.night], 0);
      data.set(uniforms.eventTint, 4);
      device.queue.writeBuffer(uniformBuffer, 0, data);
      const { encoder, pass } = beginPass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    renderFx(buffer: Float32Array, count: number) {
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([width, height, 0, 0]));
      const { encoder, pass } = beginPass();
      if (count > 0 && instanceBuffer) {
        device.queue.writeBuffer(
          instanceBuffer,
          0,
          buffer.buffer,
          buffer.byteOffset,
          count * FLOATS_PER_PARTICLE * 4,
        );
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, instanceBuffer);
        pass.draw(4, count);
      }
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    dispose() {
      instanceBuffer?.destroy();
      uniformBuffer.destroy();
      device.destroy();
    },
  };
}
