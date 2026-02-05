import React, { useMemo } from "react";
import { View } from "react-native";
import { Button, Layout, Text } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
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
    if (status === "denied") return "Enable GPS";
    return hasLoc ? "Refresh GPS" : "Enable GPS";
  }, [hasLoc, status]);

  return (
    <Layout>
      <View style={{ marginBottom: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text category="h4" style={{ fontWeight: "900" }}>
            Cones
          </Text>

          <Button size="small" appearance="outline" onPress={onPressGPS}>
            {gpsButtonLabel}
          </Button>
        </View>

        <Text appearance="hint" style={{ marginTop: 6 }}>
          Tap a cone to view details and complete it when you’re in range.
        </Text>

        {status === "denied" ? (
          <View style={{ marginTop: 12 }}>
            <CardShell status="warning">
              <Text>Location permission denied — distances won’t be shown.</Text>
            </CardShell>
          </View>
        ) : null}

        {locErr ? (
          <View style={{ marginTop: 12 }}>
            <CardShell status="danger">
              <Text>{locErr}</Text>
            </CardShell>
          </View>
        ) : null}
      </View>
    </Layout>
  );
}
