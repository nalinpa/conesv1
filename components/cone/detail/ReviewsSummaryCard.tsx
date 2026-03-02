import React from "react";
import { StyleSheet, View } from "react-native";
import { Star, MessageCircle, ChevronRight } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

export function ReviewsSummaryCard({
  ratingCount,
  avgRating,
  onViewAll,
}: {
  ratingCount: number;
  avgRating: number | null;
  onViewAll: () => void;
}) {
  const hasReviews = ratingCount > 0;

  return (
    <CardShell status="basic" onPress={hasReviews ? onViewAll : undefined}>
      <Stack gap="md">
        {/* Header Row */}
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            <AppIcon icon={MessageCircle} variant="surf" size={18} />
            <AppText variant="sectionTitle">Reviews</AppText>
          </Row>

          {hasReviews && (
            <Row gap="xs" align="center">
              <AppText variant="label" status="surf" style={styles.bold}>
                View All
              </AppText>
              <AppIcon icon={ChevronRight} variant="surf" size={14} />
            </Row>
          )}
        </Row>

        {/* Rating Display */}
        {!hasReviews ? (
          <View style={styles.emptyBox}>
            <AppText variant="body" status="hint">
              No reviews yet. Be the first to share what it's like!
            </AppText>
          </View>
        ) : (
          <Row gap="md" align="center">
            <View style={styles.ratingContainer}>
              <Row gap="sm" align="center">
                <AppText variant="sectionTitle" style={styles.avgRatingText}>
                  {avgRating?.toFixed(1)}
                </AppText>
                
                {/* 5-Star Row */}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    // Round to nearest 0.5 (e.g., 4.3 -> 4.5, 4.1 -> 4.0)
                    const roundedRating = Math.round((avgRating || 0) * 2) / 2;
                    const isFull = roundedRating >= star;
                    const isHalf = roundedRating === star - 0.5;

                    if (isFull) {
                      return <Star key={star} size={16} color="#F59E0B" fill="#F59E0B" />;
                    }

                    if (isHalf) {
                      return (
                        <View key={star} style={styles.halfStarContainer}>
                          {/* Empty background star */}
                          <Star size={16} color="#CBD5E1" fill="transparent" />
                          {/* Clipped foreground half-star */}
                          <View style={styles.halfStarClip}>
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                          </View>
                        </View>
                      );
                    }

                    // Empty Star
                    return <Star key={star} size={16} color="#CBD5E1" fill="transparent" />;
                  })}
                </View>
              </Row>
            </View>

            <Stack gap="xxs">
              <AppText variant="body" style={styles.bold}>
                Average Rating
              </AppText>
              <AppText variant="label" status="hint">
                Based on {ratingCount} check-in{ratingCount === 1 ? "" : "s"}
              </AppText>
            </Stack>
          </Row>
        )}

        <View style={styles.divider} />

        <AppText variant="label" status="hint" style={styles.disclaimer}>
          Community reviews help others plan their visit. You can add yours after checking
          in.
        </AppText>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: "800" },
  avgRatingText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
  },
  ratingContainer: {
    paddingRight: space.md,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  halfStarContainer: {
    position: "relative",
  },
  halfStarClip: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    overflow: "hidden",
  },
  emptyBox: {
    paddingVertical: space.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  disclaimer: {
    lineHeight: 16,
    fontStyle: "italic",
  },
});