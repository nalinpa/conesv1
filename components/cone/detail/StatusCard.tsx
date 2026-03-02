import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import { Navigation, MapPin, AlertCircle, Radar, ShieldCheck, Zap, RefreshCw } from "lucide-react-native";
import { MotiView } from "moti";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { Pill } from "@/components/ui/Pill";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

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

  const hasAccuracy = accuracyMeters !== null && accuracyMeters !== undefined;
  
  const pulseProps = {
    from: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: {
      type: 'timing' as const,
      duration: 1500,
      loop: true,
    },
  };

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
      <CardShell>
        <Row gap="md" align="center">
          <AppIcon icon={ShieldCheck} size={24} />
          <Stack style={styles.flex1}>
            <AppText variant="sectionTitle">
              You've been here!
            </AppText>
            <AppText variant="label" status="hint">
              Awesome job, your visit has been recorded.
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
              Accuracy is currently {Math.round(accuracyMeters || 0)}m. Try moving to a clearer spot.
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

  /* --- TOO FAR --- */
  if (gpsState === "too_far") {
    return (
      <CardShell status="warning">
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={Navigation} variant="warning" size={20} />
            <AppText variant="sectionTitle" style={styles.warningTitle}>
              Almost there
            </AppText>
          </Row>
          <AppText variant="body" status="hint">
            Get a little closer to this site to tap I'm here.
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
      <CardShell status={completed ? "basic" : "surf"}>
        <Stack gap="md">
          <Row justify="space-between" align="center">
            <Row gap="xs" align="center">
              <AppIcon icon={Navigation} variant="surf" size={16} />
              <AppText variant="label" style={styles.bold}>
                GPS Status
              </AppText>
            </Row>
            
            <View>
              <MotiView
                animate={{ opacity: loc && !completed ? [0.7, 1, 0.7] : 1 }}
                transition={{ type: 'timing', duration: 1500, loop: true }}
              >
                <Pill status={inRange ? "success" : "surf"} icon={inRange ? ShieldCheck : undefined}>
                  {inRange ? "In Range" : "Searching..."}
                </Pill>
              </MotiView>
            </View>
          </Row>

          <View style={styles.grid}>
            <Stack gap="xs" style={styles.gridItem}>
              <AppText variant="label" status="hint">Accuracy</AppText>
              <MotiView animate={{ opacity: refreshingGPS ? 0.5 : 1 }}>
                <AppText variant="sectionTitle">
                  {hasAccuracy ? `${Math.round(accuracyMeters)}m` : "--"}
                </AppText>
              </MotiView>
            </Stack>

            <Stack gap="xs" style={styles.gridItem}>
              <AppText variant="label" status="hint">Signal</AppText>
              <Row gap="xs" align="center">
                <AppIcon 
                  icon={Zap} 
                  size={14} 
                  variant={locStatus === "granted" ? "success" : "danger"} 
                />
                <AppText variant="body" style={styles.statusText}>
                  {locStatus === "granted" ? "Strong" : "Weak"}
                </AppText>
              </Row>
            </Stack>
          </View>

          <AppButton
            variant="ghost"
            size="sm"
            onPress={onRefreshGPS}
            disabled={refreshingGPS || completed}
            style={styles.refreshBtn}
          >
            <Row gap="xs" align="center">
              <MotiView
                animate={{ rotate: refreshingGPS ? '360deg' : '0deg' }}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: refreshingGPS,
                }}
              >
                <AppIcon icon={RefreshCw} size={14} variant="surf" />
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
  bold: { fontWeight: "900", color: "#0F172A" },
  grid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: space.md,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  gridItem: { flex: 1 },
  statusText: { textTransform: "capitalize", fontWeight: "600" },
  refreshBtn: { alignSelf: "flex-start", paddingHorizontal: 0 },
  warningTitle: { color: "#92400E" },
});
