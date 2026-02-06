import React from "react";
import { View } from "react-native";
import { Text, Button, Spinner } from "@ui-kitten/components";
import * as Linking from "expo-linking";

import { CardShell } from "../ui/CardShell";
import { formatDistanceMeters } from "@/lib/formatters";

type LocStatus = "unknown" | "granted" | "denied";

function normalizeLocStatus(v: unknown): LocStatus {
  if (v === "granted" || v === "denied" || v === "unknown") return v;
  return "unknown";
}

function titleCase(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function MapOverlayCard({
  title,
  subtitle,
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
  subtitle?: string;
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
              accessoryLeft={refreshingGPS ? () => <Spinner size="tiny" /> : undefined}
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
                accessoryLeft={refreshingGPS ? () => <Spinner size="tiny" /> : undefined}
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
              accessoryLeft={refreshingGPS ? () => <Spinner size="tiny" /> : undefined}
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

  const cpLabelRaw = typeof checkpointLabel === "string" ? checkpointLabel.trim() : "";
  const cpLabel = cpLabelRaw ? titleCase(cpLabelRaw) : "Main point";

  const cpRadius =
    typeof checkpointRadiusMeters === "number" && Number.isFinite(checkpointRadiusMeters)
      ? Math.round(checkpointRadiusMeters)
      : null;

  return (
    <CardShell>
      <View style={{ gap: 8 }}>
        <Text category="s1">{title}</Text>

        {subtitle ? (
          <Text appearance="hint" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}

        <Text appearance="hint" category="c1" numberOfLines={1}>
          {cpRadius != null ? `${cpLabel} • Radius ${cpRadius} m` : cpLabel}
        </Text>

        <Text appearance="hint">{distanceLabel}</Text>

        <Button
          appearance="outline"
          onPress={onOpen}
          disabled={refreshingGPS}
          accessoryLeft={refreshingGPS ? () => <Spinner size="tiny" /> : undefined}
        >
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
