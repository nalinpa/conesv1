import React from "react";
import { View, type ViewStyle, type FlexAlignType } from "react-native";
import { space } from "@/lib/ui/tokens";

type Gap = "xs" | "sm" | "md" | "lg" | "xl";

const GAP_PX: Record<Gap, number> = {
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
  justify?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  wrap?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: align,
          justifyContent: justify,
          gap: GAP_PX[gap],
          flexWrap: wrap ? "wrap" : "nowrap",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
