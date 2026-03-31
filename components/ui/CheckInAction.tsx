import React from "react";
import { StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { MotiView } from "moti";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";

interface CheckInActionProps {
  onCheckIn: () => void;
  saving: boolean;
  hasLoc: boolean;
  label?: string;
  variant?: "primary" | "secondary";
}

export function CheckInAction({
  onCheckIn,
  saving,
  hasLoc,
  label = "I’m here",
  variant = "primary",
}: CheckInActionProps) {
  return (
    <Stack gap="sm" style={styles.container}>
      <MotiView
        animate={{ scale: saving ? 0.95 : 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <AppButton
          variant={variant}
          size="md"
          onPress={onCheckIn}
          disabled={saving || !hasLoc}
          loading={saving}
          style={styles.heroButton}
        >
          <Row gap="sm" align="center">
            <AppIcon icon={CheckCircle2} variant="control" size={20} />
            <AppText variant="sectionTitle" status="control">
              {label}
            </AppText>
          </Row>
        </AppButton>
      </MotiView>

      {!hasLoc && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 400 }}
        >
          <AppText variant="label" status="hint" style={styles.center}>
            Turn on GPS to check in
          </AppText>
        </MotiView>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  heroButton: {
    height: 64,
    borderRadius: 18,
    // iOS Polished Shadows
    shadowColor: "#66B2A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  center: { textAlign: "center" },
});
