import React from "react";
import { StyleSheet } from "react-native";
import * as Linking from "expo-linking";

// Relative imports to ensure resolution
import { CardShell } from "../ui/CardShell";
import { Stack } from "../ui/Stack";
import { Row } from "../ui/Row";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";

import { formatDistanceMeters } from "../../lib/formatters";

type LocStatus = "unknown" | "granted" | "denied";

function normalizeLocStatus(v: unknown): LocStatus {
  if (v === "granted" || v === "denied" || v === "unknown") return v as LocStatus;
  return "unknown";
}

function titleCase(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function MapOverlayCard({
  title,
  distanceMeters,
  onOpen,
  locStatus,
  hasLoc,
  onRefreshGPS,
  refreshingGPS = false,
  checkpointLabel,
  checkpointRadiusMeters,
}: {
  title: string;
  distanceMeters: number | null;
  onOpen: () => void;
  locStatus: unknown;
  hasLoc: boolean;
  onRefreshGPS?: () => void;
  refreshingGPS?: boolean;
  checkpointLabel?: string | null;
  checkpointRadiusMeters?: number | null;
}) {
  const status = normalizeLocStatus(locStatus);
  const denied = status === "denied";
  const requesting = !denied && !hasLoc;

  if (denied) {
    return (
      <CardShell status="danger">
        <Stack gap="md">
          <AppText variant="sectionTitle">Location access denied</AppText>

          <AppText variant="hint" numberOfLines={3}>
            Enable location access in Settings to see your distance and complete cones.
          </AppText>

          <Row gap="sm">
            <AppButton
              variant="danger"
              size="sm"
              onPress={() => Linking.openSettings()}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Opening…"
              style={styles.flex1}
            >
              Open Settings
            </AppButton>

            {onRefreshGPS ? (
              <AppButton
                variant="ghost"
                size="sm"
                onPress={onRefreshGPS}
                disabled={refreshingGPS}
                loading={refreshingGPS}
                loadingLabel="Please wait…"
                style={styles.flex1}
              >
                Try again
              </AppButton>
            ) : null}
          </Row>

          {refreshingGPS ? <AppText variant="hint">Re-checking…</AppText> : null}
        </Stack>
      </CardShell>
    );
  }

  if (requesting) {
    return (
      <CardShell status="basic">
        <Stack gap="md">
          <AppText variant="sectionTitle">Waiting for GPS</AppText>

          <AppText variant="hint" numberOfLines={2}>
            Getting your current location…
          </AppText>

          {onRefreshGPS ? (
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
              loading={refreshingGPS}
              loadingLabel="Refreshing…"
            >
              Try again
            </AppButton>
          ) : null}

          {refreshingGPS ? <AppText variant="hint">Getting a better fix…</AppText> : null}
        </Stack>
      </CardShell>
    );
  }

  const distanceLabel = formatDistanceMeters(distanceMeters, "label");
  const cpLabelRaw = typeof checkpointLabel === "string" ? checkpointLabel.trim() : "";
  const cpLabel = cpLabelRaw ? titleCase(cpLabelRaw) : "Main point";

  const cpRadius =
    typeof checkpointRadiusMeters === "number" && Number.isFinite(checkpointRadiusMeters)
      ? Math.round(checkpointRadiusMeters)
      : null;

  return (
    <CardShell>
      <Stack gap="sm">
        <AppText variant="sectionTitle">{title}</AppText>

        <AppText variant="hint" numberOfLines={1}>
          {cpRadius != null ? `${cpLabel} • Radius ${cpRadius} m` : cpLabel}
        </AppText>

        <AppText variant="hint">{distanceLabel}</AppText>

        <AppButton
          variant="secondary"
          onPress={onOpen}
          disabled={refreshingGPS}
          loading={refreshingGPS}
          loadingLabel="Refreshing GPS…"
        >
          View cone
        </AppButton>

        {refreshingGPS ? <AppText variant="hint">Refreshing GPS…</AppText> : null}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
