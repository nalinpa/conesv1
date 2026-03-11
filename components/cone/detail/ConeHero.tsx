import React from "react";
import { View, StyleSheet } from "react-native";
import { CheckCircle2, MapPin } from "lucide-react-native";
import { MotiView } from "moti";

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
        {/* 1. Region & Status */}
        <MotiView
          from={{ opacity: 0, translateX: -10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 100 }}
        >
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
              {completed ? "Visited" : "Unexplored"}
            </Pill>
          </Row>
        </MotiView>

        {/* 2. Title */}
        <AppText variant="screenTitle" style={styles.titleText}>
          {cone.name}
        </AppText>

        {/* 3. Description */}
        <MotiView
          from={{ opacity: 0, translateY: 5 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <AppText variant="body" status="hint" style={styles.description}>
            {desc || "A unique peak in the Auckland Volcanic Field awaiting exploration."}
          </AppText>
        </MotiView>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  completedBg: {
    backgroundColor: "#F0FDF4",
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
  backBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 8, // Standard padding so it looks like a real button
    marginBottom: 8,
  },
  backText: {
    fontWeight: "700",
  },
});
