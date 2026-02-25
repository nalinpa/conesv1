import React from "react";
import { StyleProp, ViewStyle, Pressable, View } from "react-native";
import { Layout, useTheme } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { space, radius, border as borderTok } from "@/lib/ui/tokens";
import { Stack } from "@/components/ui/Stack";

type CardStatus = "basic" | "success" | "warning" | "danger" | "surf"; // Added surf

type Props = {
  children: React.ReactNode;
  status?: CardStatus;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

// ... keep getStatusColors but add the "surf" case
function getStatusColors(theme: Record<string, any>, status: CardStatus) {
  if (status === "surf") {
    return { borderColor: "#66B2A2", backgroundColor: "#F0F9F7" };
  }
  // ... rest of your switch cases
  return {
    borderColor: theme["color-basic-500"] ?? "#D0D0D0",
    backgroundColor: theme["color-basic-100"] ?? "#FFFFFF",
  };
}

export function CardShell({ children, status = "basic", onPress, disabled, style, header, footer }: Props) {
  const theme = useTheme();
  const { borderColor, backgroundColor } = getStatusColors(theme, status);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, { damping: 15 });
      opacity.value = withSpring(0.92);
      Haptics.selectionAsync(); // Very light haptic tap
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  const content = (
    <Layout
      pointerEvents="box-none"
      style={{
        borderRadius: radius.md,
        padding: space.lg,
        borderWidth: borderTok.thick,
        borderColor,
        backgroundColor,
      }}
    >
      {header && <View style={{ marginBottom: space.sm }}>{header}</View>}
      <Stack gap="sm">{children}</Stack>
      {footer && <View style={{ marginTop: space.sm }}>{footer}</View>}
    </Layout>
  );

  if (!onPress) {
    return <View style={[{ borderRadius: radius.md, overflow: "hidden" }, style]}>{content}</View>;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ borderRadius: radius.md, overflow: "hidden" }}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}