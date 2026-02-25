import React from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import { Navigation, Info, AlertCircle } from "lucide-react-native";

import { CardShell } from "../ui/CardShell";
import { Stack } from "../ui/Stack";
import { Row } from "../ui/Row";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { AppIcon } from "../ui/AppIcon";
import { Pill } from "../ui/Pill";

import { formatDistanceMeters } from "../../lib/formatters";

type LocStatus = "unknown" | "granted" | "denied";

interface MapOverlayProps {
  title: string;
  distanceMeters: number;
  onOpen: () => void;
  locStatus: LocStatus;
  hasLoc: boolean;
  onRefreshGPS: () => void;
  refreshingGPS?: boolean;
}

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
}: MapOverlayProps) {
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
            <AppText variant="sectionTitle" status="control">
              GPS Disabled
            </AppText>
          </Row>
          <AppText variant="label" status="control">
            Enable location to track your proximity to the volcanic sites.
          </AppText>
          <Row gap="sm">
            <AppButton
              variant="danger"
              size="sm"
              style={styles.flex1}
              onPress={() => Linking.openSettings()}
            >
              Settings
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              style={styles.flex1}
              onPress={onRefreshGPS}
              loading={refreshingGPS}
            >
              Try Again
            </AppButton>
          </Row>
        </Stack>
      </CardShell>
    );
  }

  /* --- GPS SEARCHING --- */
  if (isRequesting || refreshingGPS) {
    return (
      <CardShell status="basic">
        <Row gap="md" align="center">
          <Stack style={styles.flex1}>
            <Row gap="sm" align="center">
              <ActivityIndicator color="#66B2A2" size="small" />
              <AppText variant="sectionTitle">Finding You...</AppText>
            </Row>
            <AppText variant="label" status="hint">
              {refreshingGPS
                ? "Refreshing location..."
                : "Getting a GPS lock on your position."}
            </AppText>
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
            <AppText variant="sectionTitle" numberOfLines={1}>
              {title}
            </AppText>
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
            <AppText variant="label" style={styles.whiteBold}>
              View Details
            </AppText>
            <AppIcon icon={Info} variant="control" size={14} />
          </Row>
        </AppButton>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  whiteBold: { fontWeight: "800", color: "#FFFFFF" },
  actionButton: {
    borderRadius: 12,
  },
});
