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

type Session =
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

  useEffect(() => {
    void ensureGuestModeHydrated();
  }, []);

  const guestBits = useSyncExternalStore(
    subscribeGuestMode,
    getGuestModeSnapshot,
    getGuestModeSnapshot,
  );

  const guestEnabled = (guestBits & 1) === 1;
  const guestLoading = (guestBits & 2) === 2;

  const loading = authLoading || guestLoading;

  const session: Session = useMemo(() => {
    if (loading) return { status: "loading" };
    if (user && uid) return { status: "authed", uid };
    if (guestEnabled) return { status: "guest" };
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
