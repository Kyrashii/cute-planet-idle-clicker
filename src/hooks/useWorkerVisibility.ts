import { useEffect, type RefObject } from "react";
import { sendWorkerCommand } from "../game/workerClient";

/**
 * Pauses the worker's timers while the tab is hidden and resumes them on return,
 * so a backgrounded tab doesn't build up a tick backlog that freezes on focus.
 */
export function useWorkerVisibility(workerRef: RefObject<Worker | null>) {
  useEffect(() => {
    const handleVisibility = () => {
      sendWorkerCommand(workerRef.current, {
        type: "SET_PAUSED",
        reason: "visibility",
        paused: document.hidden,
      });
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [workerRef]);
}
