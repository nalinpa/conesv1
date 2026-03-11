import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { MessageCircle, ChevronRight, PenLine, CheckCircle2 } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { RatingStars } from "@/components/ui/RatingStars";
import { space } from "@/lib/ui/tokens";

export function ReviewsSummaryCard({
  ratingCount,
  avgRating,
  onViewAll,
  isCompleted,
  onAddReview,
  hasUserReviewed,
}: {
  ratingCount: number;
  avgRating: number | null;
  onViewAll: () => void;
  isCompleted?: boolean;
  onAddReview?: () => void;
  hasUserReviewed?: boolean;
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

        {!hasReviews ? (
          <View style={styles.emptyBox}>
            <AppText variant="body" status="hint">
              No reviews yet. Be the first to share yours.
            </AppText>
          </View>
        ) : (
          <Row gap="md" align="center">
            <View style={styles.ratingContainer}>
              <Row gap="sm" align="center">
                <AppText variant="sectionTitle" style={styles.avgRatingText}>
                  {(avgRating ?? 0).toFixed(1)}
                </AppText>

                <RatingStars rating={avgRating || 0} size={16} />
              </Row>
            </View>

            <Stack gap="xxs">
              <AppText variant="body" style={styles.bold}>
                Average Rating
              </AppText>
              <AppText variant="label" status="hint">
                Based on {ratingCount} review{ratingCount === 1 ? "" : "s"}
              </AppText>
            </Stack>
          </Row>
        )}

        <View style={styles.divider} />

        {isCompleted ? (
          hasUserReviewed ? (
            <Row gap="xs" align="center" justify="center" style={styles.reviewedState}>
              <AppIcon icon={CheckCircle2} variant="surf" size={16} />
              <AppText variant="label" status="hint" style={styles.disclaimer}>
                You have already reviewed this visit.
              </AppText>
            </Row>
          ) : (
            <TouchableOpacity
              style={styles.addReviewBtn}
              onPress={onAddReview}
              activeOpacity={0.7}
            >
              <Row gap="sm" align="center" justify="center">
                <AppIcon icon={PenLine} variant="surf" size={16} />
                <AppText variant="body" status="surf" style={styles.bold}>
                  Add Your Review
                </AppText>
              </Row>
            </TouchableOpacity>
          )
        ) : (
          <AppText variant="label" status="hint" style={styles.disclaimer}>
            You can add your review after checking in.
          </AppText>
        )}
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
    textAlign: "center",
  },
  addReviewBtn: {
    paddingVertical: space.xs,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    alignItems: "center",
  },
  reviewedState: {
    paddingVertical: space.xs,
  },
});
