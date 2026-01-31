import React from "react";
import { View, type ViewStyle } from "react-native";
import { Spinner, Text } from "@ui-kitten/components";

export function LoadingState({
  label = "Loading…",
  fullScreen = true,
  size = "giant",
  style,
}: {
  label?: string;
  fullScreen?: boolean;
  size?: "tiny" | "small" | "medium" | "large" | "giant";
  style?: ViewStyle;
}) {
  const content = (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        },
        style,
      ]}
    >
      <Spinner size={size} />
      {label ? (
        <Text appearance="hint" category="s1" style={{ fontWeight: "700" }}>
          {label}
        </Text>
      ) : null}
    </View>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 48,
      }}
    >
      {content}
    </View>
  );
}
