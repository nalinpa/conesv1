import "@/lib/polyfills/buffer";
import React, { useEffect } from "react";
import { Stack, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { surfGreenTheme } from "@/lib/kitten-theme";

import { goLogin, goMapHome, goProgressHome } from "@/lib/routes";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { useGuestMode } from "@/lib/hooks/useGuestMode";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...surfGreenTheme }}>
        <AuthGate />

        <Stack screenOptions={{ headerShown: false }}>
          {/* This is the default entry route */}
          <Stack.Screen name="index" />

          {/* Auth */}
          <Stack.Screen name="login" />

          {/* Main app */}
          <Stack.Screen name="(tabs)" />

          {/* Modals */}
          <Stack.Screen
            name="share-frame"
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Share",
            }}
          />
        </Stack>

        <PortalHost />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const segments = useSegments();
  const { user, loading: authLoading } = useAuthUser();
  const guest = useGuestMode();

  const loading = authLoading || guest.loading;

  useEffect(() => {
    if (loading) return;

    const top = segments[0]; // "login", "(tabs)", "share-frame", etc.
    const loggedIn = !!user;
    const guestEnabled = guest.enabled;

    const inLogin = top === "login";
    const inTabs = top === "(tabs)";
    const inShare = top === "share-frame";

    // If logged in, guest mode should not be enabled.
    // (Don’t await; just fire and forget.)
    if (loggedIn && guestEnabled) {
      void guest.disable();
    }

    // Logged IN: keep them out of /login, send to progress if they land elsewhere.
    if (loggedIn) {
      if (inLogin) {
        goProgressHome();
        return;
      }
      // Allow tabs + share-frame; otherwise push to progress home.
      if (!inTabs && !inShare) {
        goProgressHome();
        return;
      }
      return;
    }

    // Logged OUT:
    // If guest enabled -> allow tabs; otherwise force login.
    if (!guestEnabled) {
      if (!inLogin) {
        goLogin();
        return;
      }
      return;
    }

    // Guest enabled (logged out):
    // - allow tabs
    // - if they are on login, move them to map
    if (inLogin) {
      goMapHome();
      return;
    }
    if (!inTabs) {
      goMapHome();
      return;
    }
  }, [loading, user, guest.enabled, segments, guest]);

  return null;
}
