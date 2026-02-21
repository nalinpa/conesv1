import React, { useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";

// Restoring standard path aliases for your project structure
import { Screen } from "@/components/ui/screen";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuthForm } from "@/lib/hooks/useAuthForm";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Login Screen
 * Manages the UI for sign-in, sign-up, and password resets.
 * Utilizes the useAuthForm hook which is now powered by userService for all Firebase operations.
 */
export default function LoginScreen() {
  const f = useAuthForm("login");
  const { session, enableGuest } = useSession();

  // Handle automatic navigation when the authentication state changes
  useEffect(() => {
    if (session.status === "guest") {
      router.replace("/(tabs)/map");
    }
    if (session.status === "authed") {
      router.replace("/(tabs)/progress");
    }
  }, [session.status]);

  const busy = f.busy || session.status === "loading";

  /**
   * Triggers the guest mode logic in the SessionProvider.
   * Navigation is automatically handled by the useEffect above once the status updates.
   */
  const handleGuestEntry = async () => {
    if (session.status !== "loggedOut") return;
    try {
      await enableGuest();
    } catch (e) {
      console.error("Failed to enable guest mode:", e);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Sign in" }} />

      <Screen padded>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <AuthCard
            mode={f.mode}
            title={f.title}
            subtitle={f.subtitle}
            email={f.email}
            password={f.password}
            confirm={f.confirm}
            busy={busy}
            err={f.err}
            notice={f.notice}
            canSubmit={f.canSubmit}
            onChangeMode={f.setMode}
            onChangeEmail={f.setEmail}
            onChangePassword={f.setPassword}
            onChangeConfirm={f.setConfirm}
            onSubmit={() => void f.submit()}
            onGuest={handleGuestEntry}
          />
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});