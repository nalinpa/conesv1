import React from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { formatDistanceMeters } from "@/lib/formatters";

type ConeListItemProps = {
  id: string;
  name: string;
  description?: string;
  radiusMeters?: number | null;
  completed?: boolean;
  distanceMeters?: number | null;
  onPress: (coneId: string) => void;
};

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
    <CardShell
      onPress={() => onPress(id)}
    >
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
          {radiusMeters != null ? <Pill>Radius {radiusMeters}m</Pill> : null}
          {distanceMeters != null ? <Pill>{formatDistanceMeters(distanceMeters)}</Pill> : null}
        </View>
      </View>
    </CardShell>
  );
}
