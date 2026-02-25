import React from "react";
import { StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import { MapPin, Navigation, Info, AlertCircle, Loader2 } from "lucide-react-native";

import { CardShell } from "../ui/CardShell";
import { Stack } from "../ui/Stack";
import { Row } from "../ui/Row";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { AppIcon } from "../ui/AppIcon";
import { Pill } from "../ui/Pill";

import { formatDistanceMeters } from "../../lib/formatters";

type LocStatus = "unknown" | "granted" | "denied";

function normalizeLocStatus(v: unknown): LocStatus {
  if (v === "granted" || v === "denied" || v === "unknown") return v as LocStatus;
  return "unknown";
}

export function MapOverlayCard({
  title,
  distanceMeters,
  onOpen,
  locStatus,
  hasLoc,
  onRefreshGPS,
  refreshingGPS = false,
}: any) {
  const status = normalizeLocStatus(locStatus);
  const isDenied = status === "denied";
  const isRequesting = !isDenied && !hasLoc;

  /* --- GPS DENIED --- */
  if (isDenied) {
    return (
      <CardShell status="danger">
        <Stack gap="md">
          <Row gap="sm" align="center">
            <AppIcon icon={AlertCircle} variant="control" size={20} />
            <AppText variant="sectionTitle" status="control">GPS Disabled</AppText>
          </Row>
          <AppText variant="label" status="control">
            Enable location to track your proximity to the volcanic sites.
          </AppText>
          <Row gap="sm">
            <AppButton variant="danger" size="sm" style={styles.flex1} onPress={() => Linking.openSettings()}>
              Settings
            </AppButton>
            <AppButton variant="ghost" size="sm" style={styles.flex1} onPress={onRefreshGPS}>
              Try Again
            </AppButton>
          </Row>
        </Stack>
      </CardShell>
    );
  }

  /* --- GPS SEARCHING --- */
  if (isRequesting) {
    return (
      <CardShell status="basic">
        <Row gap="md" align="center">
          <AppIcon icon={Loader2} variant="hint" size={24} />
          <Stack style={styles.flex1}>
            <AppText variant="sectionTitle">Finding You...</AppText>
            <AppText variant="label" status="hint">Getting a GPS lock on your position.</AppText>
          </Stack>
        </Row>
      </CardShell>
    );
  }

  /* --- READY / SELECTED SITE --- */
  const distanceLabel = formatDistanceMeters(distanceMeters);

  return (
    <CardShell status="basic" onPress={onOpen}>
      <Stack gap="md">
        <Row justify="space-between" align="flex-start">
          <Stack style={styles.flex1} gap="xxs">
            <AppText variant="sectionTitle" numberOfLines={1}>{title}</AppText>
          </Stack>
          
          <Pill status="surf" icon={Navigation}>
            {distanceLabel}
          </Pill>
        </Row>

        <AppButton 
          variant="primary" 
          size="md" 
          onPress={onOpen}
          style={styles.actionButton}
        >
          <Row gap="xs" align="center">
            <AppText variant="label" status="control" style={styles.bold}>View Details</AppText>
            <AppIcon icon={Info} variant="control" size={14} />
          </Row>
        </AppButton>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  bold: { fontWeight: "800" },
  actionButton: {
    borderRadius: 12,
  }
});