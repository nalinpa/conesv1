import React from "react";
import { View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { useGuestMode } from "@/lib/hooks/useGuestMode";
import { goLogin } from "@/lib/routes";

import { auth } from "@/lib/firebase";

export default function AccountScreen() {
  const { user, loading } = useAuthUser();
  const guest = useGuestMode();

  if (loading || guest.loading) {
    return (
      <Screen padded>
        <View style={{ flex: 1 }}>
          <AppText variant="body">Loading…</AppText>
        </View>
      </Screen>
    );
  }

  const loggedIn = !!user;
  const isGuest = !loggedIn && guest.enabled;

  return (
    <Screen padded>
      <Stack gap="md">
        <CardShell>
          <Stack gap="sm">
            <AppText variant="screenTitle">Account</AppText>

            {loggedIn ? (
              <>
                <AppText variant="hint">Signed in as</AppText>
                <AppText variant="body" style={{ fontWeight: "800" }}>
                  {user?.email ?? "—"}
                </AppText>

                <AppButton
                  variant="secondary"
                  onPress={async () => {
                    // Clean guest flag just in case
                    if (guest.enabled) await guest.disable();
                    await auth.signOut();
                    goLogin();
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
                    await guest.disable();
                    goLogin();
                  }}
                >
                  Sign in / Create account
                </AppButton>
              </>
            ) : (
              <>
                <AppText variant="body">You’re not signed in.</AppText>
                <AppButton variant="primary" onPress={goLogin}>
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
