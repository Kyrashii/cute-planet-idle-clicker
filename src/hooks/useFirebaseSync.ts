import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "../lib/firebase";
import { buildPublicProfile } from "../utils/publicProfile";
import type { GameSaveSnapshot } from "../types";
import {
  type RawSave,
  type SaveOwnerId,
  migrateSave,
  normalizeCloudTimestamp,
  readMeta,
  readSave,
  writeSave,
} from "../utils/persistence";

const resolveDisplayName = (user: User | null): string =>
  user?.displayName || (user?.email ? user.email.split("@")[0] : "Anonymes Wesen");

export type CloudSaveData = GameSaveSnapshot & {
  userId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export interface AccountSwitchPrompt {
  nextUserId: string;
  previousOwnerId: SaveOwnerId;
  previousLocalSave: RawSave;
}

const isMeaningfulSave = (save: RawSave | null): save is RawSave =>
  save !== null &&
  ((Number(save.totalLifeEarned) || 0) >= 100 || (Number(save.secondsPlayed) || 0) >= 30);

const stripUndefined = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefined(entry)]),
  );
};

export const buildCloudPayload = (
  source: Record<string, unknown>,
  uid: string,
  createdAt: unknown,
): CloudSaveData => {
  const migrated = migrateSave(source, uid);
  if (!migrated) throw new TypeError("Cannot upload an invalid save payload");
  return {
    ...(stripUndefined(migrated) as GameSaveSnapshot),
    userId: uid,
    createdAt,
    updatedAt: serverTimestamp(),
  };
};

export const toLocalMirror = (
  data: CloudSaveData,
  ownerId: SaveOwnerId,
  fallbackLastSavedAt?: number,
): RawSave => {
  const migrated = migrateSave(
    {
      ...data,
      ownerId,
      lastSavedAt: fallbackLastSavedAt ?? normalizeCloudTimestamp(data.updatedAt) ?? Date.now(),
      lastCloudUpdatedAt: normalizeCloudTimestamp(data.updatedAt),
    },
    ownerId,
  );
  if (!migrated) throw new TypeError("Cannot mirror an invalid cloud save");
  return migrated;
};

