import "@/lib/polyfills/buffer";
import React, { useEffect } from "react";
import { View, StyleSheet, Text, Button } from "react-native"; 
import { Stack, useNavigationContainerRef, ErrorBoundaryProps, useRouter, router } from "expo-router";
import { isRunningInExpoGo } from "expo";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppProviders } from "@/lib/providers/AppProviders";
import * as Sentry from "@sentry/react-native";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { useTrackingStore } from "@/lib/store/index";

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
  const router = useRouter();

  // Subscribe to the Global Tracking Store for the Success Ceremony
  const { 
    showSuccess, 
    successId,
    closeSuccess 
  } = useTrackingStore();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  const handleShareFromSuccess = () => {
    const { successTarget, successId, closeSuccess } = useTrackingStore.getState();
    closeSuccess();

    // Navigate with the ID we just validated in the ceremony
    router.push({
      pathname: "/share-frame",
      params: { 
        coneId: successId, // Use successId, not targetId!
        coneName: successTarget 
      }
    });
  };

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
              title: "Share Your View",
            }}
          />
        </Stack>

        {/* GLOBAL SUCCESS CEREMONY 
            Sitting outside the Stack ensures it covers headers and tabs.
        */}
        {showSuccess && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <SuccessScreen 
              coneId={successId!}
              onClose={closeSuccess}
              onShare={handleShareFromSuccess}
            />
          </View>
        )}
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