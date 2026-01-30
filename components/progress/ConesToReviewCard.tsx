import React from "react";
import { View } from "react-native";
import { Card, Text, Button } from "@ui-kitten/components";

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
    <Card>
      <View style={{ gap: 12 }}>
        {/* Header */}
        <Text category="h6">Cones to review</Text>

        <Text appearance="hint">
          You’ve completed these — leave a quick public review.
        </Text>

        {/* List */}
        <View style={{ gap: 8 }}>
          {visible.map((cone) => (
            <View key={cone.id} style={{ gap: 4 }}>
              <Text category="s1">{cone.name}</Text>

              <Button
                size="small"
                appearance="outline"
                onPress={() => onOpenCone(cone.id)}
              >
                Leave review
              </Button>
            </View>
          ))}
        </View>

        {/* Overflow hint */}
        {remaining > 0 ? (
          <Text appearance="hint" category="c1">
            + {remaining} more completed cones
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
