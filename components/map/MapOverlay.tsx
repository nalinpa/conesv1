import React from "react";
import { View } from "react-native";
import { Text, Button, Spinner } from "@ui-kitten/components";
import * as Linking from "expo-linking";

import { CardShell } from "../ui/CardShell";
import { formatDistanceMeters } from "@/lib/formatters";

type LocStatus = "unknown" | "granted" | "denied";

/** Accept whatever comes in and normalize */
function normalizeLocStatus(v: unknown): LocStatus {
  if (v === "granted" || v === "denied" || v === "unknown") return v;
  return "unknown";
}

export function MapOverlayCard({
  title,
  subtitle,
  distanceMeters,
  onOpen,

  // tolerant
  locStatus,
  hasLoc,
  onRefreshGPS,

  // ✅ new: battery-friendly refresh UI state
  refreshingGPS = false,
}: {
  title: string;
  subtitle?: string;
  distanceMeters: number | null;
  onOpen: () => void;

  locStatus: unknown;
  hasLoc: boolean;
  onRefreshGPS?: () => void;

  /** Disable buttons / show spinner while refresh is running */
  refreshingGPS?: boolean;
}) {
  const status = normalizeLocStatus(locStatus);

  const denied = status === "denied";
  const requesting = !denied && !hasLoc;

  if (denied) {
    return (
      <CardShell status="danger">
        <View style={{ gap: 10 }}>
          <Text category="s1" style={{ fontWeight: "900" }}>
            Location access denied
          </Text>

          <Text appearance="hint" numberOfLines={3}>
            Enable location access in Settings to see your distance and complete cones.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              size="small"
              appearance="outline"
              status="danger"
              onPress={() => Linking.openSettings()}
              disabled={refreshingGPS}
            >
              Open Settings
            </Button>

            {onRefreshGPS ? (
              <Button
                size="small"
                appearance="ghost"
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
                Re-checking…
              </Text>
            </View>
          ) : null}
        </View>
      </CardShell>
    );
  }

  if (requesting) {
    return (
      <CardShell status="basic">
        <View style={{ gap: 10 }}>
          <Text category="s1" style={{ fontWeight: "900" }}>
            Waiting for GPS
          </Text>

          <Text appearance="hint" numberOfLines={2}>
            Getting your current location…
          </Text>

          {onRefreshGPS ? (
            <Button
              size="small"
              appearance="outline"
              onPress={onRefreshGPS}
              disabled={refreshingGPS}
            >
              {refreshingGPS ? "Refreshing…" : "Try again"}
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

  const distanceLabel = formatDistanceMeters(distanceMeters, "label");

  return (
    <CardShell>
      <View style={{ gap: 8 }}>
        <Text category="s1">{title}</Text>

        {subtitle ? (
          <Text appearance="hint" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}

        <Text appearance="hint">{distanceLabel}</Text>

        <Button appearance="outline" onPress={onOpen} disabled={refreshingGPS}>
          View cone
        </Button>

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
