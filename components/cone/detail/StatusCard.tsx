import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import {
  Navigation,
  AlertCircle,
  Radar,
  ShieldCheck,
  MapPin,
  Footprints,
  Map,
} from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { Pill } from "@/components/ui/Pill";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { GAMEPLAY } from "@/lib/constants/gameplay";

type GPSState =
  | "denied"
  | "unknown_permission"
  | "requesting"
  | "low_accuracy"
  | "too_far"
  | "approaching"
  | "ready";

function normalizeLocStatus(v: unknown): "unknown" | "granted" | "denied" {
  if (v === "granted" || v === "denied" || v === "unknown") return v;
  return "unknown";
}

interface StatusCardProps {
  completed: boolean;
  loc: any;
  locStatus: string;
  accuracyMeters: number | null;
  distanceMeters: number | null;
  inRange: boolean;
  onRefreshGPS: () => void;
  refreshingGPS?: boolean;
  maxAccuracyMeters?: number;
  onGetDirections?: () => void;
}

const APPROACHING_THRESHOLD = GAMEPLAY.APPROACHING_THRESHOLD;

export function StatusCard({
  completed,
  loc,
  locStatus,
  accuracyMeters,
  distanceMeters,
  inRange,
  onRefreshGPS,
  refreshingGPS = false,
  maxAccuracyMeters = 50,
  onGetDirections,
}: StatusCardProps) {
  const status = normalizeLocStatus(locStatus);

  const gpsState: GPSState = useMemo(() => {
    if (status === "denied") return "denied";
    if (status === "unknown") return "unknown_permission";
    if (!loc) return "requesting";
    if (accuracyMeters != null && accuracyMeters > maxAccuracyMeters)
      return "low_accuracy";
    if (!inRange) {
      if (distanceMeters !== null && distanceMeters <= APPROACHING_THRESHOLD) {
        return "approaching";
      }
      return "too_far";
    }
    return "ready";
  }, [status, loc, accuracyMeters, maxAccuracyMeters, inRange, distanceMeters]);

  const refreshLabel = refreshingGPS ? "Checking…" : "Refresh GPS";

  /* --- COMPLETED --- */
  if (completed) {
    return (
      <CardShell status="basic">
        <Row gap="md" align="center">
          <View style={styles.successIconBg}>
            <ShieldCheck size={24} color="#10B981" />
          </View>
          <Stack style={styles.flex1}>
            <AppText variant="sectionTitle">You Made It!</AppText>
            <AppText variant="label" status="hint">
              You've explored this volcano.
            </AppText>
          </Stack>
        </Row>
      </CardShell>
    );
  }

  /* --- DENIED / PERMISSION ISSUES --- */
  if (gpsState === "denied" || gpsState === "unknown_permission") {
    return (
      <CardShell status="danger">
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={AlertCircle} variant="control" size={20} />
            <AppText variant="sectionTitle" status="control">
              Location Required
            </AppText>
          </Row>
          <AppText variant="label" status="control">
            We need GPS to verify your visit. Please enable permissions in your device
            settings.
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

  /* --- LOW ACCURACY --- */
  if (gpsState === "low_accuracy") {
    return (
      <CardShell status="warning">
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={Radar} variant="warning" size={20} />
            <AppText variant="sectionTitle" style={styles.warningTitle}>
              Weak GPS Signal
            </AppText>
          </Row>
          <AppText variant="body" status="hint">
            Your GPS signal is too weak to verify your visit.
          </AppText>

          <View style={styles.disclaimerBox}>
            <AppText variant="label" style={styles.disclaimerText}>
              Tip: Step away from tall trees, buildings, or deep craters to get a clearer
              view of the sky.
            </AppText>
          </View>

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

  /* --- APPROACHING (<= 500m) --- */
  if (gpsState === "approaching") {
    return (
      <CardShell status="warning">
        <Stack gap="md">
          <Row justify="space-between" align="center">
            <Row gap="sm" align="center">
              <AppIcon icon={Navigation} variant="warning" size={20} />
              <AppText variant="sectionTitle" style={styles.warningTitle}>
                Keep Going!
              </AppText>
            </Row>
            <Pill status="danger" icon={MapPin}>
              {Math.round(distanceMeters || 0)}m away
            </Pill>
          </Row>
          <AppText variant="body" status="hint">
            You're getting close! Get a little closer to the center to mark your visit.
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

  /* --- TOO FAR (> 500m) --- */
  if (gpsState === "too_far") {
    return (
      <CardShell>
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={Footprints} size={20} color="#64748B" />
            <AppText variant="sectionTitle">Start the Journey</AppText>
          </Row>
          <AppText variant="body" status="hint">
            Make your way to this volcano to mark your visit.
          </AppText>
          <Row gap="sm">
            {onGetDirections && (
              <AppButton
                variant="primary"
                size="sm"
                onPress={onGetDirections}
                style={styles.flex1}
              >
                <Row gap="xs" align="center" justify="center">
                  <Map size={16} color="#FFF" />
                  <AppText variant="label" style={styles.directionsText}>
                    Directions
                  </AppText>
                </Row>
              </AppButton>
            )}
            <AppButton
              variant="secondary"
              size="sm"
              onPress={onRefreshGPS}
              loading={refreshingGPS}
              style={styles.flex1}
            >
              {refreshLabel}
            </AppButton>
          </Row>
        </Stack>
      </CardShell>
    );
  }

  /* --- READY / IN RANGE --- */
  if (gpsState === "ready") {
    return (
      <CardShell status="surf">
        <Stack gap="md">
          <Row justify="space-between" align="center">
            <Row gap="xs" align="center">
              <AppIcon icon={Navigation} variant="surf" size={16} />
              <AppText variant="label" style={styles.bold}>
                GPS Verified
              </AppText>
            </Row>
            <Pill status="success" icon={ShieldCheck}>
              In Range
            </Pill>
          </Row>

          <AppText variant="body" style={styles.bold}>
            You are in range and ready to check in!
          </AppText>
        </Stack>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <Stack gap="md">
        <Row gap="sm" align="center">
          <Radar size={20} color="#64748B" />
          <AppText variant="sectionTitle">Finding your location...</AppText>
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
  bold: { fontWeight: "900", color: "#0F172A" },
  successIconBg: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 12,
  },
  refreshBtn: { alignSelf: "flex-start", paddingHorizontal: 0 },
  warningTitle: { color: "#92400E" },
  disclaimerBox: {
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  disclaimerText: {
    color: "#92400E",
    fontSize: 12,
  },
  directionsText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
