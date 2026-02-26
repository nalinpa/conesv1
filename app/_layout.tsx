import "@/lib/polyfills/buffer";
import React, { useEffect } from "react";
import { Stack, useNavigationContainerRef } from "expo-router";
import { isRunningInExpoGo } from "expo";
import * as SplashScreen from "expo-splash-screen";

import { AppProviders } from "@/lib/providers/AppProviders";
import * as Sentry from '@sentry/react-native';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
  tracesSampleRate: 1.0, 
  integrations: [navigationIntegration],
  enableNativeFramesTracking: false,
});

// Prevent splash screen auto-hide
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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

export default Sentry.wrap(RootLayout);