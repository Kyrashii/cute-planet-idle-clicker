import type { WorkerEvent } from "../game/protocol";

/**
 * Plain pub/sub tap on the worker's outgoing events. App publishes every
 * event before applyWorkerEvent; the effects layer (and adaptive audio)
 * subscribe imperatively so they never couple into React re-renders.
 */
type Listener = (event: WorkerEvent) => void;

const listeners = new Set<Listener>();

export const effectsBus = {
  publish(event: WorkerEvent): void {
    listeners.forEach((listener) => listener(event));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
