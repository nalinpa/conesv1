import "@/lib/polyfills/buffer";
import React from "react";
import { Stack } from "expo-router";

import { AppProviders } from "@/lib/providers/AppProviders";

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
