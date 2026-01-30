import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Card, Text, Button, Modal } from "@ui-kitten/components";

import type { BadgeDefinition, BadgeProgressMap } from "@/lib/badges";

function BadgeTile({
  badge,
  earned,
  progressLabel,
  onPress,
}: {
  badge: BadgeDefinition;
  earned: boolean;
  progressLabel?: string | null;
  onPress: () => void;
}) {
  return (
    <Button
      onPress={onPress}
      appearance={earned ? "filled" : "outline"}
      status={earned ? "primary" : "basic"}
      style={{ width: "100%" }}
    >
      <View style={{ gap: 4 }}>
        <Text category="s2">{badge.name}</Text>
        <Text appearance="hint" category="c1">
          {earned ? "Unlocked ✅" : "Locked"}
        </Text>

        {!earned && progressLabel ? (
          <Text appearance="hint" category="c2">
            {progressLabel}
          </Text>
        ) : null}
      </View>
    </Button>
  );
}

export function BadgesGrid({
  badges,
  earnedIds,
  progressById,
}: {
  badges: BadgeDefinition[];
  earnedIds: Set<string>;
  progressById: BadgeProgressMap;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const openBadge = useMemo(() => {
    if (!openId) return null;
    return badges.find((b) => b.id === openId) ?? null;
  }, [openId, badges]);

  const openProgress = openId ? progressById[openId] : null;
  const openEarned = openBadge ? earnedIds.has(openBadge.id) : false;

  return (
    <>
      {/* 2-column grid without CSS tricks */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -6 }}>
        {badges.map((b) => {
          const earned = earnedIds.has(b.id);
          const progressLabel = progressById[b.id]?.progressLabel ?? null;

          return (
            <View key={b.id} style={{ width: "50%", padding: 6 }}>
              <BadgeTile
                badge={b}
                earned={earned}
                progressLabel={earned ? null : progressLabel}
                onPress={() => setOpenId(b.id)}
              />
            </View>
          );
        })}
      </View>

      <Modal
        visible={!!openBadge}
        backdropStyle={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        onBackdropPress={() => setOpenId(null)}
      >
        <Card disabled>
          <View style={{ gap: 12 }}>
            <Text category="h6">{openBadge?.name ?? "Badge"}</Text>

            <Text appearance="hint">
              {openBadge?.unlockText ?? ""}
            </Text>

            {!openEarned && openProgress?.progressLabel ? (
              <Card appearance="outline" disabled>
                <Text appearance="hint" category="c1">
                  {openProgress.progressLabel}
                </Text>
              </Card>
            ) : null}

            <Button appearance="outline" onPress={() => setOpenId(null)}>
              Close
            </Button>
          </View>
        </Card>
      </Modal>
    </>
  );
}
