import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { Card as KCard } from "@ui-kitten/components";

export function Card({
  style,
  children,
  ...props
}: ViewProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <KCard style={[{ borderRadius: 18 }, style]} {...(props as any)}>
      {children}
    </KCard>
  );
}

export function CardHeader({ style, ...props }: ViewProps) {
  return <View style={[{ marginBottom: 10 }, style]} {...props} />;
}

export function CardTitle({
  children,
  style,
  ...props
}: React.ComponentProps<typeof View> & { children: any }) {
  // Keep as View wrapper; actual title text uses your Text component
  return (
    <View style={[{ marginBottom: 2 }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 10 }, style]} {...props} />;
}
