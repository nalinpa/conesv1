import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { Stack } from "./Stack";
import { AppText } from "./AppText";
import { space } from "@/lib/ui/tokens";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  gap?: "sm" | "md" | "lg";
}

export function Section({ title, children, style, gap = "sm" }: SectionProps) {
  return (
    <View style={[styles.container, style]}>
      <Stack gap={gap}>
        {title && (
          <AppText variant="sectionTitle" status="basic">
            {title}
          </AppText>
        )}
        <View>{children}</View>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: space.md,
    width: "100%",
  },
});
