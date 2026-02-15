import React from "react";
import { View, StyleSheet } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { formatDistanceMeters } from "@/lib/formatters";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { space } from "@/lib/ui/tokens";
import { AppButton } from "../ui/AppButton";

type ConeLite = {
  id: string;
  name: string;
  description?: string;
};

export function NearestUnclimbedCard({
  cone,
  distanceMeters,
  locErr,
  onOpenCone,
}: {
  cone: ConeLite | null;
  distanceMeters: number | null;
  locErr?: string;
  onOpenCone: (id: string) => void;
}) {
  const hasDistance = distanceMeters != null;

  const distanceLabel = hasDistance
    ? `About ${formatDistanceMeters(distanceMeters)} away`
    : locErr
      ? "Turn on location to see what’s closest"
      : "Finding what’s closest…";

  const pillLabel = distanceMeters != null ? formatDistanceMeters(distanceMeters) : "—";

  return (
    <CardShell>
      <Stack gap="md">
        <Row justify="space-between" align="center">
          <AppText variant="sectionTitle">Nearby volcano</AppText>
          <Pill status={hasDistance ? "success" : "basic"}>{pillLabel}</Pill>
        </Row>

        {!cone ? (
          <AppText variant="hint">
            {locErr
              ? "Turn on location to see a nearby volcano."
              : "No volcanoes to show yet."}
          </AppText>
        ) : (
          <Stack gap="sm">
            <View style={styles.infoContainer}>
              <AppText variant="sectionTitle" style={styles.coneName}>
                {cone.name}
              </AppText>

              {cone.description?.trim() ? (
                <AppText variant="hint" numberOfLines={2}>
                  {cone.description.trim()}
                </AppText>
              ) : null}

              <AppText variant="hint">{distanceLabel}</AppText>
            </View>

            <View style={styles.buttonContainer}>
              <AppButton onPress={() => onOpenCone(cone.id)}>View details</AppButton>
            </View>
          </Stack>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    gap: space.xs,
  },
  coneName: {
    fontWeight: "800",
  },
  buttonContainer: {
    marginTop: space.xs,
  },
});
