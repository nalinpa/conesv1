import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { MessageCircle } from "lucide-react-native";
import { space } from "@/lib/ui/tokens";

export function ReviewsEmptyStateCard({
  onBack,
  onRetry,
}: {
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <CardShell style={{ marginTop: space.lg }}>
      <Stack gap="md" style={{ alignItems: "center" }}>
        <AppIcon icon={MessageCircle} size={28} />

        <AppText variant="sectionTitle" style={{ textAlign: "center" }}>
          No reviews yet
        </AppText>

        <AppText variant="hint" style={{ textAlign: "center", maxWidth: 260 }}>
          Be the first to leave a rating after you’ve visited this volcano.
        </AppText>

        <Row gap="sm" style={{ marginTop: space.sm }}>
          <AppButton variant="secondary" onPress={onBack} style={{ minWidth: 120 }}>
            Back
          </AppButton>

          <AppButton variant="ghost" onPress={onRetry} style={{ minWidth: 120 }}>
            Try again
          </AppButton>
        </Row>
      </Stack>
    </CardShell>
  );
}
