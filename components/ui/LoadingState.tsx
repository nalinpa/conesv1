import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { Spinner } from "@ui-kitten/components";
import { AppText } from "@/components/ui/AppText";

interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
  size?: "tiny" | "small" | "medium" | "large" | "giant";
  style?: ViewStyle;
}

export function LoadingState({
  label = "Loading…",
  fullScreen = true,
  size = "giant",
  style,
}: LoadingStateProps) {
  const content = (
    <View style={[styles.contentContainer, style]}>
      <Spinner size={size} status="primary" />
      {label && (
        <AppText variant="hint" style={styles.labelText}>
          {label}
        </AppText>
      )}
    </View>
  );

  return (
    <View style={fullScreen ? styles.fullScreenContainer : style}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  labelText: {
    fontWeight: "700",
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
  },
});