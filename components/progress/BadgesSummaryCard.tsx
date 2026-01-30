import React from "react";
import { View } from "react-native";
import { Card, Text, Button } from "@ui-kitten/components";

import type { BadgeDefinition, BadgeProgress } from "@/lib/badges";

export function BadgesSummaryCard({
  nextUp,
  recentlyUnlocked,
  onViewAll,
}: {
  nextUp: {
    badge: BadgeDefinition;
    progressLabel?: string | null;
  } | null;

  recentlyUnlocked: {
    badge: BadgeDefinition;
  }[];

  onViewAll: () => void;
}) {
  return (
    <Card>
      <View style={{ gap: 12 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text category="h6">Badges</Text>
          <Button size="small" appearance="outline" onPress={onViewAll}>
            View all
          </Button>
        </View>

        {/* Next up */}
        <View style={{ gap: 6 }}>
          <Text category="s1">Next up</Text>

          {!nextUp ? (
            <Text appearance="hint">
              You’re all caught up — more badges coming soon.
            </Text>
          ) : (
            <View style={{ gap: 4 }}>
              <Text category="s1">{nextUp.badge.name}</Text>
              <Text appearance="hint">{nextUp.badge.unlockText}</Text>

              {nextUp.progressLabel ? (
                <Text appearance="hint" category="c1">
                  {nextUp.progressLabel}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Recently unlocked */}
        {recentlyUnlocked.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text category="s1">Recently unlocked</Text>

            <View style={{ gap: 2 }}>
              {recentlyUnlocked.slice(0, 3).map((u) => (
                <Text key={u.badge.id} appearance="hint">
                  • {u.badge.name}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
