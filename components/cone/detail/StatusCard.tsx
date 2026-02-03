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
  | "completed"
  | "denied"
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
  locStatus: unknown; // ✅ tolerant input

  accuracyMeters: number | null;
  inRange: boolean;

  // Optional but strongly recommended for better copy
  distanceMeters?: number | null;
  checkpointRadiusMeters?: number | null;

  // ✅ allow async handler
  onRefreshGPS?: () => void | Promise<void>;

  /** Battery-friendly refresh UI: disable buttons while refreshing */
  refreshingGPS?: boolean;

  maxAccuracyMeters?: number;
}) {
  const status = normalizeLocStatus(locStatus);

  const gpsState: GPSState = useMemo(() => {
    if (completed) return "completed";
    if (status === "denied") return "denied";
    if (!loc) return "requesting";
    if (accuracyMeters != null && accuracyMeters > maxAccuracyMeters)
      return "low_accuracy";
    if (!inRange) return "too_far";
    return "ready";
  }, [completed, status, loc, accuracyMeters, maxAccuracyMeters, inRange]);

  const accuracyLabel = accuracyMeters == null ? "—" : `${Math.round(accuracyMeters)} m`;

  const distanceLabel =
    distanceMeters == null ? "—" : formatDistanceMeters(distanceMeters, "short");

  const radiusLabel =
    checkpointRadiusMeters == null ? "—" : formatMeters(checkpointRadiusMeters);

  const refreshLabel = refreshingGPS ? "Refreshing…" : "Refresh GPS";

  // --- COMPLETED ---
  if (gpsState === "completed") {
    return (
      <CardShell status="success">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Completed ✅
          </Text>

          <Text appearance="hint">Nice. You’ve already completed this cone.</Text>
        </View>
      </CardShell>
    );
  }

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
            <Text style={{ fontWeight: "800" }}>Open Settings</Text> → set Location to{" "}
            <Text style={{ fontWeight: "800" }}>While using the app</Text>.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              style={{ flex: 1 }}
              size="small"
              appearance="filled"
              status="danger"
              onPress={() => Linking.openSettings()}
              disabled={refreshingGPS}
            >
              Open Settings
            </Button>

            {onRefreshGPS ? (
              <Button
                style={{ flex: 1 }}
                size="small"
                appearance="outline"
                status="basic"
                onPress={onRefreshGPS}
                disabled={refreshingGPS}
              >
                {refreshingGPS ? "Please wait…" : "Try again"}
              </Button>
            ) : null}
          </View>

          {refreshingGPS ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Spinner size="tiny" />
              <Text appearance="hint" category="c1">
                Re-checking permission…
              </Text>
            </View>
          ) : null}
        </View>
      </CardShell>
    );
  }

  // --- REQUESTING / WAITING ---
  if (gpsState === "requesting") {
    return (
      <CardShell status="basic">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Waiting for GPS…
          </Text>

          <Text appearance="hint">
            We’re trying to get a location fix. If it’s taking ages, step outside or tap
            refresh.
          </Text>

          {onRefreshGPS ? (
            <Button
              size="small"
              appearance="outline"
              status="basic"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
            >
              {refreshLabel}
            </Button>
          ) : null}

          {refreshingGPS ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Spinner size="tiny" />
              <Text appearance="hint" category="c1">
                Getting a better fix…
              </Text>
            </View>
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
            Current accuracy: <Text style={{ fontWeight: "800" }}>{accuracyLabel}</Text>.
            We need ≤{" "}
            <Text style={{ fontWeight: "800" }}>{Math.round(maxAccuracyMeters)} m</Text>.
            Try moving to an open area, away from tall buildings/trees.
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

          {refreshingGPS ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Spinner size="tiny" />
              <Text appearance="hint" category="c1">
                Refreshing GPS…
              </Text>
            </View>
          ) : null}
        </View>
      </CardShell>
    );
  }

  // --- TOO FAR ---
  if (gpsState === "too_far") {
    const showDetails = distanceMeters != null && checkpointRadiusMeters != null;

    return (
      <CardShell status="warning">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Too far away
          </Text>

          <Text appearance="hint">
            You’re not in range yet. Move closer to the checkpoint.
          </Text>

          {showDetails ? (
            <View style={{ gap: 6 }}>
              <Text appearance="hint" category="c1">
                Distance: <Text style={{ fontWeight: "800" }}>{distanceLabel}</Text>
              </Text>
              <Text appearance="hint" category="c1">
                Required: within <Text style={{ fontWeight: "800" }}>{radiusLabel}</Text>
              </Text>
              <Text appearance="hint" category="c1">
                Accuracy: <Text style={{ fontWeight: "800" }}>{accuracyLabel}</Text>
              </Text>
            </View>
          ) : null}

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

  // --- READY ---
  return (
    <CardShell status="success">
      <View style={{ gap: 10 }}>
        <Text category="h6" style={{ fontWeight: "900" }}>
          In range ✅
        </Text>

        <Text appearance="hint">
          You’re close enough and your GPS accuracy is good. Hit{" "}
          <Text style={{ fontWeight: "800" }}>Complete</Text> when you’re ready.
        </Text>
      </View>
    </CardShell>
  );
}
