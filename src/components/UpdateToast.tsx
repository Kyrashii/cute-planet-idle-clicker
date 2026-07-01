import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Non-blocking update prompt: a new service worker waits until the player
 * opts in, so a mid-session deploy never reloads the game under them.
 */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 game:bottom-6 left-1/2 z-70 flex -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-cosmic-accent/60 bg-cosmic-bg-mid/95 px-4 py-3 text-cosmic-text shadow-2xl backdrop-blur-md">
      <span className="text-xs font-bold">✨ Neue Version verfuegbar</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="min-h-9 cursor-pointer rounded-xl border border-cosmic-accent/60 bg-cosmic-accent/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cosmic-accent transition hover:bg-cosmic-accent/30 active:bg-cosmic-accent/40"
      >
        Aktualisieren
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="min-h-9 cursor-pointer rounded-xl px-2 text-[11px] font-black uppercase tracking-wider text-cosmic-text-muted transition hover:text-cosmic-text"
      >
        Spaeter
      </button>
    </div>
  );
}
