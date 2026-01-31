import React from "react";
import { View } from "react-native";
import { Button, Card, Text } from "@ui-kitten/components";

export function ConeCompletionCard({
  completed,
  saving,
  canComplete,
  onComplete,
  shareBonus,
  onShareBonus,
  myReviewRating,
  myReviewText,
  onLeaveReview,
}: {
  completed: boolean;
  saving: boolean;
  canComplete: boolean;
  onComplete: () => void;

  shareBonus: boolean;
  onShareBonus: () => void;

  myReviewRating: number | null;
  myReviewText: string | null;
  onLeaveReview: () => void;
}) {
  // Not completed yet -> primary CTA only
  if (!completed) {
    return (
      <View style={{ marginTop: 16 }}>
        <Button
          onPress={onComplete}
          disabled={saving || !canComplete}
          status="primary"
        >
          {saving ? "Saving…" : "Complete cone"}
        </Button>
      </View>
    );
  }

  const hasReview = myReviewRating != null;
  const roundedRating = Math.max(
    0,
    Math.min(5, Math.round(myReviewRating ?? 0))
  );
  const stars = "⭐".repeat(roundedRating);
  const reviewText = (myReviewText ?? "").trim();

  return (
    <Card style={{ marginTop: 16 }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <Text category="h6">Completed ✅</Text>

        {/* Body */}
        <View style={{ marginTop: 12, gap: 16 }}>
          {/* Review block */}
          <View style={{ gap: 8 }}>
            <Text category="s1">Your review</Text>

            {!hasReview ? (
              <View style={{ gap: 10 }}>
                <Text appearance="hint">
                  Leave a quick rating (once only) after you’ve done the cone.
                </Text>

                <Button appearance="outline" onPress={onLeaveReview}>
                  Leave a review
                </Button>
              </View>
            ) : (
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderColor: "rgba(0,0,0,0.12)",
                }}
              >
                <Text category="s1">
                  {stars}{" "}
                  <Text appearance="hint" category="c1">
                    ({myReviewRating}/5)
                  </Text>
                </Text>

                <Text style={{ marginTop: 8 }} appearance="hint">
                  {reviewText ? reviewText : "No comment."}
                </Text>
              </View>
            )}
          </View>

          {/* Share bonus block */}
          <View style={{ gap: 8 }}>
            <Text appearance="hint">
              Optional: share a pic on socials for bonus credit.
            </Text>

            <Button
              appearance={shareBonus ? "filled" : "outline"}
              status={shareBonus ? "success" : "basic"}
              onPress={onShareBonus}
              disabled={shareBonus}
            >
              {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );
}
