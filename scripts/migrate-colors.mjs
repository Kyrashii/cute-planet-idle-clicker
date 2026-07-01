#!/usr/bin/env node
/**
 * One-off migration: rewrite arbitrary-hex Tailwind classes (`bg-[#1b1935]`,
 * `hover:text-[#caa5fe]/80`, …) to the @theme tokens in src/index.css or to
 * named Tailwind palette classes.
 *
 *   node scripts/migrate-colors.mjs          # dry run: frequency report + planned rewrites
 *   node scripts/migrate-colors.mjs --write  # apply rewrites in place
 *
 * Three mapping layers:
 *   1. exact @theme token matches (plus hand-mapped judgement calls),
 *   2. exact Tailwind palette matches -> named classes (semantic variety),
 *   3. nearest cosmic dark token for the long tail of one-off dark-purple
 *      surface shades (the drift this migration exists to remove).
 * Chromatic outliers (frame cosmetics: greens, steel blues, ambers) are
 * reported, never guessed.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const TOKEN_MAP = new Map(
  Object.entries({
    // Exact @theme token values
    "100d23": "cosmic-bg",
    "1b1935": "cosmic-surface",
    "201d43": "cosmic-surface-mid",
    252148: "cosmic-surface-hover",
    "2d1e38": "cosmic-border",
    caa5fe: "cosmic-accent",
    ab9fd2: "cosmic-accent-muted",
    ffeef4: "cosmic-text",
    b2b1da: "cosmic-text-muted",
    ff9db8: "cosmic-pink",
    fef08a: "cosmic-yellow",
    "1b1535": "cosmic-bg-mid",
    "0b0818": "cosmic-bg-deep",
    ffc8e6: "cosmic-glow-pink",
    "9db8ff": "cosmic-glow-blue",
    241038: "cosmic-ink",
    "34d399": "success",
    fb7185: "danger",
    fbbf24: "warning",
    "38bdf8": "info",
    fff5f8: "brand-bg",
    "6d4c41": "brand-brown",
    ffd1dc: "brand-pink",
    fff9c4: "brand-yellow",
    // Hand-mapped judgement calls (muted lavender text family, off-token accents)
    "8d82bd": "cosmic-accent-muted",
    "978aac": "cosmic-accent-muted",
    a599d1: "cosmic-accent-muted",
    b4a9cc: "cosmic-accent-muted",
    b4a8e2: "cosmic-accent-muted",
    b4addd: "cosmic-accent-muted",
    a2a0de: "cosmic-text-muted",
    d1cbeb: "cosmic-text-muted",
    c5bfe2: "cosmic-text-muted",
    c8bdf4: "cosmic-accent",
    d4c3ff: "cosmic-accent",
    e2dafb: "cosmic-accent",
    ffcbdc: "brand-pink",
    f15e75: "danger",
    "2c1d0a": "cosmic-gold-ink",
    251910: "cosmic-gold-ink",
  }),
);

// Tailwind v3-era palette hexes observed in the codebase -> named classes.
const PALETTE_MAP = new Map(
  Object.entries({
    f5d0fe: "fuchsia-200",
    fbcfe8: "pink-200",
    fecdd3: "rose-200",
    fef3c7: "amber-100",
    fde68a: "amber-200",
    e0f2fe: "sky-100",
    ec4899: "pink-500",
    f472b6: "pink-400",
    "8b5cf6": "violet-500",
    c084fc: "purple-400",
    "5b21b6": "violet-800",
    "4c1d95": "violet-900",
    "2e1065": "violet-950",
    "7e22ce": "purple-700",
    "6b21a8": "purple-800",
    "581c87": "purple-900",
    "3b0764": "purple-950",
    ef4444: "red-500",
    f97316: "orange-500",
    ea580c: "orange-600",
    "7c2d12": "orange-900",
    d97706: "amber-600",
    "78350f": "amber-900",
    "451a03": "amber-950",
    e11d48: "rose-600",
    "9d174d": "pink-800",
    "22c55e": "green-500",
    "06b6d4": "cyan-500",
    "14b8a6": "teal-500",
    "09090b": "zinc-950",
    faf5ff: "purple-50",
    fdf2f8: "pink-50",
    fff1f2: "rose-50",
    fff7ed: "orange-50",
    ffedd5: "orange-100",
    fffdf2: "amber-50",
    e0f7fa: "cyan-50",
    e8eaf6: "indigo-50",
    // Near-identical steel/indigo shades (ΔRGB <= 15 to the named hue)
    353174: "indigo-900",
    192248: "indigo-950",
    "10192e": "slate-900",
    "12233c": "slate-800",
    "0f1d2a": "slate-900",
    "152a44": "sky-950",
  }),
);

// Nearest-match candidates: the dark cosmic surface family only.
const DARK_TOKENS = [
  ["cosmic-bg", 0x10, 0x0d, 0x23],
  ["cosmic-bg-deep", 0x0b, 0x08, 0x18],
  ["cosmic-bg-mid", 0x1b, 0x15, 0x35],
  ["cosmic-surface", 0x1b, 0x19, 0x35],
  ["cosmic-surface-mid", 0x20, 0x1d, 0x43],
  ["cosmic-surface-hover", 0x25, 0x21, 0x48],
  ["cosmic-border", 0x2d, 0x1e, 0x38],
  ["cosmic-ink", 0x24, 0x10, 0x38],
];

function rgb(hex) {
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/** Dark, low-chroma, purple-hued: the surface-drift family. */
function isDarkPurple(r, g, b) {
  return Math.max(r, g, b) <= 0x60 && b >= r && r >= g * 0.8;
}

