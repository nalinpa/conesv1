import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { surfGreenTheme } from "@/lib/kitten-theme";

import { goLogin, goProgressHome } from "@/lib/routes";

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
  const router = useRouter();
  const segments = useSegments();

  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === "login";
    const inTabsGroup = segments[0] === "(tabs)";

    // Not logged in -> must be at login
    if (!loggedIn && !inAuthGroup) {
      goLogin(router);
      return;
    }

    // Logged in -> must be in tabs (default to progress)
    if (loggedIn && !inTabsGroup) {
      goProgressHome();
      return;
    }
  }, [ready, loggedIn, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
