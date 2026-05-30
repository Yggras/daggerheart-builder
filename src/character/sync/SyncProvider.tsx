import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { syncEngine, type SyncStatus } from "./engine";

// Drives the sync engine lifecycle from auth state: start on sign-in, stop on sign-out / user change.
// Exposes the current sync status for an optional UI indicator.

const SyncStatusContext = createContext<SyncStatus>("idle");

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("idle");

  useEffect(() => {
    const unsubscribe = syncEngine.subscribeStatus(setStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      syncEngine.stop();
      setStatus("idle");
      return;
    }
    void syncEngine.start(user.id);
    return () => syncEngine.stop();
  }, [user?.id]);

  return <SyncStatusContext.Provider value={status}>{children}</SyncStatusContext.Provider>;
}

export function useSyncStatus(): SyncStatus {
  return useContext(SyncStatusContext);
}
