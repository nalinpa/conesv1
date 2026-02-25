import React from "react";
import { View, type ViewStyle } from "react-native";
import { space } from "@/lib/ui/tokens";

export function Stack({
  gap = "md",
  children,
  style,
}: {
  gap?: keyof typeof space;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[{ gap: space[gap] }, style]}>{children}</View>;
}
