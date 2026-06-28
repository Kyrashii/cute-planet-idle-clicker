# Roguelite (Galaxy Voyage)

The roguelite mode is a **self-contained module** under `src/roguelite/`, separate from
the core idle loop. It has its own `types.ts`, `engine.ts` (with `engine.test.ts`), and
`data.ts`.

## Entry

It unlocks once the planet reaches level 20 ("Galaxy Voyage"). Up to that point it's
gated off.

## Shape

- A **run** is a sequence of stations/encounters across acts, with boons/relics picked up
  along the way; a run ends in a win or loss.
- **Meta progression** persists across runs — totals (runs/wins/losses), how far the
  player has reached, and unlocks (relics, planet skins) that carry forward.

## Working in this module

- Keep roguelite logic inside `src/roguelite/`; don't entangle it with the core worker
  loop unless a change genuinely spans both.
- The engine is pure and unit-tested (`engine.test.ts`) — extend those tests when you
  change run logic.
- New run content (encounters, relics, etc.) is data in `src/roguelite/data.ts`, in the
  same data-driven spirit as `src/data/` (see `docs/adding-features.md`).
