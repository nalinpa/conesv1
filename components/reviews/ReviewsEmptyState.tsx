import React from "react";
import { StyleSheet, View } from "react-native";
import { MessageSquarePlus } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
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
    <CardShell status="basic" style={styles.card}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <AppIcon icon={MessageSquarePlus} size={32} variant="surf" />
        </View>

        <View style={styles.textStack}>
          <AppText variant="sectionTitle" style={styles.centerText}>
            No reviews yet
          </AppText>

          <AppText variant="label" status="hint" style={styles.hintText}>
            Be the first to share your experience after you’ve checked in at this site.
          </AppText>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.flex1}>
            <AppButton variant="secondary" size="md" onPress={onBack}>
              Go Back
            </AppButton>
          </View>

          <View style={styles.flex1}>
            <AppButton variant="ghost" size="md" onPress={onRetry}>
              Refresh
            </AppButton>
          </View>
        </View>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: space.lg,
    paddingVertical: space.xl,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  textStack: {
    alignItems: "center",
    gap: space.xs,
    marginBottom: space.lg,
  },
  centerText: {
    textAlign: "center",
    color: "#0F172A",
  },
  hintText: {
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: space.sm,
    width: "100%",
  },
  flex1: {
    flex: 1,
  },
});
