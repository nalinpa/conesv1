import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useAuthUser } from "@/lib/hooks/useAuthUser";
import {
  ensureGuestModeHydrated,
  getGuestModeSnapshot,
  subscribeGuestMode,
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

  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestLoading, setGuestLoading] = useState(true);

  // ✅ Single subscription to guest-mode store (NO useSyncExternalStore object snapshot loop)
  useEffect(() => {
    let mounted = true;

    const sync = () => {
      const snap = getGuestModeSnapshot();
      if (!mounted) return;
      setGuestEnabled(snap.enabled);
      setGuestLoading(snap.loading);
    };

    // start listening immediately
    const unsub = subscribeGuestMode(sync);

    // hydrate once, then sync again when hydration finishes
    sync();
    void ensureGuestModeHydrated().then(sync);

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

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
