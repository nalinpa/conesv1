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
  const recent = Array.isArray(recentlyUnlocked) ? recentlyUnlocked.filter(Boolean) : [];
  const recentTop = recent.slice(0, 3);
  const extraCount = Math.max(0, recent.length - recentTop.length);

  return (
    <CardShell>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text category="h6">Badges</Text>

        <Pressable onPress={onViewAll} hitSlop={10}>
          <Text status="primary" category="s2">
            View all
          </Text>
        </Pressable>
      </View>

      <View style={{ height: 12 }} />

      {nextUp?.badge ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pill status="info">Next up</Pill>
            <Text category="s1" style={{ fontWeight: "800", flexShrink: 1 }} numberOfLines={1}>
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
          <View style={{ height: 16 }} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text category="s2" appearance="hint">
              Recently unlocked
            </Text>

            {extraCount > 0 ? <Pill status="basic">+{extraCount} more</Pill> : null}
          </View>

          <View style={{ gap: 8 }}>
            {recentTop.map((u, idx) => {
              const baseId = u?.badge?.id != null ? String(u.badge.id) : "recent";
              const key = `${baseId}_${idx}`;
              const name = u?.badge?.name ?? "Badge";

              return (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <Text category="s1" style={{ flexShrink: 1 }} numberOfLines={1}>
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
