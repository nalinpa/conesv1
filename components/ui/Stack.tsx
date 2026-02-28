import React from "react";
import { View, ViewStyle } from "react-native";
import { space } from "@/lib/ui/tokens";

// Export Stack and also alias it as VStack so imports don't break
export { Stack as VStack };

interface StackProps {
  gap?: keyof typeof space;
  align?: ViewStyle["alignItems"]; // ADD THIS
  justify?: ViewStyle["justifyContent"]; // ADD THIS
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Stack({ gap, align, justify, children, style }: StackProps) {
  return (
    <View
      style={[
        {
          gap: gap ? space[gap] : undefined,
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
