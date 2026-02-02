import React from "react";
import { View } from "react-native";
import { Text, Button, Divider } from "@ui-kitten/components";
import { Pill } from "@/components/ui/Pill";
import { CardShell } from "../ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";

export function ConeStatusCard({
  loadingLocation,
  distanceMeters,
  accuracyMeters,
  inRange,
  onRefreshGps,
  errorText,
  showDistance = true,
  checkpointLabel,
}: {
  loadingLocation: boolean;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  inRange: boolean;
  onRefreshGps: () => void;
  errorText?: string;
  showDistance?: boolean;
  checkpointLabel?: string;
}) {
  return (
    <CardShell style={{ borderRadius: 18, padding: 16 }}>
      <Text category="h6" style={{ fontWeight: "900" }}>
        Status
      </Text>

      <View style={{ height: 12 }} />

      {loadingLocation ? (
        <LoadingState
          fullScreen={false}
          size="small"
          label={null as any}
          style={{ paddingVertical: 12 }}
        />
      ) : (
        <View style={{ gap: 12 }}>
          {/* Checkpoint */}
          {checkpointLabel ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text appearance="hint">Checkpoint</Text>
              <Pill>{checkpointLabel}</Pill>
            </View>
          ) : null}

          {/* Distance */}
          {showDistance ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text appearance="hint">Distance</Text>
              <Text style={{ fontWeight: "800" }}>
                {distanceMeters == null ? "—" : `${Math.round(distanceMeters)} m`}
              </Text>
            </View>
          ) : null}

          {/* Accuracy */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text appearance="hint">Accuracy</Text>
            <Text style={{ fontWeight: "800" }}>
              {accuracyMeters == null ? "—" : `${Math.round(accuracyMeters)} m`}
            </Text>
          </View>

          <Divider />

          {/* Range check */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text appearance="hint">Range</Text>
            <Pill status={inRange ? "success" : "danger"}>
              {inRange ? "In range" : "Not in range"}
            </Pill>
          </View>

          <Button appearance="outline" onPress={onRefreshGps}>
            Refresh GPS
          </Button>
        </View>
      )}

      {errorText ? (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            backgroundColor: "rgba(239,68,68,0.10)",
          }}
        >
          <Text status="danger">{errorText}</Text>
        </View>
      ) : null}
    </CardShell>
  );
}