function nearestDarkToken(hex) {
  const [r, g, b] = rgb(hex);
  if (!isDarkPurple(r, g, b)) return null;
  let best = null;
  let bestDist = Infinity;
  for (const [token, tr, tg, tb] of DARK_TOKENS) {
    const dist = Math.hypot(r - tr, g - tg, b - tb);
    if (dist < bestDist) {
      bestDist = dist;
      best = token;
    }
  }
  return bestDist <= 40 ? best : null;
}

function resolve(hex) {
  if (hex.length !== 6) return null;
  const lower = hex.toLowerCase();
  return TOKEN_MAP.get(lower) ?? PALETTE_MAP.get(lower) ?? nearestDarkToken(lower);
}

const CLASS_RE = /([a-zA-Z0-9:_/[\]-]*?)-\[#([0-9a-fA-F]{3,8})\](\/\d{1,3})?/g;

const write = process.argv.includes("--write");
const files = walk("src");

const unmapped = new Map();
const mapped = new Map();
let rewrittenFiles = 0;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const next = source.replace(CLASS_RE, (full, prefix, hex, opacity = "") => {
    const token = resolve(hex);
    if (!token) {
      const key = `#${hex.toLowerCase()}`;
      unmapped.set(key, (unmapped.get(key) ?? 0) + 1);
      return full;
    }
    const replacement = `#${hex.toLowerCase()} -> ${token}`;
    mapped.set(replacement, (mapped.get(replacement) ?? 0) + 1);
    return `${prefix}-${token}${opacity}`;
  });
  if (next !== source && write) {
    writeFileSync(file, next);
    rewrittenFiles += 1;
  }
}

const sorted = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]);

console.log(`\n${write ? "Rewrote" : "Would rewrite"} classes in ${files.length} scanned files.`);
console.log("\nMapped replacements:");
for (const [key, count] of sorted(mapped)) console.log(`  ${String(count).padStart(4)}  ${key}`);
console.log("\nUnmapped hexes (hand-map or promote to a token):");
for (const [hex, count] of sorted(unmapped)) console.log(`  ${String(count).padStart(4)}  ${hex}`);
if (write) console.log(`\nFiles rewritten: ${rewrittenFiles}`);
