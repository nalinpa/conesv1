import React from "react";
import { StyleSheet, ViewStyle, View } from "react-native";
import { Button, ButtonProps } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { space, radius, tap } from "@/lib/ui/tokens";
import { AppText } from "./AppText";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "hero" | "white";
type Size = "md" | "sm" | "lg";

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

  // UI Kitten Mappings
  const appearance: ButtonProps["appearance"] = variant === "ghost" ? "ghost" : "filled";
  const status: ButtonProps["status"] =
    variant === "danger"
      ? "danger"
      : variant === "secondary"
        ? "basic"
        : variant === "white"
          ? "control"
          : "primary";

  // Height mapping: lg = 64px for Hero presence
  const minHeight = size === "sm" ? tap.min : size === "lg" ? 64 : tap.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const springConfig = { damping: 20, stiffness: 300 };
  const isEffectivelyDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isEffectivelyDisabled) return;
    scale.value = withSpring(0.96, springConfig);

    // Heavy haptic for Hero, Light for standard
    const hapticStyle =
      variant === "hero"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(hapticStyle);
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
        style as ViewStyle,
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
          variant === "hero" && styles.heroVariant,
          variant === "white" && styles.whiteVariant,
        ]}
      >
        {/* Passing a function to children bypasses UI Kitten's 
          internal Text styling, giving you 100% control over fontSize.
        */}
        {() => (
          <View>
            {typeof children === "string" ? (
              <AppText
                style={[
                  styles.commonText,
                  size === "lg" && styles.largeText,
                  variant === "hero" && styles.heroText,
                  variant === "white" && styles.whiteText,
                ]}
              >
                {loading ? loadingLabel : children}
              </AppText>
            ) : (
              children
            )}
          </View>
        )}
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
    borderWidth: 2,
  },
  fullWidth: {
    width: "100%",
  },
  // --- TEXT STYLES ---
  commonText: {
    fontWeight: "700",
    textAlign: "center",
  },
  largeText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heroText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  whiteText: {
    color: "#0F172A",
  },
  // --- VARIANT STYLES ---
  primaryVariant: {
    backgroundColor: "#66B2A2",
    borderColor: "#66B2A2",
  },
  heroVariant: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
    borderRadius: radius.lg,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  whiteVariant: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
});
