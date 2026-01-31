import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

type ConeListItemProps = {
  id: string;
  name: string;
  description?: string;
  radiusMeters?: number | null;
  completed?: boolean;
  distanceMeters?: number | null;
  onPress: (coneId: string) => void;
};

function formatDistance(distanceMeters?: number | null) {
  if (distanceMeters == null) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export function ConeListItem({
  id,
  name,
  description,
  radiusMeters,
  completed = false,
  distanceMeters,
  onPress,
}: ConeListItemProps) {
  return (
    <Pressable onPress={() => onPress(id)}>
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.9 : 1 }}>
          <CardShell>
            <View style={{ gap: 10 }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text category="s1" style={{ fontWeight: "900", flexShrink: 1 }}>
                  {name}
                </Text>

                <Pill status={completed ? "success" : "basic"}>
                  {completed ? "Completed" : "Not completed"}
                </Pill>
              </View>

              {/* Description */}
              {description?.trim() ? (
                <Text appearance="hint" numberOfLines={2}>
                  {description.trim()}
                </Text>
              ) : null}

              {/* Meta row */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {radiusMeters != null ? (
                  <Pill>Radius {radiusMeters}m</Pill>
                ) : null}

                {distanceMeters != null ? (
                  <Pill>{formatDistance(distanceMeters)}</Pill>
                ) : null}
              </View>
            </View>
          </CardShell>
        </View>
      )}
    </Pressable>
  );
}
