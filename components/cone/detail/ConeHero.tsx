import React from "react";
import { View, StyleSheet } from "react-native";
import { CheckCircle2, MapPin } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { Pill } from "@/components/ui/Pill";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { AppIcon } from "@/components/ui/AppIcon";
import type { Cone } from "@/lib/models";

function prettyLabel(s: string) {
  return s?.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function ConeHero({ cone, completed }: { cone: Cone; completed: boolean }) {
  const metaLabel = `${prettyLabel(cone.region)} • ${prettyLabel(cone.category)}`;
  const desc = cone.description?.trim();

  return (
    <View style={[styles.container, completed && styles.completedBg]}>
      <Stack gap="md">
        {/* Status & Category Row */}
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            <AppIcon icon={MapPin} size={14} variant="surf" />
            <AppText variant="label" status="surf" style={styles.upper}>
              {metaLabel}
            </AppText>
          </Row>
          <Pill
            status={completed ? "success" : "basic"}
            icon={completed ? CheckCircle2 : undefined}
          >
            {completed ? "Visited" : "Unclimbed"}
          </Pill>
        </Row>

        {/* Title */}
        <AppText variant="screenTitle" style={styles.titleText}>
          {cone.name}
        </AppText>

        {/* Description */}
        <AppText variant="body" status="hint" style={styles.description}>
          {desc
            ? desc
            : "A unique peak in the Auckland Volcanic Field awaiting exploration."}
        </AppText>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  completedBg: {
    backgroundColor: "#F0FDF4", // Very faint success green wash
  },
  upper: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "800",
  },
  titleText: {
    fontSize: 32,
    lineHeight: 38,
    color: "#0F172A",
    fontWeight: "900",
  },
  description: {
    lineHeight: 24,
    fontSize: 16,
  },
});
