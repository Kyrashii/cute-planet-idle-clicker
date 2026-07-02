import type { WorkerEvent } from "../game/protocol";

/**
 * Plain pub/sub tap on the worker's outgoing events. App publishes every
 * event before applyWorkerEvent; the effects layer (and adaptive audio)
 * subscribe imperatively so they never couple into React re-renders.
 *
 * UI-only pulses (roguelite juice) ride the same bus but stay out of the
 * worker protocol — the protocol remains the worker seam only.
 */
export interface RogueliteJuiceEvent {
  type: "ROGUELITE_JUICE";
  kind: "choice" | "victory" | "defeat" | "boss";
}

export type FxEvent = WorkerEvent | RogueliteJuiceEvent;

type Listener = (event: FxEvent) => void;

const listeners = new Set<Listener>();

export const effectsBus = {
  publish(event: FxEvent): void {
    listeners.forEach((listener) => listener(event));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