export function useFirebaseSync() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [cloudSaveFound, setCloudSaveFound] = useState<CloudSaveData | null>(null);
  const [accountSwitchPrompt, setAccountSwitchPrompt] = useState<AccountSwitchPrompt | null>(null);

  const userRef = useRef<User | null>(null);
  const isSavingRef = useRef(false);
  const saveCreatedAtRef = useRef<unknown>(null);

  const updateSaveCreatedAt = (value: unknown) => {
    saveCreatedAtRef.current = value;
  };

  const triggerCloudStateLoad = (data: CloudSaveData) => {
    window.dispatchEvent(
      new CustomEvent("firebase-load-state", {
        detail: { data, ownerId: data.userId },
      }),
    );

    const updatedAt = normalizeCloudTimestamp(data.updatedAt);
    setLastSynced(updatedAt ? new Date(updatedAt) : new Date());
  };

  const syncLeaderboard = async (uid: string, payload: Record<string, unknown>) => {
    try {
      const leaderboardRef = doc(db, "leaderboard", uid);
      const displayName = resolveDisplayName(userRef.current);

      await setDoc(leaderboardRef, {
        userId: uid,
        userName: displayName,
        totalLifeEarned: Number(payload.totalLifeEarned || 0),
        prestigeCount: Number(payload.prestigeCount || 0),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Leaderboard sync failed:", error);
    }
  };

  const syncPublicProfile = async (uid: string, payload: Record<string, unknown>) => {
    try {
      const profileRef = doc(db, "profiles", uid);
      const displayName = resolveDisplayName(userRef.current);

      await setDoc(profileRef, {
        ...buildPublicProfile(payload, uid, displayName),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Profile sync failed:", error);
    }
  };

  const uploadCurrentLocalState = async (uid: string, sourceSave?: RawSave | null) => {
    const localSave = sourceSave ?? readSave(uid);
    if (!localSave) return;

    try {
      setSyncing(true);
      const docRef = doc(db, "saves", uid);
      const resolvedCreatedAt =
        saveCreatedAtRef.current || cloudSaveFound?.createdAt || serverTimestamp();
      const payload = buildCloudPayload(localSave, uid, resolvedCreatedAt);

      await setDoc(docRef, payload);
      await syncLeaderboard(uid, localSave);
      await syncPublicProfile(uid, localSave);

      setCloudSaveFound(payload);
      setLastSynced(new Date());

      updateSaveCreatedAt(resolvedCreatedAt);
      writeSave(uid, {
        ...localSave,
        lastCloudUpdatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to upload local save:", error);
      try {
        handleFirestoreError(error, OperationType.CREATE, `saves/${uid}`);
      } catch {}
    } finally {
      setSyncing(false);
    }
  };

  const resolveCurrentUserSave = async (currentUser: User) => {
    setSyncing(true);
    const localSave = readSave(currentUser.uid);
    const docRef = doc(db, "saves", currentUser.uid);

    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setCloudSaveFound(null);
        if (localSave) {
          await uploadCurrentLocalState(currentUser.uid, localSave);
        }
        return;
      }

      const cloudData = docSnap.data() as CloudSaveData;
      setCloudSaveFound(cloudData);
      updateSaveCreatedAt(cloudData.createdAt || null);

      const cloudUpdatedAt = normalizeCloudTimestamp(cloudData.updatedAt) ?? 0;
      if (cloudUpdatedAt > 0) {
        setLastSynced(new Date(cloudUpdatedAt));
      }

      if (!localSave) {
        triggerCloudStateLoad(cloudData);
        return;
      }

      const localUpdatedAt = Number(localSave.lastSavedAt) || 0;
      if (cloudUpdatedAt > localUpdatedAt) {
        triggerCloudStateLoad(cloudData);
        return;
      }

      if (cloudUpdatedAt > 0) {
        writeSave(currentUser.uid, {
          ...localSave,
          lastCloudUpdatedAt: cloudUpdatedAt,
        });
      }
    } catch (error) {
      console.error("Failed to check cloud save:", error);
      try {
        handleFirestoreError(error, OperationType.GET, `saves/${currentUser.uid}`);
      } catch {}
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const meta = readMeta();
      const previousOwnerId = meta.activeOwnerId;
      const previousSave =
        previousOwnerId !== (currentUser?.uid ?? null) ? readSave(previousOwnerId) : null;

      setUser(currentUser);
      userRef.current = currentUser;
      setAuthLoading(false);

      if (currentUser) {
        await resolveCurrentUserSave(currentUser);

        if (isMeaningfulSave(previousSave)) {
          setAccountSwitchPrompt({
            nextUserId: currentUser.uid,
            previousOwnerId,
            previousLocalSave: previousSave,
          });
        } else {
          setAccountSwitchPrompt(null);
        }
      } else {
        setCloudSaveFound(null);
        setAccountSwitchPrompt(null);
        updateSaveCreatedAt(null);
        setLastSynced(null);
      }
    });

    return unsubscribe;
    // Mount-only: subscribe to auth state exactly once. `resolveCurrentUserSave` is invoked with
    // the callback's fresh `currentUser`, so it does not belong in the dependency array — depending
    // on it (or memoizing it) would re-register the auth listener whenever cloud state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = async () => {
    setSyncing(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Popup Authentication failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const logout = async () => {
    setSyncing(true);
    try {
      await signOut(auth);
      setLastSynced(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setSyncing(false);
    }
  };

  const saveStateToCloud = async (state: GameSaveSnapshot): Promise<boolean> => {
    const activeUser = userRef.current;
    if (!activeUser || isSavingRef.current) return false;
    const uid = activeUser.uid;
    isSavingRef.current = true;

    const docRef = doc(db, "saves", uid);
    try {
      setSyncing(true);

      let resolvedCreatedAt = saveCreatedAtRef.current;
      if (!resolvedCreatedAt) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as CloudSaveData;
          resolvedCreatedAt = cloudData.createdAt || serverTimestamp();
          updateSaveCreatedAt(resolvedCreatedAt);
        } else {
          resolvedCreatedAt = serverTimestamp();
          updateSaveCreatedAt(resolvedCreatedAt);
        }
      }

      const payload = buildCloudPayload(state, uid, resolvedCreatedAt);
      await setDoc(docRef, payload);
      if (userRef.current?.uid !== uid) return false;

      await syncLeaderboard(uid, state);
      await syncPublicProfile(uid, state);
      setCloudSaveFound(payload);
      setLastSynced(new Date());
      updateSaveCreatedAt(resolvedCreatedAt);
      writeSave(uid, {
        ...state,
        lastSavedAt: Number(state.lastSavedAt) || Date.now(),
        lastCloudUpdatedAt: Date.now(),
      });
      return true;
    } catch (error) {
      console.error("Firestore periodic synchronization failed:", error);
      try {
        handleFirestoreError(error, OperationType.UPDATE, `saves/${uid}`);
      } catch {}
      throw error;
    } finally {
      isSavingRef.current = false;
      setSyncing(false);
    }
  };

  const adoptPreviousLocalSave = async () => {
    const activeUser = userRef.current;
    const prompt = accountSwitchPrompt;
    if (!activeUser || !prompt) return;

    const migratedSave = writeSave<RawSave>(activeUser.uid, {
      ...prompt.previousLocalSave,
      ownerId: activeUser.uid,
      lastSavedAt: Number(prompt.previousLocalSave.lastSavedAt) || Date.now(),
      lastCloudUpdatedAt: normalizeCloudTimestamp(prompt.previousLocalSave.lastCloudUpdatedAt),
    });

    triggerCloudStateLoad({
      ...(migratedSave as unknown as CloudSaveData),
      userId: activeUser.uid,
      updatedAt: migratedSave.lastCloudUpdatedAt ?? migratedSave.lastSavedAt,
    });

    setAccountSwitchPrompt(null);
    await uploadCurrentLocalState(activeUser.uid, migratedSave);
  };

  return {
    user,
    authLoading,
    syncing,
    lastSynced,
    loginWithGoogle,
    logout,
    cloudSaveFound,
    accountSwitchPrompt,
    continueWithCurrentAccount: () => setAccountSwitchPrompt(null),
    adoptPreviousLocalSave,
    saveStateToCloud,
    forceCheckCloudSave: () => user && resolveCurrentUserSave(user),
    forceLocalOverwriteCloud: () => user && uploadCurrentLocalState(user.uid),
    triggerCloudStateLoad,
  };
}
