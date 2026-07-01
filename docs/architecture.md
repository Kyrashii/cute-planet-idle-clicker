# Architecture

The game is split across two threads. Understanding this seam explains most of the
codebase.

## Two-tier model

- **React main thread** — rendering and UI-only state (which modal is open, drag state,
  display preferences). It is mostly a view over the worker's state. `src/App.tsx` is the
  orchestrator that owns the worker connection and the hydrated client state.
- **Web Worker** (`src/game.worker.ts`) — the authoritative game simulation. It ticks a
  few times per second, advances timers, computes life-per-second (LPS), and broadcasts
  the new state. Keeping the simulation off the main thread is why clicking stays smooth.

The two sides never share objects — they exchange typed messages.

## The worker protocol (single source of truth)

`src/game/protocol.ts` defines the entire contract:

- `WorkerCommand` — messages the UI sends to the worker (`CLICK`, `BUY_ANIMAL`,
  `PRESTIGE`, crafting, etc.).
- `WorkerEvent` — messages the worker sends back (`STATE_UPDATE`, `STAR_TRIGGER`,
  level-ups, crafted-item results, etc.).
- `WorkerGameState` / the state payload — the authoritative game-state shapes.

Because both sides import these types, a payload mismatch is a **compile error** rather
than a silent runtime bug. Treat this file as the contract: change it deliberately and
keep both producers and consumers in step.

## Applying worker events back to React

The worker's outgoing events are dispatched through `src/game/applyWorkerEvent.ts`
(`applyWorkerEvent(event, handlers)`), which routes each event type to the handler that
updates the corresponding React state. New events are wired up here.

## Pure game logic

The simulation's math lives in small, testable, side-effect-free modules under
`src/game/` — e.g. `engine.ts` (level/XP), `statsCalculator.ts` (LPS / click power /
multipliers), `workerActions.ts` (command reducers), plus `planetTasks.ts`,
`achievements.ts`, and `itemHandlers.ts`. Because they're pure, they're unit-tested
directly.

## Performance notes

- `statsCalculator` is the hot path (it runs on every tick). It uses `Set`/`Map` lookups
  instead of array scans and hoists constants to module scope. It is covered by
  **characterization tests** (inline snapshots) so performance refactors are proven to
  stay behaviour-identical — keep those snapshots passing.
- `GameStateContext` (`src/contexts/`) exposes only the values that change every tick, so
  memoized/closed modals don't re-render on each tick. Prefer this pattern over threading
  fast-changing state through deep prop trees.
- For broader React/Next.js performance guidance, consult the bundled skill at
  `.agents/skills/vercel-react-best-practices/`.

## UI state seams

- **Modal stack** — `src/hooks/useModalStack.ts` holds the ordered stack of open
  modals; browser/Android back closes the top one via a single history sentinel.
  `useModalState` adapts it to the legacy flag/setter names. The shared
  `src/components/ui/Modal.tsx` presents as a centred dialog or (below the 900px
  `game` breakpoint, with `presentation="auto"`) a drag-dismissable bottom sheet.
- **Hot store** — the six per-tick scalars (`life`, `totalLifeEarned`,
  `secondsPlayed`, `planetExp`, `cycleProgress`, `eventTimeRemaining`) land in
  `src/game/hotStore.ts` on every worker tick; React propagation is gated to
  ~1 Hz so the App tree doesn't reconcile 4x/s. Fast-visible leaves subscribe
  via `useHotStat` for the full tick rate.
- **Effects bus** — `src/effects/effectsBus.ts` re-publishes every WorkerEvent
  before `applyWorkerEvent`; the GPU effects layer and the adaptive audio
  engine subscribe imperatively, outside React.

## Effects layer

`src/effects/` renders a starfield/nebula sky canvas (z-0) and an instanced
particle canvas (z-45) — WebGPU first, WebGL2 fallback, CSS-only when neither
exists or animations are disabled. `?fx=off|webgl2|frozen&fxseed=N` control it
for tests. Spawning pauses while modals are open; hidden tabs pause the loop.

## Audio engine

`src/utils/audio.ts` is a facade over `src/audio/`: a shared bus graph with
compressor + generated-impulse reverb (`engine.ts`), a pure seeded step
planner for generative chords/bells/melodies (`theory.ts`), a play-intensity
model fed by the effects bus (`adaptive.ts`), and parameterized SFX
(`sfx.ts`). Still zero audio assets.

## Deployment

The app deploys to **Vercel** as a fully static site: `npm run build` produces the Vite
client bundle in `dist/`, and `vercel.json` pins the build command, output directory,
SPA fallback rewrite, and caching headers. There is no server-side runtime in
production — the Express server (`server.ts`) is a dev convenience (`npm run dev`) and a
local prod-smoke tool (`npm run build && npm run build:server && npm start`). Firestore
security rules deploy separately via `.github/workflows/deploy-rules.yml`.

See `docs/adding-features.md` for the step-by-step recipe to add a mechanic across this
seam.
