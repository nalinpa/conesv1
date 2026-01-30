import React from "react";
import { View, ViewProps } from "react-native";
import { Text } from "@/components/ui/text";

type Props = ViewProps & {
  nativeID?: string;
  children: React.ReactNode;
};

export function Label({ children, style, ...props }: Props) {
  return (
    <View style={[{ marginBottom: 6 }, style]} {...props}>
      <Text variant="small" style={{ fontWeight: "700" }}>
        {children}
      </Text>
    </View>
  );
}
