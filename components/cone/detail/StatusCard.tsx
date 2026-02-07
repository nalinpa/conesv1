import React, { useMemo } from "react";
import * as Linking from "expo-linking";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

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
        <Stack gap="sm">
          <AppText variant="sectionTitle">You’ve been here ✓</AppText>
          <AppText variant="hint">This volcano is already marked as visited.</AppText>
        </Stack>
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
        <Stack gap="md">
          <AppText variant="sectionTitle">Turn on location</AppText>

          <AppText variant="hint">
            We use location to show your distance and let you tap{" "}
            <AppText variant="hint" style={{ fontWeight: "900" }}>
              I’m here
            </AppText>{" "}
            when you’re nearby.
          </AppText>

          <Row gap="sm">
            <AppButton
              variant="danger"
              size="sm"
              onPress={() => Linking.openSettings()}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Opening…"
              style={{ flex: 1 }}
            >
              Open Settings
            </AppButton>

            {onRefreshGPS ? (
              <AppButton
                variant="secondary"
                size="sm"
                onPress={onRefreshGPS}
                disabled={refreshingGPS}
                loading={refreshingGPS}
                loadingLabel="Checking…"
                style={{ flex: 1 }}
              >
                Try again
              </AppButton>
            ) : null}
          </Row>
        </Stack>
      </CardShell>
    );
  }

  // --- UNKNOWN PERMISSION ---
  if (gpsState === "unknown_permission") {
    return (
      <CardShell>
        <Stack gap="md">
          <AppText variant="sectionTitle">Turn on location</AppText>

          <AppText variant="hint">
            Turn on location to see your distance and verify visits.
          </AppText>

          {onRefreshGPS ? (
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Enabling…"
            >
              Enable location
            </AppButton>
          ) : null}
        </Stack>
      </CardShell>
    );
  }

  // --- REQUESTING ---
  if (gpsState === "requesting") {
    return (
      <CardShell>
        <Stack gap="md">
          <AppText variant="sectionTitle">Finding your location…</AppText>

          <AppText variant="hint">
            If it’s taking a while, step outside or tap refresh.
          </AppText>

          {onRefreshGPS ? (
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Checking…"
            >
              {refreshLabel}
            </AppButton>
          ) : null}
        </Stack>
      </CardShell>
    );
  }

  // --- LOW ACCURACY ---
  if (gpsState === "low_accuracy") {
    return (
      <CardShell status="warning">
        <Stack gap="md">
          <AppText variant="sectionTitle">Location isn’t accurate yet</AppText>

          <AppText variant="hint">
            Current accuracy:{" "}
            <AppText variant="hint" style={{ fontWeight: "900" }}>
              {accuracyLabel}
            </AppText>
            . Try standing still for a moment, then refresh.
          </AppText>

          {onRefreshGPS ? (
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Checking…"
            >
              {refreshLabel}
            </AppButton>
          ) : null}
        </Stack>
      </CardShell>
    );
  }

  // --- TOO FAR ---
  if (gpsState === "too_far") {
    return (
      <CardShell status="warning">
        <Stack gap="md">
          <AppText variant="sectionTitle">Not quite there yet</AppText>

          <AppText variant="hint">
            Head a little closer and you’ll be able to tap{" "}
            <AppText variant="hint" style={{ fontWeight: "900" }}>
              I’m here
            </AppText>
            .
          </AppText>

          {onRefreshGPS ? (
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Checking…"
            >
              {refreshLabel}
            </AppButton>
          ) : null}
        </Stack>
      </CardShell>
    );
  }

  // --- READY ---
  return (
    <CardShell status="success">
      <Stack gap="sm">
        <AppText variant="sectionTitle">You’re close enough ✓</AppText>

        <AppText variant="hint">
          When you’re ready, tap{" "}
          <AppText variant="hint" style={{ fontWeight: "900" }}>
            I’m here
          </AppText>
          .
        </AppText>
      </Stack>
    </CardShell>
  );
}
