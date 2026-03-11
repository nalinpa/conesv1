import "@/lib/polyfills/buffer";
import React, { useEffect } from "react";
import { View, StyleSheet, Text, Button } from "react-native"; 
import { Stack, useNavigationContainerRef, ErrorBoundaryProps } from "expo-router";
import { isRunningInExpoGo } from "expo";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Note: We removed the ErrorCard import!
import { AppProviders } from "@/lib/providers/AppProviders";
import * as Sentry from "@sentry/react-native";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

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

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <OfflineBanner />
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
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <View style={styles.errorBoundaryContainer}>
      <Text style={styles.errorTitle}>App Crashed</Text>
      <Text style={styles.errorMessage}>{error.message || "An unexpected error occurred."}</Text>
      <Button title="Restart App" color="#2D5A47" onPress={retry} />
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
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A3328",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#4A7A66",
    marginBottom: 24,
  },
});

export default Sentry.wrap(RootLayout);