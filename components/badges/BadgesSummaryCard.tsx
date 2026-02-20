import React from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@ui-kitten/components";

// Relative path fixes
import { CardShell } from "../ui/CardShell";
import { Pill } from "../ui/Pill";
import { Row } from "../ui/Row";
import { Stack } from "../ui/Stack";

import type { BadgeProgress } from "@/lib/badges";

export function BadgesSummaryCard({
  nextUp,
  recentlyUnlocked,
  onViewAll,
}: {
  nextUp: BadgeProgress | null;
  recentlyUnlocked: BadgeProgress[];
  onViewAll: () => void;
}) {
  const theme = useTheme();
  const recent = Array.isArray(recentlyUnlocked) ? recentlyUnlocked.filter(Boolean) : [];
  const recentTop = recent.slice(0, 3);
  const extraCount = Math.max(0, recent.length - recentTop.length);

  return (
    <CardShell>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme?.['text-basic-color'] ?? '#000' }]}>
          Badges
        </Text>

        <Pressable onPress={onViewAll} hitSlop={10}>
          <Text style={{ color: theme?.['color-primary-500'] ?? '#5FB3A2', fontWeight: '700' }}>
            View all
          </Text>
        </Pressable>
      </View>

      <View style={styles.spacerSmall} />

      {/* Next Up section with Emoji */}
      {nextUp?.badge ? (
        <View style={styles.nextUpContainer}>
          <Row gap="sm" align="center">
            <Pill status="info">Next up</Pill>
            <Row gap="xs" align="center">
              <Text style={styles.emojiIcon}>{nextUp.badge.icon}</Text>
              <Text numberOfLines={1} style={styles.badgeName}>
                {nextUp.badge.name}
              </Text>
            </Row>
          </Row>

          <Text style={styles.unlockText} numberOfLines={2}>
            {nextUp.badge.unlockText}
          </Text>

          {nextUp.progressLabel ? (
            <Text style={styles.progressHint}>
              {nextUp.progressLabel}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.emptyText}>No next badge right now.</Text>
      )}

      {/* Recently Unlocked list with Emojis */}
      {recentTop.length ? (
        <>
          <View style={styles.spacerMedium} />

          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recently unlocked</Text>
            {extraCount > 0 ? <Pill status="basic">+{extraCount} more</Pill> : null}
          </View>

          <Stack gap="sm">
            {recentTop.map((u, idx) => {
              const baseId = u?.badge?.id != null ? String(u.badge.id) : "recent";
              const key = `${baseId}_${idx}`;
              
              return (
                <View key={key} style={styles.recentItem}>
                  <Row align="center" gap="sm" style={styles.flexShrink}>
                    <Text style={styles.smallEmoji}>{u.badge.icon}</Text>
                    <Text numberOfLines={1} style={[styles.flexShrink, styles.recentBadgeName]}>
                      {u.badge.name}
                    </Text>
                  </Row>
                  <Pill status="success">Earned</Pill>
                </View>
              );
            })}
          </Stack>
        </>
      ) : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  spacerSmall: {
    height: 12,
  },
  spacerMedium: {
    height: 16,
  },
  nextUpContainer: {
    gap: 8,
  },
  emojiIcon: {
    fontSize: 20,
  },
  badgeName: {
    fontWeight: "800",
    fontSize: 16,
    flexShrink: 1,
  },
  unlockText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },
  progressHint: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  smallEmoji: {
    fontSize: 18,
  },
  recentBadgeName: {
    fontSize: 15,
    fontWeight: "700",
  },
  flexShrink: {
    flexShrink: 1,
  },
});