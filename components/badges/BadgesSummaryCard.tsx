import React from "react";
import { StyleSheet, View } from "react-native";
import { Award, ChevronRight, Lock, Sparkles } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { Pill } from "@/components/ui/Pill";
import { space, radius } from "@/lib/ui/tokens";

export function BadgesSummaryCard({ nextUp, recentlyUnlocked, onViewAll }: any) {
  return (
    <CardShell status="basic" onPress={onViewAll}>
      <Stack gap="md">
        {/* Header */}
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            <AppIcon icon={Award} variant="surf" size={18} />
            <AppText variant="sectionTitle" style={styles.darkText}>
              Achievements
            </AppText>
          </Row>
          <Row gap="xs" align="center">
            <AppText variant="label" status="hint">
              View All
            </AppText>
            <AppIcon icon={ChevronRight} variant="hint" size={14} />
          </Row>
        </Row>

        {/* Recently Unlocked Achievement */}
        {recentlyUnlocked && recentlyUnlocked.length > 0 && (
          <Stack gap="xs">
            <Row gap="xs" align="center">
              <Sparkles size={10} color="#22C55E" />
              <AppText variant="label" status="hint" style={styles.upper}>
                Recently Earned
              </AppText>
            </Row>
            {recentlyUnlocked.slice(0, 1).map((badge: any) => (
              <View key={badge.id || "recent"} style={styles.unlockedBox}>
                <Row gap="md" align="center">
                  <View style={styles.emojiWrapper}>
                    <AppText style={styles.emoji}>
                      {badge.icon || badge.emoji || "🏆"}
                    </AppText>
                  </View>
                  <View style={styles.flex1}>
                    <AppText variant="body" style={styles.boldDark}>
                      {badge.name || "New Achievement"}
                    </AppText>
                    <AppText variant="label" status="control" style={styles.bold}>
                      Unlocked!
                    </AppText>
                  </View>
                </Row>
              </View>
            ))}
          </Stack>
        )}

        {/* Next Goal / Progress */}
        {nextUp && (
          <Stack gap="xs">
            <AppText variant="label" status="hint" style={styles.upper}>
              Next Goal
            </AppText>
            <View style={styles.goalBox}>
              <Row gap="md" align="center">
                <View style={styles.lockCircle}>
                  <Lock size={14} color="#94A3B8" />
                </View>
                <View style={styles.flex1}>
                  <AppText variant="body" style={styles.boldDark}>
                    {nextUp.name || nextUp.badge?.name || "Next Badge"}
                  </AppText>
                  <AppText variant="label" status="hint" numberOfLines={1}>
                    {nextUp.progressLabel || "Keep exploring..."}
                  </AppText>
                </View>
                {nextUp.percent != null && <Pill status="basic">{nextUp.percent}%</Pill>}
              </Row>
            </View>
          </Stack>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  darkText: { color: "#0F172A" },
  boldDark: { fontWeight: "900", color: "#0F172A" },
  bold: { fontWeight: "800" },
  upper: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: "900",
  },
  emoji: { fontSize: 28 },
  emojiWrapper: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedBox: {
    padding: space.md,
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: radius.md,
  },
  goalBox: {
    padding: space.md,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: radius.md,
  },
  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDF2F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pillText: {
    fontWeight: "900",
  },
});
