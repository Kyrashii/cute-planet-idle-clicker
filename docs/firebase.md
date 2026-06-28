# Firebase: auth, Firestore, cloud sync

Firebase is **optional** — the game runs fully on `localStorage` without it. When the
player signs in, saves sync to Firestore. Init lives in `src/lib/firebase.ts`; sync
behaviour in `src/hooks/useFirebaseSync.ts`.

## Config & env

- Public client config is committed at `firebase-applet-config.json`.
- For local development you can override it with `VITE_FIREBASE_*` vars in `.env.local`
  (gitignored) — e.g. `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, and optionally
  `VITE_FIREBASE_DATABASE_ID` for a named Firestore database.
- Other env vars (see `.env.example`): `GEMINI_API_KEY`, `APP_URL`.

Anything prefixed `VITE_` is exposed to the client bundle — never put a secret there.

## Auth

Google sign-in only. Auth state drives whether cloud sync runs and which save slot is
active.

## Firestore data model

Three collections, all keyed by user id:

- `saves/{userId}` — the player's private save (owner-only read/write).
- `leaderboard/{userId}` — owner writes their own row; signed-in users can read.
- `profiles/{userId}` — public-ish profile (owner writes; signed-in reads), including a
  capped set of placed enclosure animals.

Access is enforced by `firestore.rules`, which also validates document shape. If you change
what gets written, update the rules and their shape validators in the same change.

## Cloud sync behaviour

- On sign-in, the newer of cloud vs. local wins; the loser is updated.
- After that, local state uploads to the cloud on an interval (roughly once a minute).
- Switching accounts when a meaningful save exists prompts a conflict dialog rather than
  silently overwriting.

## Deploying rules

`firestore.rules` deploys via `npm run deploy:rules` (`firebase deploy --only
firestore:rules`). CI also auto-deploys rules on pushes to `main` that touch the rules /
Firebase config (`.github/workflows/deploy-rules.yml`, using the `FIREBASE_SERVICE_ACCOUNT`
secret).
