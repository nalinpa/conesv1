import "@/lib/polyfills/buffer";
import React from "react";
import { Stack } from "expo-router";

import { AppProviders } from "@/lib/providers/AppProviders";
import { AuthGate } from "@/components/auth/AuthGate";

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGate />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
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
