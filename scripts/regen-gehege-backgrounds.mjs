#!/usr/bin/env node
/**
 * Regenerate the two Gehege landscape backgrounds at desktop resolution.
 *
 *   node scripts/regen-gehege-backgrounds.mjs
 *
 * The 2026-07 asset migration (optimize-assets.mjs) shrank them to 512px,
 * which upscales badly in the up-to-1024px-wide Gehege modal. The source
 * PNGs (1672x941) live only in git history — this script reads them from
 * the commit before the migration and writes:
 *
 *   gehegelandschaft_{tag,nacht}.webp      1536w (desktop, existing name)
 *   gehegelandschaft_{tag,nacht}_512.webp   512w (mobile srcset entry)
 *
 * WebP settings mirror optimize-assets.mjs, which only walks .png files,
 * so re-running that script cannot shrink these again.
 */
import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import sharp from "sharp";

const SOURCE_COMMIT = "b88099d~1";
const NAMES = ["gehegelandschaft_tag", "gehegelandschaft_nacht"];
const WEBP_OPTIONS = { quality: 82, alphaQuality: 90, effort: 6 };

for (const name of NAMES) {
  const png = execSync(`git show ${SOURCE_COMMIT}:public/assets/stuff/${name}.png`, {
    maxBuffer: 64 * 1024 * 1024,
  });

  const targets = [
    { width: 1536, out: `public/assets/stuff/${name}.webp` },
    { width: 512, out: `public/assets/stuff/${name}_512.webp` },
  ];

  for (const { width, out } of targets) {
    await sharp(png).resize({ width, withoutEnlargement: true }).webp(WEBP_OPTIONS).toFile(out);
    const kb = (statSync(out).size / 1024).toFixed(0);
    console.log(`${out}: ${width}w, ${kb} KB`);
  }
}
