import { useCallback, useEffect, useRef } from "react";
import { router, useRootNavigationState, useSegments } from "expo-router";
import { useSession } from "@/lib/providers/SessionProvider";

type TopRoute = "" | "index" | "login" | "(tabs)" | "share-frame";

export function AuthGate() {
  const segments = useSegments();
  const navState = useRootNavigationState();
  const { session, disableGuest } = useSession();

  const top = (segments[0] ?? "") as TopRoute;

  const inLogin = top === "login";
  const inTabs = top === "(tabs)";
  const inShare = top === "share-frame";
  const inIndex = top === "index" || top === "";

  // prevent repeated replace spam
  const lastRef = useRef<string | null>(null);
  const safeReplace = useCallback((href: string) => {
    if (lastRef.current === href) return;
    lastRef.current = href;
    router.replace(href);
  }, []);

  // prevent calling disableGuest repeatedly
  const guestDisabledOnceRef = useRef(false);

  useEffect(() => {
    // ✅ wait for router ready (prevents "navigate before mounting")
    if (!navState?.key) return;

    // ✅ still hydrating session
    if (session.status === "loading") return;

    const isAuthed = session.status === "authed";
    const isGuest = session.status === "guest";
    const isLoggedOut = session.status === "loggedOut";

    // If authed, ensure guest mode is off (but only once)
    if (isAuthed && !guestDisabledOnceRef.current) {
      guestDisabledOnceRef.current = true;
      void disableGuest();
    }
    if (!isAuthed) {
      guestDisabledOnceRef.current = false;
    }

    // ✅ Always allow login to render (your preference)
    if (inLogin) return;

    // ✅ Always allow share modal
    if (inShare) return;

    // Root index should just funnel to login (predictable startup)
    if (inIndex) {
      safeReplace("/login");
      return;
    }

    // Tabs are protected: only authed or guest can be inside
    if (inTabs) {
      if (isAuthed || isGuest) return;
      safeReplace("/login");
      return;
    }

    // Any other route:
    if (isLoggedOut) {
      safeReplace("/login");
      return;
    }

    if (isGuest) {
      safeReplace("/(tabs)/map");
      return;
    }

    if (isAuthed) {
      safeReplace("/(tabs)/progress");
      return;
    }
  }, [
    navState?.key,
    session.status,
    disableGuest,
    inLogin,
    inShare,
    inTabs,
    inIndex,
    safeReplace,
  ]);

  return null;
}
