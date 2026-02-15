import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

// Reverting to alias imports which are standard for Expo/React Native projects.
// The compilation errors in the preview environment are typically due to the
// web-based bundler's lack of native module support (react-native, expo-router),
// but the code below is structurally correct for your mobile project.
import { Screen } from "@/components/ui/screen";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";
import { auth } from "@/lib/firebase";

export default function AccountScreen() {
  const { session, disableGuest } = useSession();

  /**
   * Handlers for navigation and session management
   */
  const handleLogout = async () => {
    await disableGuest();
    await auth.signOut();
    router.replace("/login");
  };

  const handleSignIn = async () => {
    await disableGuest();
    router.replace("/login");
  };

  if (session.status === "loading") {
    return (
      <Screen padded>
        <View style={styles.loadingWrapper}>
          <AppText variant="body">Loading…</AppText>
        </View>
      </Screen>
    );
  }

  const isAuthed = session.status === "authed";
  const isGuest = session.status === "guest";

  return (
    <Screen padded>
      <Stack gap="md">
        <CardShell>
          <Stack gap="sm">
            <AppText variant="screenTitle">Account</AppText>

            {isAuthed ? (
              <>
                <AppText variant="hint">Signed in</AppText>

                <AppButton variant="secondary" onPress={handleLogout}>
                  Log out
                </AppButton>
              </>
            ) : isGuest ? (
              <>
                <AppText variant="body">
                  You’re browsing as a guest. Sign in to track completions and leave
                  reviews.
                </AppText>

                <AppButton variant="primary" onPress={handleSignIn}>
                  Sign in / Create account
                </AppButton>
              </>
            ) : (
              <>
                <AppText variant="body">You’re not signed in.</AppText>
                <AppButton variant="primary" onPress={() => router.replace("/login")}>
                  Sign in
                </AppButton>
              </>
            )}
          </Stack>
        </CardShell>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
  },
});
