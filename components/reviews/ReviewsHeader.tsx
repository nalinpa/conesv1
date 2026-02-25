import React from "react";
import { StyleSheet, View } from "react-native";
import { ChevronLeft, Star } from "lucide-react-native";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

export function ReviewsHeader({
  title,
  avg,
  count,
  onBack,
}: {
  title: string;
  avg: number | null;
  count: number;
  onBack: () => void;
}) {
  const hasReviews = count > 0;

  return (
    <Stack gap="md" style={styles.container}>
      {/* Navigation and Title Row */}
      <Row justify="space-between" align="center">
        <Stack style={styles.flex1}>
          <AppText variant="screenTitle" numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="label" status="hint">
            Community Reviews
          </AppText>
        </Stack>

        <AppButton variant="ghost" size="sm" onPress={onBack} style={styles.backButton}>
          <Row gap="xs" align="center">
            <ChevronLeft size={18} color="#64748B" />
            <AppText variant="label" status="hint">
              Back
            </AppText>
          </Row>
        </AppButton>
      </Row>

      {/* Hero Stats Row */}
      {hasReviews ? (
        <Row gap="md" align="center" style={styles.statsRow}>
          <View style={styles.ratingBadge}>
            <Row gap="xs" align="center">
              <AppText variant="h2" style={styles.bigRating}>
                {avg?.toFixed(1)}
              </AppText>
              <AppIcon icon={Star} variant="surf" size={20} />
            </Row>
          </View>

          <Stack>
            <AppText variant="body" style={styles.bold}>
              Average Rating
            </AppText>
            <AppText variant="label" status="hint">
              Based on {count} review{count === 1 ? "" : "s"}
            </AppText>
          </Stack>
        </Row>
      ) : (
        <View style={styles.emptyHeader}>
          <AppText variant="label" status="hint">
            No community data available yet.
          </AppText>
        </View>
      )}

      <View style={styles.divider} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: space.sm,
  },
  flex1: { flex: 1 },
  bold: { fontWeight: "800", color: "#0F172A" },
  backButton: {
    paddingRight: 0,
  },
  statsRow: {
    paddingVertical: space.sm,
  },
  ratingBadge: {
    paddingRight: space.md,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  bigRating: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1,
  },
  emptyHeader: {
    paddingVertical: space.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: space.xs,
  },
});
