import React from "react";
import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { CardShell } from "../ui/CardShell";

export function MapOverlayCard({
  title,
  subtitle,
  distanceMeters,
  onOpen,
}: {
  title: string;
  subtitle?: string;
  distanceMeters: number | null;
  onOpen: () => void;
}) {
  const distanceLabel =
    distanceMeters == null
      ? "Distance —"
      : distanceMeters < 1000
      ? `${Math.round(distanceMeters)} m away`
      : `${(distanceMeters / 1000).toFixed(1)} km away`;

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
