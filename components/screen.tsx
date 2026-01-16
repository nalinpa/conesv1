import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

type ScreenProps = ViewProps & {
  padded?: boolean; // default true
};

export function Screen({ className, padded = true, style, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const basePadding = padded ? 16 : 0;
  const extraPaddingTop = padded ? 12 : 8;

  return (
    <View
      className={cn("flex-1 bg-background", className)}
      style={[
        padded
          ? {
              paddingTop: insets.top + basePadding + extraPaddingTop,
              paddingLeft: basePadding,
              paddingRight: basePadding,
              paddingBottom: basePadding,
            }
          : {
              paddingTop: insets.top + extraPaddingTop,
            },
        style,
      ]}
      {...props}
    />
  );
}
