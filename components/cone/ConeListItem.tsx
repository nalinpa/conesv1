import React from "react";
import { Pressable, View } from "react-native";
import { Card, Text } from "@ui-kitten/components";

type Cone = {
  id: string;
  name: string;
  description?: string;
  radiusMeters?: number;
};

export function ConeListItem({
  cone,
  distanceMeters,
  onPress,
}: {
  cone: Cone;
  distanceMeters: number | null;
  onPress: (coneId: string) => void;
}) {
  const distanceLabel =
    distanceMeters == null ? "Distance —" : `${Math.round(distanceMeters)} m`;

  return (
    <Pressable onPress={() => onPress(cone.id)}>
      <Card>
        <View style={{ gap: 8 }}>
          {/* Title */}
          <Text category="h6">
            {cone.name}
          </Text>

          {/* Description */}
          <Text appearance="hint" numberOfLines={2}>
            {cone.description?.trim()
              ? cone.description.trim()
              : "Tap to view details"}
          </Text>

          {/* Meta row */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 4,
            }}
          >
            {cone.radiusMeters != null ? (
              <Card appearance="outline">
                <Text category="c2">Radius {cone.radiusMeters}m</Text>
              </Card>
            ) : null}

            <Card appearance="outline">
              <Text category="c2">{distanceLabel}</Text>
            </Card>
          </View>

          {/* Action hint */}
          <Text
            status="primary"
            category="c1"
            style={{ marginTop: 4 }}
          >
            Open →
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
