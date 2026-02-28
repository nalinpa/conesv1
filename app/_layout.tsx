import "@/lib/polyfills/buffer";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useNavigationContainerRef, ErrorBoundaryProps } from "expo-router";
import { isRunningInExpoGo } from "expo";
import * as SplashScreen from "expo-splash-screen";

import { ErrorCard } from "@/components/ui/ErrorCard";
import { AppProviders } from "@/lib/providers/AppProviders";
import * as Sentry from "@sentry/react-native";

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

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  // Report the error to Sentry behind the scenes
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <View style={styles.errorBoundaryContainer}>
      <ErrorCard
        status="danger"
        title="App Crashed"
        message={error.message || "An unexpected error occurred."}
        action={{
          label: "Restart App",
          onPress: retry,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  errorBoundaryContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
});

export default Sentry.wrap(RootLayout);
