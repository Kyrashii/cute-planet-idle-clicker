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

See `docs/adding-features.md` for the step-by-step recipe to add a mechanic across this
seam.
