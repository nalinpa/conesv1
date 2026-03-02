import React from "react";
import { StyleSheet } from "react-native";
import { Button, ButtonProps } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Match the heavy, snappy physics of the CardShell
  const springConfig = { damping: 20, stiffness: 300 };

  const handlePressIn = () => {
    // Prevent animation and haptics if the button is disabled or loading
    if (disabled || loading) return; 
    
    // Buttons should squish slightly more than cards (0.96 vs 0.985)
    scale.value = withSpring(0.96, springConfig);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const buttonStyles = [
    styles.buttonBase,
    { minHeight },
    variant === "primary" && styles.primaryVariant,
    style,
  ];

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
        style={buttonStyles}
      >
        {loading ? loadingLabel : (children as any)}
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  buttonBase: {
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
  },
  primaryVariant: {
    backgroundColor: "#66B2A2",
    borderColor: "#66B2A2",
  },
});