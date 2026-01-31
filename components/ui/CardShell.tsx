import React from "react";
import {
  Pressable,
  View,
  StyleProp,
  ViewStyle,
  PressableStateCallbackType,
} from "react-native";
import { Layout, useTheme } from "@ui-kitten/components";

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
  status: CardStatus
): { borderColor: string; backgroundColor: string } {
  // These theme keys exist in Eva themes; if you use custom tokens, adjust here.
  // Fallbacks are intentionally conservative.
  const fallbackBorder = theme["color-basic-400"] ?? "#E5E5E5";
  const fallbackBg = theme["color-basic-100"] ?? "#FFFFFF";

  switch (status) {
    case "success":
      return {
        borderColor: theme["color-success-500"] ?? fallbackBorder,
        backgroundColor: theme["color-success-100"] ?? fallbackBg,
      };
    case "warning":
      return {
        borderColor: theme["color-warning-500"] ?? fallbackBorder,
        backgroundColor: theme["color-warning-100"] ?? fallbackBg,
      };
    case "danger":
      return {
        borderColor: theme["color-danger-500"] ?? fallbackBorder,
        backgroundColor: theme["color-danger-100"] ?? fallbackBg,
      };
    case "basic":
    default:
      return {
        borderColor: theme["color-basic-400"] ?? fallbackBorder,
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

  const Wrapper: React.ElementType = onPress ? Pressable : View;

  const wrapperStyle = ({ pressed }: PressableStateCallbackType) => {
    const base: ViewStyle = {
      borderRadius: 18,
      overflow: "hidden", // ensures press surface matches rounded card
    };

    // Subtle press feedback only when pressable & not disabled
    const pressFx: ViewStyle | undefined =
      onPress && !disabled
        ? {
            opacity: pressed ? 0.92 : 1,
          }
        : undefined;

    return [base, pressFx, style] as any;
  };

  return (
    <Wrapper
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={onPress ? wrapperStyle : ([{ borderRadius: 18, overflow: "hidden" }, style] as any)}
    >
      <Layout
        // Critical: don't let Layout eat touches when wrapped by Pressable
        pointerEvents="box-none"
        style={{
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor,
          backgroundColor,
        }}
      >
        {header ? <View style={{ marginBottom: 10 }}>{header}</View> : null}

        <View style={{ gap: 10 }}>{children}</View>

        {footer ? <View style={{ marginTop: 10 }}>{footer}</View> : null}
      </Layout>
    </Wrapper>
  );
}
