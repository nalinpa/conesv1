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
            You’ve been here ✅
          </Text>
          <Text appearance="hint">This volcano is already marked as visited.</Text>
        </View>
      </CardShell>
    );
  }

  const status = normalizeLocStatus(locStatus);

  const gpsState: GPSState = useMemo(() => {
    if (status === "denied") return "denied";
    if (status === "unknown") return "unknown_permission";
    if (!loc) return "requesting";
    if (accuracyMeters != null && accuracyMeters > maxAccuracyMeters) return "low_accuracy";
    if (!inRange) return "too_far";
    return "ready";
  }, [status, loc, accuracyMeters, maxAccuracyMeters, inRange]);

  const accuracyLabel = accuracyMeters == null ? "—" : `${Math.round(accuracyMeters)} m`;

  const refreshLabel = refreshingGPS ? "Checking…" : "Refresh location";

  // --- DENIED ---
  if (gpsState === "denied") {
    return (
      <CardShell status="danger">
        <View style={{ gap: 10 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Turn on location
          </Text>

          <Text appearance="hint">
            We use location to show your distance and let you tap{" "}
            <Text style={{ fontWeight: "800" }}>I’m here</Text> when you’re nearby.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              style={{ flex: 1 }}
              size="small"
              status="danger"
              onPress={() => Linking.openSettings()}
              disabled={refreshingGPS}
              accessoryLeft={refreshingGPS ? () => <Spinner size="tiny" /> : undefined}
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
                Try again
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
            Turn on location
          </Text>

          <Text appearance="hint">
            Turn on location to see your distance and verify visits.
          </Text>

          {onRefreshGPS ? (
            <Button size="small" appearance="outline" onPress={onRefreshGPS} disabled={refreshingGPS}>
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
            Finding your location…
          </Text>

          <Text appearance="hint">
            If it’s taking a while, step outside or tap refresh.
          </Text>

          {onRefreshGPS ? (
            <Button size="small" appearance="outline" onPress={onRefreshGPS} disabled={refreshingGPS}>
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
            Location isn’t accurate yet
          </Text>

          <Text appearance="hint">
            Current accuracy: <Text style={{ fontWeight: "800" }}>{accuracyLabel}</Text>.{" "}
            Try standing still for a moment, then refresh.
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
            Not quite there yet
          </Text>

          <Text appearance="hint">Head a little closer and you’ll be able to tap I’m here.</Text>

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

  return (
    <CardShell status="success">
      <View style={{ gap: 10 }}>
        <Text category="h6" style={{ fontWeight: "900" }}>
          You’re close enough ✅
        </Text>

        <Text appearance="hint">
          When you’re ready, tap <Text style={{ fontWeight: "800" }}>I’m here</Text>.
        </Text>
      </View>
    </CardShell>
  );
}
