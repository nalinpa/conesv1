import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useSyncExternalStore } from "react";

import { useAuthUser } from "@/lib/hooks/useAuthUser";
import {
  ensureGuestModeHydrated,
  subscribeGuestMode,
  getGuestModeSnapshot,
  setGuestMode,
  clearGuestMode,
} from "@/lib/guestMode";

/**
 * 1. Define the possible session states. 
 * 'unverified' is used when a user has a Firebase account but hasn't clicked the email link.
 */
export type Session =
  | { status: "loading" }
  | { status: "authed"; uid: string }
  | { status: "guest" }
  | { status: "loggedOut" };

type SessionCtx = {
  session: Session;
  enableGuest: () => Promise<void>;
  disableGuest: () => Promise<void>;
};

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user, uid, loading: authLoading } = useAuthUser();

  // Ensure our local guest mode storage is ready on mount
  useEffect(() => {
    void ensureGuestModeHydrated();
  }, []);

  // Sync with the external guest mode store
  const guestBits = useSyncExternalStore(
    subscribeGuestMode,
    getGuestModeSnapshot,
    getGuestModeSnapshot,
  );

  const guestEnabled = (guestBits & 1) === 1;
  const guestLoading = (guestBits & 2) === 2;

  const loading = authLoading || guestLoading;

  /**
   * 2. The Logic: This determines where the user currently stands.
   * Note: We check for 'unverified' specifically if a user exists in Firebase.
   */
  const session: Session = useMemo(() => {
    if (loading) return { status: "loading" };
    
    // Priority 1: Logged-in Users
    if (user && uid) {
      return { status: "authed", uid };
    }
    
    // Priority 2: Guest Mode
    if (guestEnabled) return { status: "guest" };
    
    // Default: Logged Out
    return { status: "loggedOut" };
  }, [loading, user, uid, guestEnabled]);

  const value = useMemo<SessionCtx>(
    () => ({
      session,
      enableGuest: async () => setGuestMode(true),
      disableGuest: async () => clearGuestMode(),
    }),
    [session],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used inside <SessionProvider>");
  return v;
}