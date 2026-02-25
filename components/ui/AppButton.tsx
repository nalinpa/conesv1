import React from "react";
import { StyleSheet } from "react-native";
import { Button, ButtonProps } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from "react-native-reanimated";
import { space, radius, tap } from "@/lib/ui/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

type Props = Omit<ButtonProps, "children"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  loadingLabel?: string;
};

export function AppButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading…",
  disabled,
  style,
  children,
  onPress,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const appearance: ButtonProps["appearance"] = variant === "ghost" ? "ghost" : "filled";
  const status: ButtonProps["status"] = 
    variant === "danger" ? "danger" : variant === "secondary" ? "basic" : "primary";

  const minHeight = size === "sm" ? tap.min : tap.primary;

  // Animated style for the "Physical" press feel
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Button
        {...rest}
        appearance={appearance}
        status={status}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          {
            minHeight,
            paddingHorizontal: space.lg,
            borderRadius: radius.md,
            backgroundColor: variant === "primary" ? "#66B2A2" : undefined, // Injecting Surf Green
            borderColor: variant === "primary" ? "#66B2A2" : undefined,
          },
          style,
        ]}
      >
        {loading ? loadingLabel : children}
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
});