import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

export function ReviewsEmptyStateCard({
  onBack,
  onRetry,
}: {
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <CardShell>
      <Stack gap="md">
        <AppText variant="sectionTitle">No reviews yet</AppText>

        <AppText variant="hint">
          Be the first to leave a rating after you’ve visited.
        </AppText>

        <Row gap="sm">
          <AppButton variant="secondary" onPress={onBack} style={{ flex: 1 }}>
            Back
          </AppButton>

          <AppButton variant="ghost" onPress={onRetry} style={{ flex: 1 }}>
            Refresh
          </AppButton>
        </Row>
      </Stack>
    </CardShell>
  );
}
