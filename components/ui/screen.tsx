import React, { useMemo } from "react";
import { View, type ViewProps, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@ui-kitten/components";

type ScreenProps = ViewProps & {
  padded?: boolean; // default true
};

export function Screen({ padded = true, style, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const basePadding = padded ? 16 : 0;
  const extraPaddingTop = padded ? 10 : 8;

  const dynamicStyle = useMemo(() => {
    return {
      // Use Kitten background token if available, fallback to white
      backgroundColor: (theme as any)["background-basic-color-1"] ?? "#ffffff",
      ...(padded
        ? {
            paddingTop: insets.top + basePadding + extraPaddingTop,
            paddingLeft: basePadding,
            paddingRight: basePadding,
            paddingBottom: basePadding,
          }
        : {
            paddingTop: insets.top + extraPaddingTop,
          }),
    };
  }, [theme, padded, insets.top, basePadding, extraPaddingTop]);

  return <View style={[styles.container, dynamicStyle, style]} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
