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
  secondaryAction,
}: {
  title?: string;
  message: string;
  status?: "danger" | "warning" | "basic";
  action?: Action;
  secondaryAction?: Action;
}) {
  const hasActions = !!action || !!secondaryAction;

  return (
    <CardShell status={status}>
      <View style={{ gap: 10 }}>
        <Text category="h6" style={{ fontWeight: "900" }}>
          {title}
        </Text>

        <Text status={status === "basic" ? "basic" : status} appearance="hint">
          {message}
        </Text>

        {hasActions ? (
          <View
            style={{
              marginTop: 6,
              flexDirection: secondaryAction ? "row" : "column",
              gap: 10,
            }}
          >
            {secondaryAction ? (
              <Button
                style={{ flex: 1 }}
                size={secondaryAction.size ?? "small"}
                appearance={secondaryAction.appearance ?? "outline"}
                status={
                  secondaryAction.status ??
                  (status === "warning" ? "warning" : "basic")
                }
                onPress={secondaryAction.onPress}
                disabled={secondaryAction.disabled}
              >
                {secondaryAction.label}
              </Button>
            ) : null}

            {action ? (
              <Button
                style={{ flex: 1 }}
                size={action.size ?? "small"}
                appearance={action.appearance ?? "filled"}
                status={action.status ?? (status === "warning" ? "warning" : "danger")}
                onPress={action.onPress}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ) : null}
          </View>
        ) : null}
      </View>
    </CardShell>
  );
}
