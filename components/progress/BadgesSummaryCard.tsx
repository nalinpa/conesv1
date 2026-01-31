import React from "react";
import { View, Pressable } from "react-native";
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
  const hasRecent = Array.isArray(recentlyUnlocked) && recentlyUnlocked.length > 0;

  return (
    <CardShell>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text category="h6">Badges</Text>

        <Pressable onPress={onViewAll} hitSlop={10}>
          <Text status="primary" category="s2">
            View all
          </Text>
        </Pressable>
      </View>

      <View style={{ height: 12 }} />

      {/* Next up */}
      {nextUp?.badge ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pill status="info">Next up</Pill>
            <Text category="s1" style={{ fontWeight: "800", flexShrink: 1 }}>
              {nextUp.badge.name}
            </Text>
          </View>

          <Text appearance="hint">{nextUp.badge.unlockText}</Text>

          {nextUp.progressLabel ? (
            <Text appearance="hint" category="c1">
              {nextUp.progressLabel}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text appearance="hint">You’re all caught up — more badges coming soon.</Text>
      )}

      {/* Recently unlocked */}
      {hasRecent ? (
        <>
          <View style={{ height: 16 }} />

          <Text category="s2" appearance="hint" style={{ marginBottom: 8 }}>
            Recently unlocked
          </Text>

          <View style={{ gap: 8 }}>
            {recentlyUnlocked.slice(0, 3).map((u, idx) => {
              const id = u?.badge?.id ? String(u.badge.id) : `recent_${idx}`;
              const name = u?.badge?.name ?? "Badge";

              return (
                <View
                  key={id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <Text category="s1" style={{ flexShrink: 1 }}>
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
