import React from "react";
import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";

export function ReviewsHeader({
  title,
  avg,
  count,
  onBack,
}: {
  title: string;
  avg: number | null;
  count: number;
  onBack: () => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text category="h4" style={{ fontWeight: "900" }}>
            Reviews
          </Text>
          <Text appearance="hint" style={{ marginTop: 4 }}>
            {count === 0
              ? "No reviews yet."
              : `★ ${avg?.toFixed(1)} / 5 (${count} review${count === 1 ? "" : "s"})`}
          </Text>
        </View>

        <Button size="small" appearance="outline" onPress={onBack}>
          Back
        </Button>
      </View>
    </View>
  );
}
