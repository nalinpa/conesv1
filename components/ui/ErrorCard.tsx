import React from "react";
import { View } from "react-native";
import { Button, Text } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";

type Action =
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

export function ErrorCard({
  title = "Something went wrong",
  message,
  status = "danger",
  action,
}: {
  title?: string;
  message: string;
  status?: "danger" | "warning" | "basic";
  action?: Action;
}) {
  return (
    <CardShell status={status}>
      <View style={{ gap: 10 }}>
        <Text category="h6" style={{ fontWeight: "900" }}>
          {title}
        </Text>

        <Text status={status === "basic" ? "basic" : status} appearance="hint">
          {message}
        </Text>

        {action ? (
          <View style={{ marginTop: 6 }}>
            <Button
              size={action.size ?? "small"}
              appearance={action.appearance ?? "outline"}
              status={action.status ?? (status === "warning" ? "warning" : "danger")}
              onPress={action.onPress}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          </View>
        ) : null}
      </View>
    </CardShell>
  );
}
