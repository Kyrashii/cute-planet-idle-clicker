import type { WorkerCommand, WorkerEvent, WorkerEventType } from "./protocol";

const WORKER_EVENT_TYPES = new Set<WorkerEventType>([
  "STATE_UPDATE",
  "STAR_TRIGGER",
  "MOON_TRIGGER",
  "CLICK_EFFECT",
  "SUPER_CLICK_TRIGGERED",
  "LEVEL_UP",
  "EVENT_TRIGGER",
  "COSMETIC_FOUND",
  "LOOTBOXES_OPENED",
  "CRAFTED_ITEMS_OPENED",
  "BLACK_HOLE_GAMBLE_RESULT",
]);

export function sendWorkerCommand(worker: Worker | null | undefined, command: WorkerCommand): void {
  worker?.postMessage(command);
}

export function isWorkerEvent(value: unknown): value is WorkerEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const type = (value as { type?: unknown }).type;
  return typeof type === "string" && WORKER_EVENT_TYPES.has(type as WorkerEventType);
}
