import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "@ui-kitten/components";
import Svg, { Circle } from "react-native-svg";

export function PieChart({
  percent,
  size = 120,
  strokeWidth = 14,
}: {
  percent: number; // 0..1
  size?: number;
  strokeWidth?: number;
}) {
  const theme = useTheme();

  const clamped = Math.max(0, Math.min(1, percent));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * clamped;

  const track = theme["color-basic-300"] ?? "rgba(0,0,0,0.12)";
  const progress = theme["color-primary-500"] ?? "#3FAE8F"; // your surf-green-ish primary

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={progress}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${dash} ${c - dash}`}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View
        style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}
      >
        <Text category="h5">{Math.round(clamped * 100)}%</Text>
        <Text appearance="hint" category="c1">
          complete
        </Text>
      </View>
    </View>
  );
}
