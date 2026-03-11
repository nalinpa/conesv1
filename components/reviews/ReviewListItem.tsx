import React from "react";
import { View, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import * as Sentry from "@sentry/react-native";

import { CardShell } from "@/components/ui/CardShell";
import { AppText } from "@/components/ui/AppText";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";

import { ReviewOptionsMenu } from "@/components/reviews/ReviewOptionsMenu";
import { space } from "@/lib/ui/tokens";

function formatDate(ts: any): string {
  try {
    const d = ts?.toDate?.() || new Date(ts);
    return d.toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    Sentry.captureException(e);
    return "Recently";
  }
}

export function ReviewListItem({
  reviewId,
  authorId,
  authorName = "User", // Fallback just in case
  rating,
  text,
  createdAt,
}: {
  reviewId: string;
  authorId: string;
  authorName?: string;
  rating: number;
  text?: string | null;
  createdAt?: any;
}) {
  const r = Math.max(1, Math.min(5, Math.round(rating)));
  const when = formatDate(createdAt);
  const comment = text?.trim();

  return (
    <CardShell status="basic" style={styles.card}>
      <Stack gap="sm">
        {/* Header: Stars, Date, and Options Menu */}
        <Row justify="space-between" align="center">
          <Row gap="xxs">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                fill={i <= r ? "#66B2A2" : "transparent"}
                color={i <= r ? "#66B2A2" : "#CBD5E1"}
              />
            ))}
          </Row>

          <Row gap="md" align="center">
            <AppText variant="label" status="hint">
              {when}
            </AppText>
            <ReviewOptionsMenu
              reviewId={reviewId}
              authorId={authorId}
              authorName={authorName}
            />
          </Row>
        </Row>

        {/* The Review Content */}
        <View style={styles.content}>
          <AppText variant="body" style={[styles.text, !comment && styles.italic]}>
            {comment || "Checked in without a note."}
          </AppText>
        </View>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.md,
  },
  text: {
    color: "#1E293B",
    lineHeight: 20,
    fontWeight: "500",
  },
  italic: {
    fontStyle: "italic",
    opacity: 0.6,
  },
  content: {
    paddingVertical: 2,
  },
});
