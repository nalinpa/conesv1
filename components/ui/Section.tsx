import React from "react";
import { View, type ViewProps } from "react-native";
import { Card, Text, Button } from "@ui-kitten/components";

type SectionAction =
  | {
      label: string;
      onPress: () => void;
      appearance?: "filled" | "outline" | "ghost";
      status?: "basic" | "primary" | "success" | "warning" | "danger" | "info";
      size?: "tiny" | "small" | "medium" | "large" | "giant";
      disabled?: boolean;
    }
  | null
  | undefined;

export function Section({
  title,
  subtitle,
  action,
  children,
  style,
  contentStyle,
  card = true,
}: ViewProps & {
  title: string;
  subtitle?: string | null;
  action?: SectionAction;
  children: React.ReactNode;

  /** Wrap content in a Kitten Card (default true) */
  card?: boolean;

  /** Styles for the inner content container */
  contentStyle?: ViewProps["style"];
}) {
  const Header = (
    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text category="h6" style={{ fontWeight: "900" }}>
          {title}
        </Text>

        {subtitle ? (
          <Text appearance="hint" style={{ marginTop: 6 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? (
        <Button
          size={action.size ?? "small"}
          appearance={action.appearance ?? "outline"}
          status={action.status ?? "basic"}
          onPress={action.onPress}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ) : null}
    </View>
  );

  if (!card) {
    return (
      <View style={style}>
        {Header}
        <View style={[{ marginTop: 12 }, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <Card style={[{ borderRadius: 18, padding: 16 }, style]}>
      {Header}
      <View style={[{ marginTop: 12 }, contentStyle]}>{children}</View>
    </Card>
  );
}
