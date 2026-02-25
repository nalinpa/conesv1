import React from "react";
import { Pressable, ViewStyle, StyleSheet } from "react-native";
import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from "react-native-reanimated";

type Props = {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  variant?: "basic" | "surf" | "control";
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function AppIconButton({
  icon: Icon,
  onPress,
  size = 20, // Slightly bumped for better tap targets
  variant = "basic",
  disabled,
  accessibilityLabel,
  style,
}: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  // Determine color based on variant
  const iconColor = variant === "surf" 
    ? "#66B2A2" 
    : variant === "control" 
      ? "#FFFFFF" 
      : (theme["text-basic-color"] ?? "#111");

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 12 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        hitSlop={12} 
        style={({ pressed }) => [
          styles.base,
          pressed && { backgroundColor: variant === "surf" ? "#66B2A220" : "#00000008" },
          disabled && styles.disabled,
        ]}
      >
        <Icon size={size} color={iconColor} strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 10, 
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.3,
  },
});