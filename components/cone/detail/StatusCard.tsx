import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import { Navigation, AlertCircle, Radar, ShieldCheck, Zap, RefreshCw, MapPin, Footprints } from "lucide-react-native";
import { MotiView } from "moti";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { Pill } from "@/components/ui/Pill";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";
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
}

const APPROACHING_THRESHOLD = GAMEPLAY.APPROACHING_THRESHOLD

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
}: StatusCardProps) {
  const status = normalizeLocStatus(locStatus);
  const hasAccuracy = accuracyMeters !== null && accuracyMeters !== undefined;
  
  const gpsState: GPSState = useMemo(() => {
    if (status === "denied") return "denied";
    if (status === "unknown") return "unknown_permission";
    if (!loc) return "requesting";
    if (accuracyMeters != null && accuracyMeters > maxAccuracyMeters)
      return "low_accuracy";
    if (!inRange) {
      // Logic split: Approaching vs Too Far
      if (distanceMeters !== null && distanceMeters <= APPROACHING_THRESHOLD) {
        return "approaching";
      }
      return "too_far";
    }
    return "ready";
  }, [status, loc, accuracyMeters, maxAccuracyMeters, inRange, distanceMeters]);

  const refreshLabel = refreshingGPS ? "Checking…" : "Refresh location";

  /* --- COMPLETED --- */
  if (completed) {
    return (
      <CardShell status="basic">
        <Row gap="md" align="center">
          <View style={styles.successIconBg}>
            <ShieldCheck size={24} color="#10B981" />
          </View>
          <Stack style={styles.flex1}>
            <AppText variant="sectionTitle">
              Summit Verified
            </AppText>
            <AppText variant="label" status="hint">
              You've officially summited this volcano.
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
            We need GPS to verify your visit. Please enable permissions in your device settings.
          </AppText>
          <Row gap="sm">
            <AppButton variant="danger" size="sm" onPress={() => Linking.openSettings()} style={styles.flex1}>
              Open Settings
            </AppButton>
            <AppButton variant="secondary" size="sm" onPress={onRefreshGPS} style={styles.flex1}>
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
            Accuracy is {Math.round(accuracyMeters || 0)}m. We need {maxAccuracyMeters}m or better to verify your summit.
          </AppText>
          <AppButton variant="secondary" size="sm" onPress={onRefreshGPS} loading={refreshingGPS}>
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
            <Pill status="warning" icon={MapPin}>
              {Math.round(distanceMeters || 0)}m away
            </Pill>
          </Row>
          <AppText variant="body" status="hint">
            You're getting close! Get a little closer to the summit to mark your visit.
          </AppText>
          <AppButton variant="secondary" size="sm" onPress={onRefreshGPS} loading={refreshingGPS}>
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
            <AppText variant="sectionTitle">Volcano Nearby</AppText>
          </Row>
          <AppText variant="body" status="hint">
            Head toward the volcano summit to verify your visit and mark it as completed.
          </AppText>
          <AppButton variant="secondary" size="sm" onPress={onRefreshGPS} loading={refreshingGPS}>
            {refreshLabel}
          </AppButton>
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
              <AppText variant="label" style={styles.bold}>GPS Verified</AppText>
            </Row>
            <Pill status="success" icon={ShieldCheck}>In Range</Pill>
          </Row>

          <View style={styles.grid}>
            <Stack gap="xs" style={styles.gridItem}>
              <AppText variant="label" status="hint">Accuracy</AppText>
              <AppText variant="sectionTitle">{hasAccuracy ? `${Math.round(accuracyMeters)}m` : "--"}</AppText>
            </Stack>
            <Stack gap="xs" style={styles.gridItem}>
              <AppText variant="label" status="hint">Status</AppText>
              <Row gap="xs" align="center">
                <View style={styles.statusDot} />
                <AppText variant="body" style={styles.statusText}>Ready</AppText>
              </Row>
            </Stack>
          </View>

          <AppButton variant="ghost" size="sm" onPress={onRefreshGPS} disabled={refreshingGPS} style={styles.refreshBtn}>
            <Row gap="xs" align="center">
              <MotiView
                animate={{ rotate: refreshingGPS ? '360deg' : '0deg' }}
                transition={{ type: 'timing', duration: 1000, loop: refreshingGPS }}
              >
                <RefreshCw size={14} color="#5FB3A2" />
              </MotiView>
              <AppText variant="label" status="surf">
                {refreshingGPS ? "Updating..." : "Refresh GPS"}
              </AppText>
            </Row>
          </AppButton>
        </Stack>
      </CardShell>
    );
  }

  /* --- DEFAULT / REQUESTING --- */
  return (
    <CardShell>
      <Stack gap="md">
        <Row gap="sm" align="center">
          <Radar size={20} color="#64748B" />
          <AppText variant="sectionTitle">Finding your location...</AppText>
        </Row>
        <AppButton variant="secondary" size="sm" onPress={onRefreshGPS} loading={refreshingGPS}>
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
  grid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: space.md,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  gridItem: { flex: 1 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusText: { textTransform: "capitalize", fontWeight: "600", color: "#10B981" },
  refreshBtn: { alignSelf: "flex-start", paddingHorizontal: 0 },
  warningTitle: { color: "#92400E" },
});