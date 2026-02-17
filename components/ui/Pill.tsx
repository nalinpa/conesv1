import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { border as borderTok, space } from "@/lib/ui/tokens";

type PillStatus = "basic" | "success" | "danger" | "info";

export function Pill({
  children,
  status = "basic",
  icon: Icon,
  muted = false,
  style,
  ...props
}: ViewProps & {
  status?: PillStatus;
  icon?: LucideIcon;
  muted?: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  const pillOpacity = muted ? 0.7 : 1;
  const colors = {
    basic: {
      border: theme["color-basic-500"] ?? theme["border-basic-color-3"] ?? "#D0D0D0",
      bg: theme["color-basic-100"] ?? "#FFFFFF",
      text: theme["text-basic-color"] ?? "#111111",
    },
    success: {
      border: theme["color-success-600"] ?? theme["color-success-500"],
      bg: theme["color-success-200"] ?? theme["color-success-100"],
      text: theme["color-success-800"] ?? theme["color-success-700"],
    },
    danger: {
      border: theme["color-danger-600"] ?? theme["color-danger-500"],
      bg: theme["color-danger-200"] ?? theme["color-danger-100"],
      text: theme["color-danger-800"] ?? theme["color-danger-700"],
    },
    info: {
      border: theme["color-primary-600"] ?? theme["color-primary-500"],
      bg: theme["color-primary-200"] ?? theme["color-primary-100"],
      text: theme["color-primary-800"] ?? theme["color-primary-700"],
    },
  }[status];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: colors.bg,
          opacity: pillOpacity,
        },
        style,
      ]}
      {...props}
    >
      {Icon ? <Icon size={14} color={colors.text} /> : null}

      <AppText variant="label" style={[styles.text, { color: colors.text }]}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    minHeight: 32,
    borderRadius: 999,
    borderWidth: borderTok.thick,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "900",
  },
});
