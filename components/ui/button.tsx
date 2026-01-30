import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Button as KButton } from "@ui-kitten/components";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg";

type Props = React.ComponentProps<typeof KButton> & {
  variant?: Variant;
  size?: Size;
  className?: string;
};

function sizeStyle(size: Size): StyleProp<ViewStyle> {
  if (size === "sm") return { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 };
  if (size === "lg") return { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16 };
  return { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 };
}

export function Button({
  variant = "default",
  size = "default",
  style,
  appearance,
  status,
  ...props
}: Props) {
  // Map your variants to Kitten
  const mappedAppearance =
    variant === "outline" ? "outline" :
    variant === "ghost" ? "ghost" :
    "filled";

  const mappedStatus =
    variant === "destructive" ? "danger" :
    variant === "secondary" ? "basic" :
    "primary";

  return (
    <KButton
      appearance={(appearance ?? mappedAppearance) as any}
      status={(status ?? mappedStatus) as any}
      style={[sizeStyle(size), style as any]}
      {...props}
    />
  );
}
