import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

export function ReviewsHeader({
  title,
  avg,
  count,
  onBack,
}: {
  title: string;
  avg: number | null;
  count: number;
  onBack: () => void;
}) {
  const subtitle =
    count === 0
      ? "No reviews yet."
      : `★ ${avg?.toFixed(1)} / 5 (${count} review${count === 1 ? "" : "s"})`;

  return (
    <Stack gap="sm">
      <Row justify="space-between" align="center">
        <Stack gap="xs">
          <AppText variant="screenTitle">{title}</AppText>
          <AppText variant="hint">{subtitle}</AppText>
        </Stack>

        <AppButton variant="secondary" size="sm" onPress={onBack}>
          Back
        </AppButton>
      </Row>
    </Stack>
  );
}
