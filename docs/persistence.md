# Persistence: saves, reset, offline earnings

Saving is meant to be invisible — game state autosaves locally and (when signed in) syncs
to the cloud. The relevant code lives in `src/utils/persistence.ts`,
`src/utils/offline.ts`, and the hydrate/reset logic in `src/App.tsx`. Firebase specifics
are in `docs/firebase.md`.

## Local saves

`localStorage` holds the source of truth on-device:

- Guest progress: `cute_planet_save_guest`.
- Signed-in users: a per-user slot, `cute_planet_save_user_<uid>`.
- Coordination metadata: `cute_planet_save_meta`.
- A legacy global key (`cute_planet_save`) is migrated forward when found.

Saves are **versioned** (`SAVE_VERSION`, currently 3) with migration logic, so older saves
load into the current shape. When you change the persisted save shape, bump the version
and add a migration rather than breaking existing players.

Autosave writes to `localStorage` on a short interval (a few seconds).

## Hydrate and reset

- `hydrateClientStateFromSave(...)` (in `App.tsx`) rebuilds the React/client state
  (cosmetics, enclosure animals, missions, etc.) from a loaded save.
- `resetHydratedClientState()` wipes that client state for a hard reset.
- Prestige resets run progress while granting the prestige bonus; a full reset clears
  everything (the reset dialog confirms first).

When the worker and persistence both touch the same state on load, be careful about
ordering — a late load must not clobber freshly placed state (this class of bug has bitten
the enclosure before).

## Offline earnings

While the tab is hidden/closed, time still "passes." `src/utils/offline.ts` replays the
same LPS calculation the worker uses to award earnings for elapsed time on the next load,
so offline progress matches online progress.
