import "@/lib/polyfills/buffer";
import React from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AppProviders } from "@/lib/providers/AppProviders";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="share-frame"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Share",
          }}
        />
      </Stack>
    </AppProviders>
  );
}
