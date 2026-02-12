import React from "react";
import { View } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { Pill } from "@/components/ui/Pill";

import { goLogin } from "@/lib/routes";
import { router } from "expo-router";

export function RequireAuthCard({
  title,
  message,
  showExploreButton = false,
  onExplore,
}: {
  title: string;
  message: string;
  showExploreButton?: boolean;
  onExplore?: () => void;
}) {
  return (
    <CardShell>
      <Stack gap="md">
        <View style={{ gap: 6 }}>
          <AppText variant="screenTitle" style={{ fontWeight: "900" }}>
            {title}
          </AppText>
        </View>

        <AppText variant="body">{message}</AppText>

        <Stack gap="sm">
          <AppButton variant="primary" onPress={goLogin}>
            Sign in
          </AppButton>

          <AppButton
            variant="secondary"
            onPress={() =>
              router.push({ pathname: "/login", params: { mode: "signup" } })
            }
          >
            Create account
          </AppButton>

          {showExploreButton && onExplore ? (
            <AppButton variant="ghost" onPress={onExplore}>
              Continue exploring
            </AppButton>
          ) : null}
        </Stack>
      </Stack>
    </CardShell>
  );
}
