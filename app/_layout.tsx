import "@/lib/polyfills/buffer";
import React, { useEffect } from "react";
import { Stack, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { surfGreenTheme } from "@/lib/kitten-theme";

import { goLogin, goProgressHome } from "@/lib/routes";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { LoadingState } from "@/components/ui/LoadingState";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...surfGreenTheme }}>
        <AuthGate />
        <PortalHost />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const segments = useSegments();
  const { user, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;

    const top = segments[0]; // e.g. "login", "(tabs)", "share-frame"
    const inAuthRoute = top === "login";
    const inTabsRoute = top === "(tabs)";

    // ✅ allow these routes while logged in, even though they aren't "(tabs)"
    const allowedAuthedRoutes = new Set(["share-frame"]);
    const inAllowedAuthedRoute = allowedAuthedRoutes.has(top);

    const loggedIn = !!user;

    // Logged out -> must be at /login
    if (!loggedIn && !inAuthRoute) {
      goLogin();
      return;
    }

    // Logged in -> must be inside tabs OR allowed routes (like share-frame)
    if (loggedIn && !inTabsRoute && !inAllowedAuthedRoute) {
      goProgressHome();
      return;
    }
  }, [loading, user, segments]);

  if (loading) {
    return <LoadingState label="Signing you in…" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="share-frame" options={{ presentation: "modal", headerShown: true, title: "Share" }} />
    </Stack>
  );
}
