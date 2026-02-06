import { View } from "react-native";
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
        {saving ? "Marking…" : "I’m here"}
      </Button>
    );
  }

  const stars = "⭐".repeat(
    Math.max(0, Math.min(5, Math.round(myReviewRating ?? 0)))
  );

  return (
    <CardShell>
      <View style={{ gap: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text category="h6" style={{ fontWeight: "900" }}>
            You’ve been here
          </Text>
          <Pill status="success">✅</Pill>
        </View>

        {/* Review */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "800" }}>Your review</Text>

          {!hasReview ? (
            <View style={{ gap: 10 }}>
              <Text appearance="hint">
                Drop a quick rating — you can only leave one.
              </Text>
              <Button appearance="outline" onPress={onOpenReview}>
                Add a review
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

              <Text appearance="hint">
                {myReviewText?.trim() ? myReviewText.trim() : "No comment yet."}
              </Text>
            </View>
          )}
        </View>

        {/* Share bonus */}
        <View style={{ gap: 8 }}>
          <Text appearance="hint">
            Optional: share a photo for a little bonus credit.
          </Text>

          <Button
            appearance={shareBonus ? "filled" : "outline"}
            status={shareBonus ? "success" : "basic"}
            onPress={onShareBonus}
            disabled={shareBonus}
          >
            {shareBonus ? "Bonus credit added ✅" : "Share for bonus credit"}
          </Button>
        </View>
      </View>
    </CardShell>
  );
}
