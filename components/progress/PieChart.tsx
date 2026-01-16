import { View, Text } from "react-native";
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
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, percent));
  const dash = c * clamped;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke="rgba(148, 163, 184, 0.35)"
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="hsl(var(--primary))"
          fill="transparent"
          strokeDasharray={`${dash} ${c - dash}`}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View className="absolute items-center justify-center">
        <Text className="text-2xl font-extrabold text-foreground">
          {Math.round(clamped * 100)}%
        </Text>
        <Text className="text-xs text-muted-foreground">complete</Text>
      </View>
    </View>
  );
}
