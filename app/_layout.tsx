import "../global.css";
import React from "react";
import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </SafeAreaProvider>
  );
}
