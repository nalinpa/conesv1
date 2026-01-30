// components/progress/StatRow.tsx
import React from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";

export function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text appearance="hint" category="c1">
        {label}
      </Text>

      <Text category="s1">{value}</Text>
    </View>
  );
}
