import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { Spinner, Text } from "@ui-kitten/components";

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
      <Spinner size={size} />
      {label ? (
        <Text appearance="hint" category="s1" style={styles.labelText}>
          {label}
        </Text>
      ) : null}
    </View>
  );

  if (!fullScreen) {
    return content;
  }

  return <View style={styles.fullScreenContainer}>{content}</View>;
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
