import React from "react";
import { View } from "react-native";
import { Card, Text, Button } from "@ui-kitten/components";

type ConeLite = {
  id: string;
  name: string;
  description?: string;
};

function formatDistance(distanceMeters: number | null): string {
  if (distanceMeters == null) return "Distance —";
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  return `${(distanceMeters / 1000).toFixed(1)} km away`;
}

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
  return (
    <Card>
      <View style={{ gap: 12 }}>
        <Text category="h6">Nearest unclimbed</Text>

        {!cone ? (
          <Text appearance="hint">No cones found — check admin “active” flags.</Text>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ gap: 4 }}>
              <Text category="s1">{cone.name}</Text>

              {cone.description?.trim() ? (
                <Text appearance="hint" numberOfLines={2}>
                  {cone.description.trim()}
                </Text>
              ) : null}

              <Text appearance="hint" category="c1">
                {distanceMeters == null && locErr ? "Distance — (no GPS)" : formatDistance(distanceMeters)}
              </Text>
            </View>

            <Button appearance="outline" onPress={() => onOpenCone(cone.id)}>
              Open cone
            </Button>
          </View>
        )}
      </View>
    </Card>
  );
}
