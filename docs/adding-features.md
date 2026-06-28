# Adding a feature

Two common shapes of change: **new content** (data-driven, easy) and **new mechanic**
(crosses the worker seam).

## Adding content (animals, upgrades, recipes, cosmetics, events, zodiacs…)

Content is data, not code. Add a row to the relevant file under `src/data/` and let the
existing systems consume it. Things to remember:

- Fill in **both** the English and German fields (`name`/`germanName`,
  `description`/`germanDescription`, etc.) — see `docs/glossary.md`.
- Costs scale via the shared cost helpers (e.g. `calculateCost`) — reuse them rather than
  re-deriving the curve.
- If the content has tests (e.g. `src/data.test.ts`), update or extend them.

No worker-protocol change is needed when you're only adding content the existing systems
already handle.

## Adding a mechanic (new worker command)

When the player can do something new that changes authoritative game state, route it
through the protocol seam (see `docs/architecture.md`):

1. **Define the message.** Add a `WorkerCommand` variant (and, if the worker reports a
   result, a `WorkerEvent` variant) in `src/game/protocol.ts`.
2. **Handle the command.** Add a reducer/handler in `src/game/workerActions.ts` that
   computes the next state. Keep the math in a pure helper under `src/game/` so it can be
   unit-tested.
3. **Emit a result if needed.** Have the worker send back a `WorkerEvent`.
4. **Apply it in React.** Route the event in `src/game/applyWorkerEvent.ts` to update the
   relevant client state.
5. **Wire the UI.** Send the command from a component/hook and render the result. Modals
   live in `src/components/modals/`; their open/close state is centralised in
   `src/hooks/useModalState.ts`.

Add a unit test for the new pure logic, then run `npm run check`.

## Where things live

- Hooks: `src/hooks/` (e.g. `useModalState`, `useFloatingTexts`, `useFirebaseSync`).
- UI: `src/components/` with modals under `src/components/modals/` and shared bits under
  `src/components/ui/`.
- Pure logic: `src/game/`. Content/config: `src/data/`. Roguelite: `src/roguelite/`
  (self-contained — see `docs/roguelite.md`).
