import React from "react";
import { View, StyleSheet, StatusBar, ScrollView, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface ScreenProps extends ViewProps {
  padded?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function Screen({
  padded = true,
  scrollable = false,
  style,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const Container = scrollable ? ScrollView : View;

  return (
    <LinearGradient colors={["#FFFFFF", "#F0F9F7"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Container
        style={[
          styles.flex1,
          {
            paddingTop: insets.top + (padded ? 18 : 8),
            paddingLeft: insets.left + (padded ? 16 : 0),
            paddingRight: insets.right + (padded ? 16 : 0),
          },
          style,
        ]}
        // ScrollView specific prop
        contentContainerStyle={
          scrollable
            ? [styles.contentGrow, { paddingBottom: insets.bottom + (padded ? 32 : 16) }]
            : undefined
        }
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </Container>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  contentGrow: {
    flexGrow: 1,
  },
});
