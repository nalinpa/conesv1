import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

type ConeLite = {
  id: string;
  name: string;
  description?: string;
};

export function ConesToReviewCard({
  cones,
  onOpenCone,
}: {
  cones: ConeLite[];
  onOpenCone: (coneId: string) => void;
}) {
  if (!cones || cones.length === 0) return null;

  const visible = cones.slice(0, 3);
  const remaining = cones.length - visible.length;

  return (
    <CardShell>
      <View style={{ gap: 10 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text category="h6">Reviews to write</Text>
          <Pill status="info">{cones.length}</Pill>
        </View>

        <Text appearance="hint">
          You’ve been to these volcanoes — add a quick public review.
        </Text>

        {/* List */}
        <View style={{ gap: 12 }}>
          {visible.map((cone) => (
            <View key={cone.id} style={{ gap: 6 }}>
              <Text category="s1" style={{ fontWeight: "800" }}>
                {cone.name}
              </Text>

              {cone.description?.trim() ? (
                <Text appearance="hint" numberOfLines={2}>
                  {cone.description.trim()}
                </Text>
              ) : null}

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
                  Add a review
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Overflow hint */}
        {remaining > 0 ? (
          <Text appearance="hint" category="c1">
            + {remaining} more visited volcano{remaining === 1 ? "" : "es"}
          </Text>
        ) : null}
      </View>
    </CardShell>
  );
}
