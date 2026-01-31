import React from "react";
import { View, ViewProps } from "react-native";
import { Text, useTheme } from "@ui-kitten/components";

type PillStatus = "basic" | "success" | "danger" | "info";

export function Pill({
  children,
  status = "basic",
  style,
  ...props
}: ViewProps & {
  status?: PillStatus;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  const colors = {
    basic: {
      border: theme["border-basic-color-3"],
      bg: "transparent",
      text: theme["text-basic-color"],
    },
    success: {
      border: theme["color-success-400"],
      bg: theme["color-success-100"],
      text: theme["color-success-700"],
    },
    danger: {
      border: theme["color-danger-400"],
      bg: theme["color-danger-100"],
      text: theme["color-danger-700"],
    },
    info: {
      border: theme["color-primary-400"],
      bg: theme["color-primary-100"],
      text: theme["color-primary-700"],
    },
  }[status];

  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.bg,
          alignSelf: "flex-start",
        },
        style,
      ]}
      {...props}
    >
      <Text category="c1" style={{ fontWeight: "700", color: colors.text }}>
        {children}
      </Text>
    </View>
  );
}
