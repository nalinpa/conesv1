import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Stack, router } from "expo-router";
import { Image } from "expo-image"; // <-- 1. Import Image from expo-image
import * as Sentry from "@sentry/react-native";

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
      Sentry.captureException(e);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Screen padded={false}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <View style={styles.content}>
              {/* Brand Header with Custom Logo */}
              <View style={styles.brandContainer}>
                <View style={styles.logoWrapper}>
                  {/* 2. Replace Mountain with your custom asset */}
                  <Image
                    source={require("@/assets/adaptive-icon.png")}
                    style={styles.customIcon}
                    contentFit="contain"
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
        </TouchableWithoutFeedback>
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
    paddingBottom: space.md,
    paddingTop: space.xl,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: space.sm,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#F0FDFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
    shadowColor: "#5FB3A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  customIcon: {
    width: 90,
    height: 90,
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
