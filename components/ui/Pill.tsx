import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { border as borderTok, space } from "@/lib/ui/tokens";

type PillStatus = "basic" | "success" | "danger" | "info" | "surf";

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

  const getColors = () => {
    if (status === "surf") {
      return { border: "#66B2A2", bg: "#F0F9F7", text: "#4D8F82" };
    }
    const base = status === "info" ? "primary" : status;
    return {
      border: theme[`color-${base}-600`] ?? "#D0D0D0",
      bg: theme[`color-${base}-100`] ?? "#FFFFFF",
      text: theme[`color-${base}-800`] ?? "#111111",
    };
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: colors.bg,
          opacity: muted ? 0.7 : 1,
        },
        style,
      ]}
      {...props}
    >
      {Icon && <Icon size={14} color={colors.text} strokeWidth={2.5} />}

      <AppText variant="p1" style={[styles.text, { color: colors.text }]}>
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
    paddingVertical: 2,
    minHeight: 28,
    borderRadius: 999,
    borderWidth: borderTok.thick,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 11,
  },
});