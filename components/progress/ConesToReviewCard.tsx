import React from "react";
import { View, StyleSheet } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

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

export function ConesToReviewCard({
  cones,
  onOpenCone,
}: {
  cones: ConeLite[];
  onOpenCone: (id: string) => void;
}) {
  if (!cones || cones.length === 0) return null;

  const visible = cones.slice(0, 3);
  const remaining = cones.length - visible.length;

  return (
    <CardShell>
      <Stack gap="md">
        {/* Header */}
        <Row justify="space-between" align="center">
          <AppText variant="sectionTitle">Reviews to write</AppText>
          <Pill status="info">{cones.length}</Pill>
        </Row>

        <AppText variant="hint">
          You’ve been to these volcanoes — add a quick public review.
        </AppText>

        {/* List */}
        <Stack gap="lg">
          {visible.map((cone) => (
            <CardShell key={cone.id} status="basic">
              <Stack gap="sm">
                <View style={styles.textContainer}>
                  <AppText variant="sectionTitle" style={styles.coneName}>
                    {cone.name}
                  </AppText>

                  {cone.description?.trim() ? (
                    <AppText variant="hint" numberOfLines={2}>
                      {cone.description.trim()}
                    </AppText>
                  ) : null}
                </View>

                <AppButton onPress={() => onOpenCone(cone.id)}>Add a review</AppButton>
              </Stack>
            </CardShell>
          ))}
        </Stack>

        {/* Overflow hint */}
        {remaining > 0 ? (
          <AppText variant="hint">
            + {remaining} more visited volcano{remaining === 1 ? "" : "es"}
          </AppText>
        ) : null}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    gap: space.xs,
  },
  coneName: {
    fontWeight: "800",
  },
});
