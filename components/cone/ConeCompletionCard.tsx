import React from "react";
import { View } from "react-native";
import { Card, Text, Button } from "@ui-kitten/components";

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
  if (!completed) {
    return (
      <Button
        status="primary"
        size="large"
        disabled={saving || !canComplete}
        onPress={onComplete}
      >
        {saving ? "Saving…" : "Complete cone"}
      </Button>
    );
  }

  const hasReview = myReviewRating != null;
  const stars =
    myReviewRating != null
      ? "⭐".repeat(Math.max(0, Math.min(5, Math.round(myReviewRating))))
      : "";

  return (
    <Card>
      <View style={{ gap: 14 }}>
        <Text category="h6">Completed ✅</Text>

        {/* Review block */}
        <View style={{ gap: 8 }}>
          <Text category="s1">Your review</Text>

          {!hasReview ? (
            <View style={{ gap: 10 }}>
              <Text appearance="hint">
                Leave a quick rating (once only) after you’ve done the cone.
              </Text>

              <Button appearance="outline" size="large" onPress={onLeaveReview}>
                Leave a review
              </Button>
            </View>
          ) : (
            <Card appearance="outline">
              <View style={{ gap: 6 }}>
                <Text category="s1">
                  {stars}{" "}
                  <Text appearance="hint" category="c1">
                    ({myReviewRating}/5)
                  </Text>
                </Text>

                <Text appearance="hint">
                  {myReviewText?.trim() ? myReviewText.trim() : "No comment."}
                </Text>
              </View>
            </Card>
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
            size="large"
            disabled={shareBonus}
            onPress={onShareBonus}
          >
            {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
          </Button>
        </View>
      </View>
    </Card>
  );
}
