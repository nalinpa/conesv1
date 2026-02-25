import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { Navigation, MapPin, AlertCircle, Radar, ShieldCheck } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";

type GPSState =
  | "denied"
  | "unknown_permission"
  | "requesting"
  | "low_accuracy"
  | "too_far"
  | "ready";

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
  onRefreshGPS,
  refreshingGPS = false,
  maxAccuracyMeters = 50,
}: any) {
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

  const refreshLabel = refreshingGPS ? "Checking…" : "Refresh location";

  /* --- COMPLETED --- */
  if (completed) {
    return (
      <CardShell status="success">
        <Row gap="md" align="center">
          <AppIcon icon={ShieldCheck} variant="control" size={24} />
          <Stack style={styles.flex1}>
            <AppText variant="sectionTitle" status="control">
              Location Verified
            </AppText>
            <AppText variant="label" status="control">
              You've visited this site.
            </AppText>
          </Stack>
        </Row>
      </CardShell>
    );
  }

  /* --- DENIED --- */
  if (gpsState === "denied") {
    return (
      <CardShell status="danger">
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={AlertCircle} variant="control" size={20} />
            <AppText variant="sectionTitle" status="control">
              Location Disabled
            </AppText>
          </Row>
          <AppText variant="label" status="control">
            We need GPS to verify your visit and let you tap{" "}
            <AppText variant="label" status="control" style={styles.bold}>
              I’m here
            </AppText>
            .
          </AppText>
          <Row gap="sm">
            <AppButton
              variant="danger"
              size="sm"
              onPress={() => Linking.openSettings()}
              style={styles.flex1}
            >
              Open Settings
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              style={styles.flex1}
            >
              Try again
            </AppButton>
          </Row>
        </Stack>
      </CardShell>
    );
  }

  /* --- LOW ACCURACY / TOO FAR --- */
  if (gpsState === "low_accuracy" || gpsState === "too_far") {
    const isFar = gpsState === "too_far";
    return (
      <CardShell status="warning">
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={isFar ? Navigation : Radar} variant="warning" size={20} />
            <AppText variant="sectionTitle" style={styles.warningTitle}>
              {isFar ? "Almost there" : "Weak GPS Signal"}
            </AppText>
          </Row>
          <AppText variant="body" status="hint">
            {isFar
              ? `Get a little closer to this site to tap I'm here.`
              : `Accuracy is currently ${Math.round(accuracyMeters || 0)}m. Try moving to a clearer spot.`}
          </AppText>
          <AppButton
            variant="secondary"
            size="sm"
            onPress={onRefreshGPS}
            loading={refreshingGPS}
          >
            {refreshLabel}
          </AppButton>
        </Stack>
      </CardShell>
    );
  }

  /* --- READY --- */
  if (gpsState === "ready") {
    return (
      <CardShell status="surf">
        <Row gap="md" align="center">
          <AppIcon icon={MapPin} variant="surf" size={24} />
          <Stack style={styles.flex1}>
            <AppText variant="sectionTitle" status="surf">
              You’re here!
            </AppText>
            <AppText variant="label" status="surf">
              GPS verified. Tap{" "}
              <AppText variant="label" status="surf" style={styles.bold}>
                I’m here
              </AppText>{" "}
              below.
            </AppText>
          </Stack>
        </Row>
      </CardShell>
    );
  }

  /* --- DEFAULT / REQUESTING --- */
  return (
    <CardShell>
      <Stack gap="md">
        <Row gap="sm" align="center">
          <Radar size={20} color="#64748B" />
          <AppText variant="sectionTitle">Finding you...</AppText>
        </Row>
        <AppButton
          variant="secondary"
          size="sm"
          onPress={onRefreshGPS}
          loading={refreshingGPS}
        >
          {refreshLabel}
        </AppButton>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  bold: { fontWeight: "900" },
  warningTitle: { color: "#92400E" },
});
