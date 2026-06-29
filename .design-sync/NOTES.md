# design-sync notes — Pastell-Kosmos Design System

Target project: **Pastell-Kosmos Design System** (`f18f45b6-211d-4aad-b64e-66701c2b50ab`).
This repo **is** that design system. The project is a **bespoke, hand-authored** Claude Design
layout — **not** `/design-sync` converter output.

## Do NOT run the converter
`package-build.mjs` / `resync.mjs` would emit a different layout (`components/<group>/<Name>/`,
`_preview/`, `_vendor/`, `_ds_sync.json`) that conflicts with this project's structure. Future
syncs must **hand-author files matching the existing conventions** and verify by rendering.

## Project layout conventions (match these)
- `_ds_manifest.json` — the card/component index. **Auto-recompiled by the app's self-check**
  from each preview HTML's **first-line `<!-- @dsCard group="…" … -->`** marker (and optional
  second-line `<!-- @startingPoint … -->`). Trigger recompile by writing the `_ds_needs_recompile`
  sentinel. **Do not hand-edit the manifest** (risks the existing components).
- `components/<group>/<Name>.{jsx,d.ts,prompt.md}` + a per-group `<group>.card.html`.
- `ui_kits/<kit>/` — standalone interactive HTML "screens" (full `<!DOCTYPE html>`), load React/etc.
  from CDN + `_ds_bundle.js` on `window.PastellKosmosDesignSystem_f18f45`, link `../../styles.css`.
- `styles.css` only `@import`s `tokens/*.css` (CSS custom-property tokens, **no Tailwind layer**).
- No `_ds_sync.json` anchor — this format doesn't use one.

## Roguelite kit (`ui_kits/roguelite/`) — how it was built
Build scripts live in `.design-sync/build/` (re-run to regenerate; outputs land in `.design-sync/stage/`):
- `entry.ts` → `esbuild --bundle --format=iife --global-name=PKRoguelite --jsx=automatic --minify
  --loader:.png=dataurl` → `_bundle.js` (~445 KB). **Bundles its own React 19** and exposes it on
  `window.PKRoguelite` so the kit HTML uses a single React instance. React 19 has no UMD, so unlike
  `ui_kits/game` there is **no CDN React/Babel** — the kit is plain JS via `harness.js`.
- `gen-fixtures.ts` (run with `tsx`) drives the real engine (`createNewRun`, `pickPath`,
  `chooseEncounterOption`) to capture real `meta/encounter/path/boss` states; victory/defeat overlay
  `phase`+`rewardPackage` on an advanced run with curated real boons → `fixtures.js`.
- `build-css.mjs` — **dedicated Tailwind v4 compile** (`@tailwindcss/node` `compile` +
  `@tailwindcss/oxide` `Scanner`) scanning `src/components/roguelite/**`, with the cosmic `@theme`
  from `src/index.css` → `roguelite.css` (~71 KB). **Required** because the roguelite components
  style with Tailwind utilities (not inline styles like the game kit), and the app's own `vite build`
  only **partially** scans this dir (it's untracked in git).
- `make-html.mjs` → the 9 cards (`index.html` interactive + 8 fixed steps) with `@dsCard`/
  `@startingPoint` markers, group **"Roguelite"**, viewport 1200x780.
- `harness.js` — `PK_mountStatic` (one fixed step) + `PK_mountInteractive` (real engine wired to
  React state; fully playable). Also rewrites the components' hardcoded absolute
  `/assets/roguelite/*.png` `<img>` srcs to the shipped WebP copies.
- `compress-assets.mjs` — downscales the 2 `<img>` assets to WebP (chest, boss comet). The heavy
  background PNGs (`/assets/roguelite/*.png`, ~10 MB) are **skipped**; the component has a CSS
  gradient fallback that looks correct.
- `shoot.mjs` — Playwright screenshot harness used to render-verify every card.

## Gotchas
- First-run coach overlay (`localStorage["cute_planet_roguelite_coach_seen"]`) is pre-seeded on the
  static `encounter.html`/`boss.html` cards so choices aren't obscured; the interactive card lets it
  surface naturally.
- The boss fixture shows `Akt 2 von 3` + `AKT-1-BOSS` — authentic engine state at the act boundary.

## Possible future enhancement (skipped to keep this sync purely additive)
- Add a "Galaxie-Roguelite" section to `README.md` and `SKILL.md` so the design agent's prose docs
  mention the kit (the cards already self-register via `@dsCard`).
