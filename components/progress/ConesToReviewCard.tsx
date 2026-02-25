import React from "react";
import { View, StyleSheet } from "react-native";
import { MessageSquarePlus, Star, ChevronRight } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

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
    <CardShell status="basic">
      <Stack gap="md">
        {/* Header */}
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            <AppIcon icon={MessageSquarePlus} variant="surf" size={18} />
            <AppText variant="sectionTitle">Pending Reviews</AppText>
          </Row>
          <Pill status="surf">{cones.length}</Pill>
        </Row>

        <AppText variant="body" status="hint">
          Help the community by sharing your experience at these recent summits.
        </AppText>

        {/* List of Cones */}
        <Stack gap="sm">
          {visible.map((cone) => (
            <CardShell
              key={cone.id}
              onPress={() => onOpenCone(cone.id)}
              style={styles.innerCard}
            >
              <Row justify="space-between" align="center">
                <Row gap="sm" align="center" style={styles.flex1}>
                  <AppIcon icon={Star} variant="surf" size={16} />
                  <View style={styles.flex1}>
                    <AppText variant="body" style={styles.bold}>
                      {cone.name}
                    </AppText>
                    {cone.description?.trim() && (
                      <AppText variant="label" status="hint" numberOfLines={1}>
                        {cone.description.trim()}
                      </AppText>
                    )}
                  </View>
                </Row>
                <AppIcon icon={ChevronRight} variant="hint" size={16} />
              </Row>
            </CardShell>
          ))}
        </Stack>

        {/* Overflow Hint */}
        {remaining > 0 && (
          <AppText variant="label" status="surf" style={styles.moreText}>
            + {remaining} more to review
          </AppText>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  innerCard: {
    padding: space.sm,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  bold: {
    fontWeight: "700",
  },
  moreText: {
    textAlign: "center",
    fontWeight: "800",
    marginTop: 2,
  },
});
