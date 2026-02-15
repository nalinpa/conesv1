import React from "react";
import { View, StyleSheet } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

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
        <View style={styles.headerContainer}>
          <AppText variant="screenTitle" style={styles.titleText}>
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

const styles = StyleSheet.create({
  headerContainer: {
    gap: 6,
  },
  titleText: {
    fontWeight: "900",
  },
});
