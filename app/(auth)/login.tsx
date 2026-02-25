import React, { useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Stack, router } from "expo-router";
import { Mountain } from "lucide-react-native";

import { Screen } from "@/components/ui/Screen";
import { AuthCard } from "@/components/auth/AuthCard";
import { AppText } from "@/components/ui/AppText";
import { useAuthForm } from "@/lib/hooks/useAuthForm";
import { useSession } from "@/lib/providers/SessionProvider";
import { space } from "@/lib/ui/tokens";

export default function LoginScreen() {
  const f = useAuthForm("login");
  const { session, enableGuest } = useSession();

  useEffect(() => {
    if (session.status === "guest") {
      router.replace("/(tabs)/map");
    }
    if (session.status === "authed") {
      router.replace("/(tabs)/progress");
    }
  }, [session.status]);

  const busy = f.busy || session.status === "loading";

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
      <Stack.Screen options={{ headerShown: false }} />

      <Screen padded={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Brand Header with Mountain Logo */}
            <View style={styles.brandContainer}>
              <View style={styles.logoWrapper}>
                <Mountain
                  size={40}
                  color="#5FB3A2" // Your Surf Green
                  strokeWidth={2.5}
                />
              </View>
              <AppText variant="screenTitle" style={styles.appName}>
                Cones
              </AppText>
              <AppText variant="label" status="hint" style={styles.tagline}>
                Auckland Volcanic Field
              </AppText>
            </View>

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
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    paddingBottom: space.xl,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: space.xl,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#F0FDFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
    // Subtle shadow to make the logo feel "lifted"
    shadowColor: "#5FB3A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1.5,
  },
  tagline: {
    marginTop: 2,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 10,
    color: "#94A3B8",
  },
});
