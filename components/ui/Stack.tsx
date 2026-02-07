import React from "react";
import { View } from "react-native";
import { space } from "@/lib/ui/tokens";

export function Stack({
  gap = "md",
  children,
}: {
  gap?: keyof typeof space;
  children: React.ReactNode;
}) {
  return <View style={{ gap: space[gap] }}>{children}</View>;
}
