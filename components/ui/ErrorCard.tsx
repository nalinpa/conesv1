import React from "react";
import { StyleSheet } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

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

function mapSize(size?: string): "sm" | "md" {
  // keep it simple: tiny/small -> sm, everything else -> md
  if (!size) return "sm";
  return size === "tiny" || size === "small" ? "sm" : "md";
}

function mapVariant(
  appearance?: "filled" | "outline" | "ghost",
  status?: "basic" | "primary" | "success" | "warning" | "danger" | "info",
): "primary" | "secondary" | "ghost" | "danger" {
  if (appearance === "ghost") return "ghost";
  if (status === "danger") return "danger";
  if (appearance === "outline") return "secondary";
  // default filled
  return "primary";
}

export function ErrorCard({
  title = "Couldn’t load that",
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

  const cleanMessage =
    typeof message === "string" && message.trim() ? message.trim() : "Please try again.";

  return (
    <CardShell status={status}>
      <Stack gap="md">
        <AppText variant="sectionTitle">{title}</AppText>

        <AppText variant="hint">{cleanMessage}</AppText>

        {hasActions ? (
          secondaryAction ? (
            <Row gap="sm">
              <AppButton
                variant={mapVariant(
                  secondaryAction.appearance ?? "outline",
                  secondaryAction.status ?? (status === "warning" ? "warning" : "basic"),
                )}
                size={mapSize(secondaryAction.size ?? "small")}
                onPress={secondaryAction.onPress}
                disabled={secondaryAction.disabled}
                style={styles.flex1}
              >
                {secondaryAction.label}
              </AppButton>

              {action ? (
                <AppButton
                  variant={mapVariant(
                    action.appearance ?? "filled",
                    action.status ?? (status === "warning" ? "warning" : "danger"),
                  )}
                  size={mapSize(action.size ?? "small")}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={styles.flex1}
                >
                  {action.label}
                </AppButton>
              ) : null}
            </Row>
          ) : action ? (
            <AppButton
              variant={mapVariant(
                action.appearance ?? "filled",
                action.status ?? (status === "warning" ? "warning" : "danger"),
              )}
              size={mapSize(action.size ?? "small")}
              onPress={action.onPress}
              disabled={action.disabled}
            >
              {action.label}
            </AppButton>
          ) : null
        ) : null}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
