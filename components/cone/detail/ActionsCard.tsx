import { View } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

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
  shareLoading = false,
  shareError = null,
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
  shareLoading?: boolean;
  shareError?: string | null;
}) {
  // ---- NOT COMPLETED: primary CTA only ----
  if (!completed) {
    return (
      <AppButton
        onPress={onComplete}
        disabled={saving || !hasLoc}
        loading={saving}
        loadingLabel="Marking…"
      >
        I’m here
      </AppButton>
    );
  }

  const stars = "⭐".repeat(Math.max(0, Math.min(5, Math.round(myReviewRating ?? 0))));

  return (
    <CardShell>
      <Stack gap="lg">
        {/* Header */}
        <Row justify="space-between" align="center">
          <AppText variant="sectionTitle">You’ve been here</AppText>
          <Pill status="success">✓</Pill>
        </Row>

        {/* Review section */}
        <Stack gap="md">
          <AppText variant="label">Your review</AppText>

          {!hasReview ? (
            <Stack gap="sm">
              <AppText variant="hint">Drop a quick rating — you can only leave one.</AppText>

              <AppButton variant="secondary" onPress={onOpenReview}>
                Add a review
              </AppButton>
            </Stack>
          ) : (
            <Stack gap="sm">
              <Row align="center" gap="sm">
                <AppText variant="sectionTitle" style={{ fontWeight: "900" }}>
                  {stars}
                </AppText>

                <AppText variant="hint">({myReviewRating}/5)</AppText>
              </Row>

              <AppText variant="hint">
                {myReviewText?.trim() ? myReviewText.trim() : "No comment yet."}
              </AppText>
            </Stack>
          )}
        </Stack>

        {/* Share bonus */}
        <Stack gap="sm">
          <AppText variant="hint">Optional: share a photo for a little bonus credit.</AppText>

          {shareError ? (
            <AppText variant="hint" style={{ opacity: 0.9 }}>
              {shareError}
            </AppText>
          ) : null}

          <AppButton
            variant={shareBonus ? "secondary" : "primary"}
            disabled={shareBonus || shareLoading}
            loading={shareLoading}
            loadingLabel="Preparing…"
            onPress={onShareBonus}
          >
            {shareBonus ? "Bonus credit added ✓" : "Share for bonus credit"}
          </AppButton>
        </Stack>
      </Stack>
    </CardShell>
  );
}
