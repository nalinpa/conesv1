import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { space } from "@/lib/ui/tokens";
import type { LocationStatus } from "@/lib/hooks/useUserLocation";

export function ConesListHeader({
  status,
  hasLoc,
  locErr,
  onPressGPS,
}: {
  status: LocationStatus;
  hasLoc: boolean;
  locErr: string;
  onPressGPS: () => void;
}) {
  const gpsButtonLabel = useMemo(() => {
    if (status === "denied") return "Enable location";
    return hasLoc ? "Refresh location" : "Enable location";
  }, [hasLoc, status]);

  return (
    <Stack gap="md">
      <Row justify="space-between" align="center" style={styles.headerRow}>
        <AppText variant="screenTitle">Volcanoes</AppText>

        <AppButton variant="secondary" size="sm" onPress={onPressGPS}>
          {gpsButtonLabel}
        </AppButton>
      </Row>

      <AppText variant="hint">
        Choose a volcano to explore across the Auckland Volcanic Field.
      </AppText>

      {status === "denied" ? (
        <CardShell status="warning">
          <AppText variant="body" style={styles.boldText}>
            Turn on location to see distances.
          </AppText>
        </CardShell>
      ) : null}

      {locErr ? (
        <CardShell status="danger">
          <AppText variant="body" style={styles.boldText}>
            We couldn’t get your location. Try again in a moment.
          </AppText>
        </CardShell>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    gap: space.md,
  },
  boldText: {
    fontWeight: "800",
  },
});
