import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@ui-kitten/components";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";

export function PieChart({
  percent,
  size = 110, // Adjusted for dashboard density
  strokeWidth = 12,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const theme = useTheme();

  const clamped = Math.max(0, Math.min(1, percent));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * clamped;

  const track = "#E2E8F0"; 
  const progress = "#66B2A2"; 

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
        <AppText variant="h3" style={styles.percentText}>
          {Math.round(clamped * 100)}%
        </AppText>
        <AppText variant="label" status="hint" style={styles.completeLabel}>
          done
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
    justifyContent: "center",
  },
  percentText: {
    fontWeight: "900",
    lineHeight: 24,
  },
  completeLabel: {
    textTransform: "uppercase",
    fontSize: 10,
    marginTop: -2,
    fontWeight: "800",
  },
});