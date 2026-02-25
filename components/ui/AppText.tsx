import React from "react";
import { Text } from "react-native";
import { useTheme } from "@ui-kitten/components";
import { text } from "@/lib/ui/type";

export function AppText({ variant = "body", status, style, children, ...rest }: any) {
  const theme = useTheme();

  // Handle standard UI Kitten status colors manually
  const getStatusColor = () => {
    if (status === "surf") return "#66B2A2";
    if (status === "primary") return theme["color-primary-500"];
    if (status === "success") return theme["color-success-500"];
    if (status === "danger") return theme["color-danger-500"];
    if (status === "hint") return theme["text-hint-color"];
    return undefined; // Falls back to your token color or theme default
  };

  const statusStyle = { color: getStatusColor() };

  return (
    <Text
      {...rest}
      style={[{ color: theme["text-basic-color"] }, text[variant], statusStyle, style]}
    >
      {children}
    </Text>
  );
}
