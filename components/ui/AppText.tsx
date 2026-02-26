import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "@ui-kitten/components";

const textStyles = {
  screenTitle: { fontSize: 28, fontWeight: "800" },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  h3: { fontSize: 18, fontWeight: "700" },
  body: { fontSize: 16, fontWeight: "500" },
  hint: { fontSize: 14, fontWeight: "500" },
  label: { fontSize: 12, fontWeight: "600" },
} as const;

type TextVariant = keyof typeof textStyles;

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  status?: "basic" | "hint" | "control" | "surf" | "danger";
}

export function AppText({ variant = "body", status = "basic", style, ...props }: AppTextProps) {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case "surf": return "#66B2A2";
      case "danger": return theme["color-danger-500"]; // Standard red
      case "hint": return theme["text-hint-color"];
      case "control": return theme["text-control-color"]; // Usually white
      case "basic":
      default: return theme["text-basic-color"];
    }
  };

  return (
    <Text
      style={[
        { color: getStatusColor() },
        textStyles[variant],
        style
      ]}
      {...props}
    />
  );
}