import { View, Text } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <Button className="mt-4" onPress={onComplete} disabled={saving || !canComplete}>
        <Text className="text-primary-foreground font-semibold">
          {saving ? "Saving…" : "Complete cone"}
        </Text>
      </Button>
    );
  }

  const hasReview = myReviewRating != null;
  const stars = "⭐".repeat(Math.max(0, Math.min(5, Math.round(myReviewRating ?? 0))));


  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Completed ✅</CardTitle>
      </CardHeader>

      <CardContent className="gap-4">
        {/* Review block */}
        <View className="gap-2">
          <Text className="font-semibold text-foreground">Your review</Text>

          {!hasReview ? (
            <View className="gap-2">
              <Text className="text-muted-foreground">
                Leave a quick rating (once only) after you’ve done the cone.
              </Text>
              <Button variant="outline" onPress={onLeaveReview}>
                <Text className="font-semibold">Leave a review</Text>
              </Button>
            </View>
          ) : (
            <View className="rounded-2xl border border-border bg-card px-3 py-3">
              <Text className="font-extrabold text-card-foreground">
                {stars}{" "}
                <Text className="text-sm font-semibold text-muted-foreground">
                  ({myReviewRating}/5)
                </Text>
              </Text>

              {myReviewText?.trim() ? (
                <Text className="mt-2 text-sm text-muted-foreground">{myReviewText.trim()}</Text>
              ) : (
                <Text className="mt-2 text-sm text-muted-foreground">No comment.</Text>
              )}
            </View>
          )}
        </View>

        {/* Share bonus block */}
        <View className="gap-2">
          <Text className="text-muted-foreground">
            Optional: share a pic on socials for bonus credit.
          </Text>

          <Button
            variant={shareBonus ? "secondary" : "outline"}
            onPress={onShareBonus}
            disabled={shareBonus}
          >
            <Text className="font-semibold">
              {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
            </Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}
