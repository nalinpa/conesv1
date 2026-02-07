import React from "react";
import { Pressable, ViewStyle } from "react-native";
import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";

type Props = {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function AppIconButton({
  icon: Icon,
  onPress,
  size = 18,
  disabled,
  accessibilityLabel,
  style,
}: Props) {
  const theme = useTheme();
  const color = theme["text-basic-color"] ?? "#111";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          padding: 6,
          borderRadius: 999,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Icon size={size} color={color} />
    </Pressable>
  );
}
