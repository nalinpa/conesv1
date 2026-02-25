import React from "react";
import { StyleSheet } from "react-native";
import { AlertCircle, AlertTriangle, Info } from "lucide-react-native";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";

type Action = {
  label: string;
  onPress: () => void;
  appearance?: "filled" | "outline" | "ghost";
  status?: "basic" | "primary" | "success" | "warning" | "danger";
  size?: "tiny" | "small" | "medium";
  disabled?: boolean;
} | null | undefined;

const mapVariant = (app?: string, stat?: string): any => {
  if (app === "ghost") return "ghost";
  if (stat === "danger") return "danger";
  if (app === "outline") return "secondary";
  return "primary";
};

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
  const Icon = status === "danger" ? AlertCircle : status === "warning" ? AlertTriangle : Info;
  const iconColor = status === "danger" ? "#E11D48" : status === "warning" ? "#F59E0B" : "#64748B";

  const renderButton = (act: Action, isPrimary: boolean) => {
    if (!act) return null;
    return (
      <AppButton
        variant={mapVariant(act.appearance ?? (isPrimary ? "filled" : "outline"), act.status)}
        size={act.size === "medium" ? "md" : "sm"}
        onPress={act.onPress}
        disabled={act.disabled}
        style={styles.flex1}
      >
        {act.label}
      </AppButton>
    );
  };

  return (
    <CardShell status={status}>
      <Stack gap="md">
        <Row gap="sm" align="center">
          <AppIcon icon={Icon} color={iconColor} size={20} strokeWidth={2.5} />
          <AppText variant="sectionTitle" style={styles.flex1}>{title}</AppText>
        </Row>

        <AppText variant="hint">
          {typeof message === "string" ? message.trim() : "Please try again."}
        </AppText>

        {(action || secondaryAction) && (
          <Row gap="sm" style={styles.mt}>
            {renderButton(secondaryAction, false)}
            {renderButton(action, true)}
          </Row>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mt: { marginTop: 4 }
});