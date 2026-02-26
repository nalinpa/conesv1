import React, { useMemo } from "react";
import { View, type ViewStyle, type FlexAlignType, StyleSheet } from "react-native";
import { space } from "@/lib/ui/tokens";

type Gap = keyof typeof space;

const GAP_PX: Record<Gap, number> = {
  xxs: space.xxs,
  xs: space.xs,
  sm: space.sm,
  md: space.md,
  lg: space.lg,
  xl: space.xl,
};

export function Row({
  children,
  gap = "sm",
  align,
  justify,
  wrap = false,
  style,
}: {
  children: React.ReactNode;
  gap?: Gap;
  align?: FlexAlignType;
  justify?: ViewStyle["justifyContent"];
  wrap?: boolean;
  style?: ViewStyle;
}) {
  const dynamicStyle = useMemo(
    () => ({
      alignItems: align,
      justifyContent: justify,
      gap: GAP_PX[gap],
      flexWrap: wrap ? ("wrap" as const) : ("nowrap" as const),
    }),
    [align, justify, gap, wrap],
  );

  return <View style={[styles.row, dynamicStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});
