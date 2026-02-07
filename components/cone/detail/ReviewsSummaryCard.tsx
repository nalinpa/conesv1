import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

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
    <CardShell>
      <Stack gap="md">
        <Row justify="space-between" align="center">
          <AppText variant="sectionTitle">Reviews</AppText>

          {hasReviews ? (
            <AppButton variant="secondary" size="sm" onPress={onViewAll}>
              View all
            </AppButton>
          ) : (
            <></>
          )}
        </Row>

        {!hasReviews ? (
          <AppText variant="hint">No reviews yet — be the first.</AppText>
        ) : (
          <Row gap="sm" align="center" wrap>
            <Pill status="info">⭐ {avgRating?.toFixed(1)} / 5</Pill>
            <AppText variant="hint">
              ({ratingCount} review{ratingCount === 1 ? "" : "s"})
            </AppText>
          </Row>
        )}

        <AppText variant="hint">
          Reviews are public. After you’ve visited, you can leave one review for this volcano.
        </AppText>
      </Stack>
    </CardShell>
  );
}
