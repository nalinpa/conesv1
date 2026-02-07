import React from "react";
import {
  Pressable,
  View,
  StyleProp,
  ViewStyle,
  PressableStateCallbackType,
} from "react-native";
import { Layout, useTheme } from "@ui-kitten/components";

import { space, radius, border as borderTok } from "@/lib/ui/tokens";
import { Stack } from "@/components/ui/Stack";

type CardStatus = "basic" | "success" | "warning" | "danger";

type Props = {
  children: React.ReactNode;
  status?: CardStatus;

  onPress?: () => void;
  disabled?: boolean;

  style?: StyleProp<ViewStyle>;

  /** Optional slots (safe to ignore) */
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

function getStatusColors(
  theme: Record<string, any>,
  status: CardStatus,
): { borderColor: string; backgroundColor: string } {
  const fallbackBorder = theme["color-basic-500"] ?? "#D0D0D0";
  const fallbackBg = theme["color-basic-100"] ?? "#FFFFFF";

  switch (status) {
    case "success":
      return {
        borderColor: theme["color-success-600"] ?? fallbackBorder,
        backgroundColor: theme["color-success-100"] ?? fallbackBg,
      };
    case "warning":
      return {
        borderColor: theme["color-warning-600"] ?? fallbackBorder,
        backgroundColor: theme["color-warning-100"] ?? fallbackBg,
      };
    case "danger":
      return {
        borderColor: theme["color-danger-600"] ?? fallbackBorder,
        backgroundColor: theme["color-danger-100"] ?? fallbackBg,
      };
    case "basic":
    default:
      return {
        borderColor: theme["color-basic-500"] ?? fallbackBorder,
        backgroundColor: theme["color-basic-100"] ?? fallbackBg,
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

  const baseStyle: ViewStyle = {
    borderRadius: radius.md,
    overflow: "hidden",
  };

  const Wrapper: React.ElementType = onPress ? Pressable : View;

  const wrapperStyle = ({ pressed }: PressableStateCallbackType) => {
    const base: ViewStyle = {
      borderRadius: radius.md,
      overflow: "hidden", // ensures press surface matches rounded card
    };

    const pressFx: ViewStyle | undefined =
      onPress && !disabled
        ? {
            opacity: pressed ? 0.92 : 1,
            transform: pressed ? [{ scale: 0.995 }] : [{ scale: 1 }],
          }
        : undefined;

    return [base, pressFx, style] as any;
  };

  return (
    <Wrapper
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={onPress ? wrapperStyle : [baseStyle, style]}
    >
      <Layout
        // Critical: don't let Layout eat touches when wrapped by Pressable
        pointerEvents="box-none"
        style={{
          borderRadius: radius.md,
          padding: space.lg,
          borderWidth: borderTok.thick,
          borderColor,
          backgroundColor,
        }}
      >
        {header ? <View style={{ marginBottom: space.sm }}>{header}</View> : null}

        <Stack gap="sm">{children}</Stack>

        {footer ? <View style={{ marginTop: space.sm }}>{footer}</View> : null}
      </Layout>
    </Wrapper>
  );
}
