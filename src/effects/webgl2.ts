import type { EffectsRenderer, RendererRole, SkyUniforms } from "./renderer";
import { FLOATS_PER_PARTICLE, MAX_PARTICLES } from "./particles";

const SKY_VERT = `#version 300 es
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

// Hash-grid starfield with twinkle + two-octave value-noise nebula, additive
// over the transparent canvas (the CSS shell gradient stays underneath).
const SKY_FRAG = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uNight;
uniform vec4 uEventTint;
out vec4 outColor;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float starLayer(vec2 uv, float scale, float threshold) {
  vec2 grid = uv * scale;
  vec2 cell = floor(grid);
  float rnd = hash21(cell);
  if (rnd < threshold) return 0.0;
  vec2 center = cell + 0.5 + (vec2(hash21(cell + 7.0), hash21(cell + 13.0)) - 0.5) * 0.8;
  float dist = length(grid - center);
  float twinkle = 0.55 + 0.45 * sin(uTime * (1.0 + rnd * 2.5) + rnd * 40.0);
  return smoothstep(0.09, 0.0, dist) * twinkle * smoothstep(threshold, 1.0, rnd);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 suv = uv * aspect;

  float stars = starLayer(suv + uTime * 0.002, 42.0, 0.965)
              + starLayer(suv - uTime * 0.0012, 90.0, 0.982) * 0.6;
  stars *= mix(0.12, 1.0, uNight);

  float neb = noise(suv * 2.4 + uTime * 0.008) * 0.6
            + noise(suv * 5.2 - uTime * 0.005) * 0.4;
  neb = pow(max(neb - 0.45, 0.0) * 1.8, 1.6);
  vec3 nebColor = mix(vec3(1.0, 0.62, 0.72), vec3(0.55, 0.42, 0.95), uv.y);
  nebColor = mix(nebColor, uEventTint.rgb, uEventTint.a);
  float nebAlpha = neb * mix(0.05, 0.16, uNight);

  vec3 starColor = mix(vec3(1.0, 0.93, 0.96), vec3(0.79, 0.65, 1.0), hash21(floor(suv * 42.0)));
  vec3 color = starColor * stars + nebColor * nebAlpha;
  float alpha = clamp(stars * 0.9 + nebAlpha, 0.0, 1.0);
  outColor = vec4(color, alpha);
}`;

const FX_VERT = `#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec2 aPos;
layout(location = 2) in vec2 aSizeRot;
layout(location = 3) in vec4 aColor;
layout(location = 4) in float aShape;
uniform vec2 uResolution;
out vec2 vCorner;
out vec4 vColor;
flat out float vShape;

void main() {
  float c = cos(aSizeRot.y), s = sin(aSizeRot.y);
  vec2 corner = mat2(c, -s, s, c) * (aCorner * aSizeRot.x);
  vec2 px = aPos + corner;
  vec2 clip = (px / uResolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vCorner = aCorner;
  vColor = aColor;
  vShape = aShape;
}`;

// Shape SDFs: 0 soft spark, 1 five-point star, 2 heart.
const FX_FRAG = `#version 300 es
precision highp float;
in vec2 vCorner;
in vec4 vColor;
flat in float vShape;
out vec4 outColor;

float starSdf(vec2 p) {
  p = vec2(abs(p.x), p.y);
  float a = atan(p.x, -p.y) / 6.2831853;
  float seg = abs(fract(a * 5.0) - 0.5) * 2.0;
  float r = length(p);
  return r - mix(0.45, 1.0, pow(1.0 - seg, 2.2));
}

float heartSdf(vec2 p) {
  p.y = -p.y + 0.25;
  p.x = abs(p.x);
  float d = length(p - vec2(0.25, 0.0)) - 0.55;
  return min(d, length(p - vec2(0.0, -0.35)) - 0.62);
}

void main() {
  float mask;
  if (vShape < 0.5) {
    mask = smoothstep(1.0, 0.0, length(vCorner));
    mask *= mask;
  } else if (vShape < 1.5) {
    mask = smoothstep(0.12, -0.05, starSdf(vCorner));
  } else {
    mask = smoothstep(0.1, -0.05, heartSdf(vCorner));
  }
  float a = vColor.a * mask;
  outColor = vec4(vColor.rgb * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader compile failed: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vert: string, frag: string): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`program link failed: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

export function createWebGL2Renderer(
  gl: WebGL2RenderingContext,
  role: RendererRole,
): EffectsRenderer {
  let width = gl.canvas.width;
  let height = gl.canvas.height;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let skyProgram: WebGLProgram | null = null;
  let fxProgram: WebGLProgram | null = null;
  let fxVao: WebGLVertexArrayObject | null = null;
  let instanceBuffer: WebGLBuffer | null = null;

  if (role === "sky") {
    skyProgram = link(gl, SKY_VERT, SKY_FRAG);
  } else {
    fxProgram = link(gl, FX_VERT, FX_FRAG);
    fxVao = gl.createVertexArray();
    gl.bindVertexArray(fxVao);

    const cornerBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_PARTICLES * FLOATS_PER_PARTICLE * 4, gl.DYNAMIC_DRAW);
    const stride = FLOATS_PER_PARTICLE * 4;
    // aPos (x, y)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);
    // aSizeRot (size, rotation)
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 8);
    gl.vertexAttribDivisor(2, 1);
    // aColor (r, g, b, alpha)
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 16);
    gl.vertexAttribDivisor(3, 1);
    // aShape
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 32);
    gl.vertexAttribDivisor(4, 1);
    gl.bindVertexArray(null);
  }

  return {
    kind: "webgl2",
    resize(w: number, h: number) {
      width = w;
      height = h;
      gl.viewport(0, 0, w, h);
    },
    renderSky(uniforms: SkyUniforms) {
      if (!skyProgram) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(skyProgram);
      gl.uniform2f(gl.getUniformLocation(skyProgram, "uResolution"), width, height);
      gl.uniform1f(gl.getUniformLocation(skyProgram, "uTime"), uniforms.time);
      gl.uniform1f(gl.getUniformLocation(skyProgram, "uNight"), uniforms.night);
      gl.uniform4f(gl.getUniformLocation(skyProgram, "uEventTint"), ...uniforms.eventTint);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    renderFx(buffer: Float32Array, count: number) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!fxProgram || !fxVao || count === 0) return;
      gl.useProgram(fxProgram);
      gl.uniform2f(gl.getUniformLocation(fxProgram, "uResolution"), width, height);
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer, 0, count * FLOATS_PER_PARTICLE);
      gl.bindVertexArray(fxVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
      gl.bindVertexArray(null);
    },
    dispose() {
      if (skyProgram) gl.deleteProgram(skyProgram);
      if (fxProgram) gl.deleteProgram(fxProgram);
      if (fxVao) gl.deleteVertexArray(fxVao);
      if (instanceBuffer) gl.deleteBuffer(instanceBuffer);
    },
  };
}
