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
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Text appearance="hint" category="c1">
        {label}
      </Text>

      <View style={{ width: 10 }} />

      {typeof value === "string" || typeof value === "number" ? (
        <Text category="s1" style={{ fontWeight: "800" }}>
          {value}
        </Text>
      ) : (
        <View>{value}</View>
      )}
    </View>
  );
}
