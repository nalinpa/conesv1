// components/ui/Badge.tsx
import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@ui-kitten/components";

type Variant = "default" | "secondary" | "destructive" | "outline";

export function Badge({
  variant = "secondary",
  style,
  ...props
}: ViewProps & { variant?: Variant }) {
  const theme = useTheme();

  const containerStyle = {
    paddingHorizontal: theme["spacing-2"],
    paddingVertical: theme["spacing-1"],
    borderRadius: theme["border-radius-pill"],
    alignSelf: "flex-start" as const,
  };

  const variantStyle =
    variant === "default"
      ? {
          backgroundColor: theme["color-primary-100"],
          borderWidth: 1,
          borderColor: theme["color-primary-400"],
        }
      : variant === "destructive"
      ? {
          backgroundColor: theme["color-danger-100"],
          borderWidth: 1,
          borderColor: theme["color-danger-400"],
        }
      : variant === "outline"
      ? {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme["border-basic-color-3"],
        }
      : {
          backgroundColor: theme["background-basic-color-2"],
          borderWidth: 1,
          borderColor: theme["border-basic-color-2"],
        };

  return <View style={[containerStyle, variantStyle, style]} {...props} />;
}
