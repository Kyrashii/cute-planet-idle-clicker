import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFirebaseSync } from "./useFirebaseSync";
import { getSaveKey, writeMeta, writeSave, readSave } from "../utils/persistence";

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockHandleFirestoreError = vi.fn();

let authCallback: ((user: any) => Promise<void> | void) | null = null;

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

vi.mock("firebase/firestore", () => ({
  doc: (_db: unknown, collection: string, id: string) => `${collection}/${id}`,
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  serverTimestamp: () => ({ __serverTimestamp: true }),
}));

vi.mock("../lib/firebase", () => ({
  auth: {},
  db: {},
  googleProvider: {},
  OperationType: {
    GET: "GET",
    CREATE: "CREATE",
    UPDATE: "UPDATE",
  },
  handleFirestoreError: (...args: any[]) => mockHandleFirestoreError(...args),
}));

const makeSnapshot = (data: Record<string, unknown> | null) => ({
  exists: () => data !== null,
  data: () => data,
});

const baseCloudSave = {
  userId: "user-1",
  life: 500,
  totalLifeEarned: 1000,
  starsCount: 5,
  purchasedAnimals: {},
  purchasedUpgrades: [],
  planetLevel: 7,
  planetExp: 10,
  clicksCount: 12,
  starClicksTriggered: 2,
  secondsPlayed: 90,
};

describe("useFirebaseSync", () => {
  beforeEach(() => {
    localStorage.clear();
    authCallback = null;
    mockGetDoc.mockReset();
    mockSetDoc.mockReset().mockResolvedValue(undefined);
    mockOnAuthStateChanged.mockReset().mockImplementation((_auth, cb) => {
      authCallback = cb;
      return vi.fn();
    });
    mockSignInWithPopup.mockReset().mockResolvedValue(undefined);
    mockSignOut.mockReset().mockResolvedValue(undefined);
    mockHandleFirestoreError.mockReset();
  });

  it("loads the cloud save when the cloud copy is newer for the same user", async () => {
    writeMeta({ activeOwnerId: "user-1", legacyMigrated: true });
    writeSave("user-1", {
      ...baseCloudSave,
      life: 50,
      totalLifeEarned: 500,
      lastSavedAt: 100,
    });
    mockGetDoc.mockResolvedValue(
      makeSnapshot({
        ...baseCloudSave,
        life: 999,
        updatedAt: 200,
        createdAt: { toMillis: () => 150 },
      }),
    );

    const loadSpy = vi.fn();
    window.addEventListener("firebase-load-state", loadSpy as EventListener);

    renderHook(() => useFirebaseSync());
    await act(async () => {
      await authCallback?.({ uid: "user-1", email: "user-1@example.com" });
    });

    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(1));
    expect((loadSpy.mock.calls[0][0] as CustomEvent).detail.life).toBe(999);
    window.removeEventListener("firebase-load-state", loadSpy as EventListener);
  });

  it("keeps the local slot active when it is newer for the same user", async () => {
    writeMeta({ activeOwnerId: "user-1", legacyMigrated: true });
    writeSave("user-1", {
      ...baseCloudSave,
      life: 777,
      lastSavedAt: 300,
    });
    mockGetDoc.mockResolvedValue(
      makeSnapshot({
        ...baseCloudSave,
        life: 500,
        updatedAt: 200,
        createdAt: { toMillis: () => 150 },
      }),
    );

    const loadSpy = vi.fn();
    window.addEventListener("firebase-load-state", loadSpy as EventListener);

    renderHook(() => useFirebaseSync());
    await act(async () => {
      await authCallback?.({ uid: "user-1", email: "user-1@example.com" });
    });

    await waitFor(() => expect(readSave("user-1")?.lastCloudUpdatedAt).toBe(200));
    expect(loadSpy).not.toHaveBeenCalled();
    window.removeEventListener("firebase-load-state", loadSpy as EventListener);
  });

  it("loads the cloud save when the user slot is missing", async () => {
    writeMeta({ activeOwnerId: "user-1", legacyMigrated: true });
    mockGetDoc.mockResolvedValue(
      makeSnapshot({
        ...baseCloudSave,
        updatedAt: 250,
        createdAt: { toMillis: () => 125 },
      }),
    );

    const loadSpy = vi.fn();
    window.addEventListener("firebase-load-state", loadSpy as EventListener);

    renderHook(() => useFirebaseSync());
    await act(async () => {
      await authCallback?.({ uid: "user-1", email: "user-1@example.com" });
    });

    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(1));
    window.removeEventListener("firebase-load-state", loadSpy as EventListener);
  });

  it("uploads the local slot when the cloud save is missing", async () => {
    writeMeta({ activeOwnerId: "user-1", legacyMigrated: true });
    writeSave("user-1", {
      ...baseCloudSave,
      lastSavedAt: 333,
    });
    mockGetDoc.mockResolvedValueOnce(makeSnapshot(null)).mockResolvedValueOnce(
      makeSnapshot({
        ...baseCloudSave,
        updatedAt: 444,
        createdAt: { toMillis: () => 222 },
      }),
    );

    renderHook(() => useFirebaseSync());
    await act(async () => {
      await authCallback?.({ uid: "user-1", email: "user-1@example.com" });
    });

    await waitFor(() => expect(mockSetDoc).toHaveBeenCalled());
    expect(mockSetDoc.mock.calls[0][0]).toBe("saves/user-1");
    expect(mockSetDoc.mock.calls[0][1]).toMatchObject({
      userId: "user-1",
      life: baseCloudSave.life,
    });
  });

  it("treats a corrupt local slot like a missing one and loads the cloud save", async () => {
    writeMeta({ activeOwnerId: "user-1", legacyMigrated: true });
    localStorage.setItem(getSaveKey("user-1"), "{broken");
    mockGetDoc.mockResolvedValue(
      makeSnapshot({
        ...baseCloudSave,
        updatedAt: 500,
        createdAt: { toMillis: () => 100 },
      }),
    );

    const loadSpy = vi.fn();
    window.addEventListener("firebase-load-state", loadSpy as EventListener);

    renderHook(() => useFirebaseSync());
    await act(async () => {
      await authCallback?.({ uid: "user-1", email: "user-1@example.com" });
    });

    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(1));
    window.removeEventListener("firebase-load-state", loadSpy as EventListener);
  });

  it("opens an account-switch prompt when a meaningful guest save exists", async () => {
    writeMeta({ activeOwnerId: null, legacyMigrated: true });
    writeSave(null, {
      ...baseCloudSave,
      planetLevel: 11,
      totalLifeEarned: 5000,
      secondsPlayed: 400,
      lastSavedAt: 999,
    });
    mockGetDoc.mockResolvedValue(makeSnapshot(null));

    const { result } = renderHook(() => useFirebaseSync());
    await act(async () => {
      await authCallback?.({ uid: "user-1", email: "user-1@example.com" });
    });

    await waitFor(() =>
      expect(result.current.accountSwitchPrompt?.previousLocalSave.planetLevel).toBe(11),
    );
    expect(result.current.accountSwitchPrompt?.previousOwnerId).toBeNull();
  });
});
