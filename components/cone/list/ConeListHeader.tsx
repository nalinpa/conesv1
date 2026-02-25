import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Navigation, AlertCircle } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";

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
  const gpsLabel = useMemo(() => {
    if (status === "denied") return "Enable GPS";
    return hasLoc ? "Update GPS" : "Locate Me";
  }, [hasLoc, status]);

  return (
    <Stack gap="sm">
      <Row justify="space-between" align="center">
        <View>
          <AppText variant="screenTitle">Volcanoes</AppText>
          <AppText variant="label" status="hint">
            Auckland Volcanic Field
          </AppText>
        </View>

        <AppButton
          variant="ghost"
          size="sm"
          onPress={onPressGPS}
          style={styles.gpsButton}
        >
          <Row gap="xs" align="center">
            <AppIcon
              icon={status === "denied" ? AlertCircle : Navigation}
              variant={hasLoc ? "surf" : "hint"}
              size={14}
            />
            <AppText variant="label" status={hasLoc ? "surf" : "hint"}>
              {gpsLabel}
            </AppText>
          </Row>
        </AppButton>
      </Row>

      {/* Conditional Status Alerts */}
      {(status === "denied" || locErr) && (
        <CardShell status={locErr ? "danger" : "warning"} style={styles.alertCard}>
          <Row gap="sm" align="center">
            <AppIcon icon={AlertCircle} size={16} variant="control" />
            <AppText variant="label" style={styles.alertText}>
              {status === "denied"
                ? "Turn on location to sort by distance"
                : "Unable to find your location"}
            </AppText>
          </Row>
        </CardShell>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  gpsButton: {
    paddingHorizontal: 0,
  },
  alertCard: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    marginTop: 4,
  },
  alertText: {
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
