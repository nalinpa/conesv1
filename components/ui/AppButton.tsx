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
  loadingLabel?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
};

export function AppButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading…",
  fullWidth = false,
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

  const springConfig = { damping: 20, stiffness: 300 };
  const isEffectivelyDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isEffectivelyDisabled) return;
    scale.value = withSpring(0.96, springConfig);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        isEffectivelyDisabled && styles.disabledWrapper,
        fullWidth && styles.fullWidth,
        style,
      ]}
      pointerEvents={isEffectivelyDisabled ? "none" : "auto"}
    >
      <Button
        {...rest}
        appearance={appearance}
        status={status}
        accessibilityState={{ disabled: !!isEffectivelyDisabled }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.buttonBase,
          { minHeight },
          fullWidth && styles.fullWidth,
          variant === "primary" && styles.primaryVariant,
        ]}
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
  disabledWrapper: {
    opacity: 0.5,
  },
  buttonBase: {
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
  },
  primaryVariant: {
    backgroundColor: "#66B2A2",
    borderColor: "#66B2A2",
  },
  fullWidth: {
    width: "100%",
  },
});
