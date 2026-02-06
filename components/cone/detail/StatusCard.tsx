import React, { useMemo } from "react";
import { View } from "react-native";
import { Text, Button, Spinner } from "@ui-kitten/components";
import * as Linking from "expo-linking";

import { CardShell } from "@/components/ui/CardShell";
import { formatDistanceMeters, formatMeters } from "@/lib/formatters";

/**
 * UI-only derived GPS states
 */
type GPSState =
  | "denied"
  | "unknown_permission"
  | "requesting"
  | "low_accuracy"
  | "too_far"
  | "ready";

/**
 * Normalize hook status (protect against accidental strings)
 */
function normalizeLocStatus(v: unknown): "unknown" | "granted" | "denied" {
  if (v === "granted" || v === "denied" || v === "unknown") return v;
  return "unknown";
}

export function StatusCard({
  completed,
  loc,
  locStatus,
  accuracyMeters,
  inRange,
  distanceMeters,
  checkpointRadiusMeters,
  onRefreshGPS,
  refreshingGPS = false,
  maxAccuracyMeters = 50,
}: {
  completed: boolean;

  loc: any | null;
  locStatus: unknown;

  accuracyMeters: number | null;
  inRange: boolean;

  distanceMeters?: number | null;
  checkpointRadiusMeters?: number | null;

  onRefreshGPS?: () => void | Promise<void>;
  refreshingGPS?: boolean;

  maxAccuracyMeters?: number;
}) {
  /* ---------------------------------
   * HARD COMPLETED EXIT
   * --------------------------------- */
  if (completed) {
    return (
      <CardShell status="success">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Completed ✅
          </Text>
          <Text appearance="hint">
            You’ve already completed this cone.
          </Text>
        </View>
      </CardShell>
    );
  }

  const status = normalizeLocStatus(locStatus);

  const gpsState: GPSState = useMemo(() => {
    if (status === "denied") return "denied";
    if (status === "unknown") return "unknown_permission";
    if (!loc) return "requesting";
    if (accuracyMeters != null && accuracyMeters > maxAccuracyMeters)
      return "low_accuracy";
    if (!inRange) return "too_far";
    return "ready";
  }, [status, loc, accuracyMeters, maxAccuracyMeters, inRange]);

  const accuracyLabel =
    accuracyMeters == null ? "—" : `${Math.round(accuracyMeters)} m`;

  const distanceLabel =
    distanceMeters == null
      ? "—"
      : formatDistanceMeters(distanceMeters, "short");

  const radiusLabel =
    checkpointRadiusMeters == null
      ? "—"
      : formatMeters(checkpointRadiusMeters);

  const refreshLabel = refreshingGPS ? "Refreshing…" : "Refresh GPS";

  // --- DENIED ---
  if (gpsState === "denied") {
    return (
      <CardShell status="danger">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Location permission denied
          </Text>

          <Text appearance="hint">
            To complete cones, Cones needs location access. Tap{" "}
            <Text style={{ fontWeight: "800" }}>Open Settings</Text> → set
            Location to{" "}
            <Text style={{ fontWeight: "800" }}>While using the app</Text>.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              style={{ flex: 1 }}
              size="small"
              status="danger"
              onPress={() => Linking.openSettings()}
              disabled={refreshingGPS}
              accessoryLeft={
                refreshingGPS ? () => <Spinner size="tiny" /> : undefined
              }
            >
              Open Settings
            </Button>

            {onRefreshGPS ? (
              <Button
                style={{ flex: 1 }}
                size="small"
                appearance="outline"
                onPress={onRefreshGPS}
                disabled={refreshingGPS}
              >
                Re-check
              </Button>
            ) : null}
          </View>
        </View>
      </CardShell>
    );
  }

  // --- UNKNOWN PERMISSION ---
  if (gpsState === "unknown_permission") {
    return (
      <CardShell>
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Enable location to continue
          </Text>

          <Text appearance="hint">
            Cones needs location access to show your distance and verify
            completion.
          </Text>

          {onRefreshGPS ? (
            <Button
              size="small"
              appearance="outline"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
            >
              Enable location
            </Button>
          ) : null}
        </View>
      </CardShell>
    );
  }

  // --- REQUESTING ---
  if (gpsState === "requesting") {
    return (
      <CardShell>
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Waiting for GPS…
          </Text>

          <Text appearance="hint">
            We’re trying to get a location fix. If it’s taking ages, step
            outside or tap refresh.
          </Text>

          {onRefreshGPS ? (
            <Button
              size="small"
              appearance="outline"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
            >
              {refreshLabel}
            </Button>
          ) : null}
        </View>
      </CardShell>
    );
  }

  // --- LOW ACCURACY ---
  if (gpsState === "low_accuracy") {
    return (
      <CardShell status="warning">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Accuracy too low
          </Text>

          <Text appearance="hint">
            Current accuracy:{" "}
            <Text style={{ fontWeight: "800" }}>{accuracyLabel}</Text>. We
            need ≤{" "}
            <Text style={{ fontWeight: "800" }}>
              {Math.round(maxAccuracyMeters)} m
            </Text>.
          </Text>

          {onRefreshGPS ? (
            <Button
              size="small"
              appearance="outline"
              status="warning"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
            >
              {refreshLabel}
            </Button>
          ) : null}
        </View>
      </CardShell>
    );
  }

  // --- TOO FAR ---
  if (gpsState === "too_far") {
    return (
      <CardShell status="warning">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Too far away
          </Text>

          <Text appearance="hint">
            You’re not in range yet. Move closer to the checkpoint.
          </Text>

          <View style={{ gap: 6 }}>
            <Text appearance="hint" category="c1">
              Distance:{" "}
              <Text style={{ fontWeight: "800" }}>{distanceLabel}</Text>
            </Text>
            <Text appearance="hint" category="c1">
              Required: within{" "}
              <Text style={{ fontWeight: "800" }}>{radiusLabel}</Text>
            </Text>
          </View>

          {onRefreshGPS ? (
            <Button
              size="small"
              appearance="outline"
              status="warning"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
            >
              {refreshLabel}
            </Button>
          ) : null}
        </View>
      </CardShell>
    );
  }

  // --- READY (ONLY for incomplete cones) ---
  return (
    <CardShell status="success">
      <View style={{ gap: 10 }}>
        <Text category="h6" style={{ fontWeight: "900" }}>
          In range ✅
        </Text>

        <Text appearance="hint">
          You’re close enough and your GPS accuracy is good. Tap{" "}
          <Text style={{ fontWeight: "800" }}>Complete</Text> when ready.
        </Text>
      </View>
    </CardShell>
  );
}
