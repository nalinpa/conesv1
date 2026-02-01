import { View, Pressable } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

export function ActionsCard({
  completed,
  saving,
  hasLoc,
  onComplete,

  hasReview,
  myReviewRating,
  myReviewText,
  onOpenReview,

  shareBonus,
  onShareBonus,
}: {
  completed: boolean;
  saving: boolean;
  hasLoc: boolean;
  onComplete: () => void;

  hasReview: boolean;
  myReviewRating: number | null;
  myReviewText: string | null;
  onOpenReview: () => void;

  shareBonus: boolean;
  onShareBonus: () => void;
}) {
  if (!completed) {
    return (
      <Button
        size="giant"
        onPress={onComplete}
        disabled={saving || !hasLoc}
        style={{ borderRadius: 14 }}
      >
        {saving ? "Saving…" : "Complete cone"}
      </Button>
    );
  }

  const stars = "⭐".repeat(Math.max(0, Math.min(5, Math.round(myReviewRating ?? 0))));

  return (
    <CardShell>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Completed
          </Text>
          <Pill status="success">✅</Pill>
        </View>

        {/* Review */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "800" }}>Your review</Text>

          {!hasReview ? (
            <View style={{ gap: 10 }}>
              <Text appearance="hint">Leave a quick rating (once only) after you’ve done the cone.</Text>
              <Button appearance="outline" onPress={onOpenReview}>
                Leave a review
              </Button>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontWeight: "900" }}>
                  {stars}{" "}
                  <Text appearance="hint" style={{ fontWeight: "700" }}>
                    ({myReviewRating}/5)
                  </Text>
                </Text>
              </View>

              <Text appearance="hint">{myReviewText?.trim() ? myReviewText.trim() : "No comment."}</Text>
            </View>
          )}
        </View>

        {/* Share bonus */}
        <View style={{ gap: 8 }}>
          <Text appearance="hint">Optional: share a pic on socials for bonus credit.</Text>

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
    </CardShell>
  );
}
