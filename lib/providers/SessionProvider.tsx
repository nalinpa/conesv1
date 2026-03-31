import React, { createContext, useContext, useMemo } from "react";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { useGuestStore } from "@/lib/store/index";

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

  const isGuest = useGuestStore((state) => state.isGuest);
  const setGuest = useGuestStore((state) => state.setGuest);

  const session: Session = useMemo(() => {
    if (authLoading) return { status: "loading" };
    if (user && uid) return { status: "authed", uid };
    if (isGuest) return { status: "guest" };
    return { status: "loggedOut" };
  }, [authLoading, user, uid, isGuest]);

  const value = useMemo<SessionCtx>(
    () => ({
      session,
      enableGuest: async () => setGuest(true),
      disableGuest: async () => setGuest(false),
    }),
    [session, setGuest],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used inside <SessionProvider>");
  return v;
}
