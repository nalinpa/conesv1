import React from "react";
import { StyleSheet, View } from "react-native";
import { MessageCircle } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
// Stack and Row removed to fix type errors; using View with gap instead
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
      {/* Replaced Stack with View to support 'style' prop */}
      <View style={[styles.container, { gap: space.md }]}>
        <AppIcon icon={MessageCircle} size={28} />

        <AppText variant="sectionTitle" style={styles.centerText}>
          No reviews yet
        </AppText>

        <AppText variant="hint" style={styles.hintText}>
          Be the first to leave a rating after you’ve visited this volcano.
        </AppText>

        {/* Replaced Row with View (flexDirection: row) to support 'style' prop */}
        <View style={[styles.buttonRow, { flexDirection: "row", gap: space.sm }]}>
          <AppButton variant="secondary" onPress={onBack} style={styles.button}>
            Back
          </AppButton>

          <AppButton variant="ghost" onPress={onRetry} style={styles.button}>
            Try again
          </AppButton>
        </View>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: space.lg,
  },
  container: {
    alignItems: "center",
    // default flexDirection is 'column', which matches Stack behavior
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
    // alignItems 'center' is usually good for button rows to align varying heights
    alignItems: "center",
  },
  button: {
    minWidth: 120,
  },
});
