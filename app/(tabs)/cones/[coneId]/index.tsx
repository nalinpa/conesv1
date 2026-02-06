import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { formatDistanceMeters } from "@/lib/formatters";

type ConeLite = {
  id: string;
  name: string;
  description?: string;
};

export function NearestUnclimbedCard({
  cone,
  distanceMeters,
  locErr,
  onOpenCone,
}: {
  cone: ConeLite | null;
  distanceMeters: number | null;
  locErr?: string;
  onOpenCone: (coneId: string) => void;
}) {
  const hasDistance = distanceMeters != null;

  const distanceLabel =
    !hasDistance && locErr
      ? "Distance — (no GPS)"
      : hasDistance
        ? `Distance ${formatDistanceMeters(distanceMeters)}`
        : "Distance —";

  const pillLabel = hasDistance ? formatDistanceMeters(distanceMeters) : "—";

  return (
    <CardShell>
      <View style={{ gap: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text category="h6">Nearest unclimbed</Text>

          <Pill status={hasDistance ? "success" : "basic"}>{pillLabel}</Pill>
        </View>

        {!cone ? (
          <Text appearance="hint">No cones found — check admin “active” flags.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={{ gap: 4 }}>
              <Text category="s1" style={{ fontWeight: "800" }}>
                {cone.name}
              </Text>

              {cone.description?.trim() ? (
                <Text appearance="hint" numberOfLines={2}>
                  {cone.description.trim()}
                </Text>
              ) : null}

              <Text appearance="hint" category="c1">
                {distanceLabel}
              </Text>
            </View>

            <Pressable
              onPress={() => onOpenCone(cone.id)}
              hitSlop={10}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(100,116,139,0.25)",
              }}
            >
              <Text status="primary" style={{ fontWeight: "800" }}>
                Open cone
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </CardShell>
  );
}
