import React from "react";
import { StyleProp, ViewStyle, Pressable, View, StyleSheet } from "react-native";
import { Layout, useTheme } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { space, radius, border as borderTok } from "@/lib/ui/tokens";
import { Stack } from "@/components/ui/Stack";

type CardStatus = "basic" | "success" | "warning" | "danger" | "surf";

type Props = {
  children: React.ReactNode;
  status?: CardStatus;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

function getStatusColors(theme: Record<string, any>, status: CardStatus) {
  switch (status) {
    case "surf":
      return { borderColor: "#66B2A2", backgroundColor: "#F0F9F7" };
    case "success":
      return { borderColor: "#22C55E", backgroundColor: "#F0FDF4" };
    case "warning":
      return { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" };
    case "danger":
      return { borderColor: "#EF4444", backgroundColor: "#FEF2F2" };
    case "basic":
    default:
      return {
        borderColor: theme["color-basic-500"] ?? "#D0D0D0",
        backgroundColor: theme["color-basic-100"] ?? "#FFFFFF",
      };
  }
}

export function CardShell({
  children,
  status = "basic",
  onPress,
  disabled,
  style,
  header,
  footer,
}: Props) {
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
      Haptics.selectionAsync();
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  const content = (
    <Layout
      pointerEvents="box-none"
      style={[
        styles.layout,
        {
          borderColor,
          backgroundColor,
        },
      ]}
    >
      {header && <View style={styles.header}>{header}</View>}
      <Stack gap="sm">{children}</Stack>
      {footer && <View style={styles.footer}>{footer}</View>}
    </Layout>
  );

  if (!onPress) {
    return <View style={[styles.outerWrapper, style]}>{content}</View>;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.outerWrapper}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  layout: {
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: borderTok.thick,
  },
  header: {
    marginBottom: space.sm,
  },
  footer: {
    marginTop: space.sm,
  },
});
