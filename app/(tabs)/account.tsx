import React from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";
import { auth } from "@/lib/firebase";

export default function AccountScreen() {
  const { session, disableGuest } = useSession();

  if (session.status === "loading") {
    return (
      <Screen padded>
        <View style={{ flex: 1 }}>
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

                <AppButton
                  variant="secondary"
                  onPress={async () => {
                    // guest should already be off when authed, but safe anyway
                    await disableGuest();
                    await auth.signOut();
                    router.replace("/login");
                  }}
                >
                  Log out
                </AppButton>
              </>
            ) : isGuest ? (
              <>
                <AppText variant="body">
                  You’re browsing as a guest. Sign in to track completions and leave reviews.
                </AppText>

                <AppButton
                  variant="primary"
                  onPress={async () => {
                    await disableGuest();
                    router.replace("/login");
                  }}
                >
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
