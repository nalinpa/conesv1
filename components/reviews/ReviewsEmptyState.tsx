import React from "react";
import { StyleSheet } from "react-native";
import { MessageCircle } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

export function ReviewsEmptyStateCard({
  onBack,
  onRetry,
}: {
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <CardShell style={styles.card}>
      <Stack gap="md" style={styles.container}>
        <AppIcon icon={MessageCircle} size={28} />

        <AppText variant="sectionTitle" style={styles.centerText}>
          No reviews yet
        </AppText>

        <AppText variant="hint" style={styles.hintText}>
          Be the first to leave a rating after you’ve visited this volcano.
        </AppText>

        <Row gap="sm" style={styles.buttonRow}>
          <AppButton variant="secondary" onPress={onBack} style={styles.button}>
            Back
          </AppButton>

          <AppButton variant="ghost" onPress={onRetry} style={styles.button}>
            Try again
          </AppButton>
        </Row>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: space.lg,
  },
  container: {
    alignItems: "center",
  },
  centerText: {
    textAlign: "center",
  },
  hintText: {
    textAlign: "center",
    maxWidth: 260,
  },
  buttonRow: {
    marginTop: space.sm,
  },
  button: {
    minWidth: 120,
  },
});
