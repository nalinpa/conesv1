import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

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
  const recent = Array.isArray(recentlyUnlocked) ? recentlyUnlocked.filter(Boolean) : [];
  const recentTop = recent.slice(0, 3);
  const extraCount = Math.max(0, recent.length - recentTop.length);

  return (
    <CardShell>
      <View style={styles.headerRow}>
        <Text category="h6">Badges</Text>

        <Pressable onPress={onViewAll} hitSlop={10}>
          <Text status="primary" category="s2">
            View all
          </Text>
        </Pressable>
      </View>

      <View style={styles.spacerSmall} />

      {nextUp?.badge ? (
        <View style={styles.nextUpContainer}>
          <View style={styles.nextUpHeader}>
            <Pill status="info">Next up</Pill>
            <Text category="s1" style={styles.nextUpTitle} numberOfLines={1}>
              {nextUp.badge.name}
            </Text>
          </View>

          <Text appearance="hint" numberOfLines={2}>
            {nextUp.badge.unlockText}
          </Text>

          {nextUp.progressLabel ? (
            <Text appearance="hint" category="c1">
              {nextUp.progressLabel}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text appearance="hint">No next badge right now.</Text>
      )}

      {recentTop.length ? (
        <>
          <View style={styles.spacerMedium} />

          <View style={styles.recentHeader}>
            <Text category="s2" appearance="hint">
              Recently unlocked
            </Text>

            {extraCount > 0 ? <Pill status="basic">+{extraCount} more</Pill> : null}
          </View>

          <View style={styles.recentList}>
            {recentTop.map((u, idx) => {
              const baseId = u?.badge?.id != null ? String(u.badge.id) : "recent";
              const key = `${baseId}_${idx}`;
              const name = u?.badge?.name ?? "Badge";

              return (
                <View key={key} style={styles.recentItem}>
                  <Text category="s1" style={styles.flexShrink} numberOfLines={1}>
                    {name}
                  </Text>
                  <Pill status="success">Unlocked</Pill>
                </View>
              );
            })}
          </View>
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
  spacerSmall: {
    height: 12,
  },
  spacerMedium: {
    height: 16,
  },
  nextUpContainer: {
    gap: 8,
  },
  nextUpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextUpTitle: {
    fontWeight: "800",
    flexShrink: 1,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  flexShrink: {
    flexShrink: 1,
  },
});
