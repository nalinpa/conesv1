import React from "react";
import { Pressable, ViewStyle, StyleSheet } from "react-native";
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
      style={[styles.base, disabled && styles.disabled, style]}
    >
      <Icon size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 6,
    borderRadius: 999,
  },
  disabled: {
    opacity: 0.5,
  },
});
