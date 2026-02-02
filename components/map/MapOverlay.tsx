import React from "react";
import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
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

  // ✅ now tolerant
  locStatus,
  hasLoc,
  onRefreshGPS,
}: {
  title: string;
  subtitle?: string;
  distanceMeters: number | null;
  onOpen: () => void;

  locStatus: unknown; // ✅ changed from LocStatus to unknown
  hasLoc: boolean;
  onRefreshGPS?: () => void;
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
            >
              Open Settings
            </Button>

            {onRefreshGPS ? (
              <Button
                size="small"
                appearance="ghost"
                status="basic"
                onPress={onRefreshGPS}
              >
                Try again
              </Button>
            ) : null}
          </View>
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
            <Button size="small" appearance="outline" onPress={onRefreshGPS}>
              Try again
            </Button>
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

        <Button appearance="outline" onPress={onOpen}>
          View cone
        </Button>
      </View>
    </CardShell>
  );
}
