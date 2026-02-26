import React from "react";
import { View, StyleSheet } from "react-native";
import { CheckCircle2, Lock } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Pill } from "@/components/ui/Pill";
import { space, radius } from "@/lib/ui/tokens";

interface BadgeTileProps {
  name: string;
  icon: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel?: string | null;
}

export function BadgeTile({
  name,
  icon,
  unlockText,
  unlocked,
  progressLabel,
}: BadgeTileProps) {
  return (
    <View style={[styles.container, !unlocked && styles.lockedOpacity]}>
      <Row gap="md" align="flex-start">
        {/* Badge Icon */}
        <View
          style={[styles.iconWrapper, unlocked ? styles.iconUnlocked : styles.iconLocked]}
        >
          <AppText style={[styles.iconText, !unlocked && styles.grayscale]}>
            {icon}
          </AppText>
          {!unlocked && (
            <View style={styles.lockOverlay}>
              <Lock size={12} color="#94A3B8" />
            </View>
          )}
        </View>

        {/* Info */}
        <Stack style={styles.flex1} gap="xxs">
          <Row justify="space-between" align="center">
            <AppText variant="body" style={styles.bold}>
              {name}
            </AppText>
            {unlocked && <CheckCircle2 size={16} color="#66B2A2" />}
          </Row>

          <AppText variant="label" status="hint" numberOfLines={2}>
            {unlockText}
          </AppText>

          <View style={styles.footer}>
            {unlocked ? (
              <Pill status="surf">
                Earned
              </Pill>
            ) : (
              <AppText variant="label" status="hint" style={styles.progressText}>
                {progressLabel ?? "Locked"}
              </AppText>
            )}
          </View>
        </Stack>
      </Row>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: space.md,
    width: "100%",
  },
  flex1: { flex: 1 },
  bold: { fontWeight: "800", color: "#0F172A" },
  lockedOpacity: { opacity: 0.8 },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconUnlocked: {
    backgroundColor: "#F0FDFB",
    borderColor: "#CCECE5",
  },
  iconLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  iconText: { fontSize: 28 },
  grayscale: { opacity: 0.4 },
  lockOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  footer: { marginTop: 6 },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: space.md,
    marginHorizontal: -space.md,
    opacity: 0.5,
  },
});
