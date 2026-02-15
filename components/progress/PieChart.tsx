import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@ui-kitten/components";
import Svg, { Circle } from "react-native-svg";

import { AppText } from "@/components/ui/AppText";
import { space } from "@/lib/ui/tokens";

export function PieChart({
  percent,
  size = 128,
  strokeWidth = 16,
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

  // Slightly bolder track so it reads on bright UI
  const track = theme["color-basic-400"] ?? "rgba(0,0,0,0.18)";
  const progress = theme["color-primary-500"] ?? "#3FAE8F";

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
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

      <View style={styles.labelContainer}>
        <AppText variant="sectionTitle" style={styles.percentText}>
          {Math.round(clamped * 100)}%
        </AppText>
        <AppText variant="hint" style={styles.completeText}>
          complete
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    position: "absolute",
    alignItems: "center",
  },
  percentText: {
    fontWeight: "900",
  },
  completeText: {
    marginTop: space.xs,
    fontWeight: "700",
  },
});
