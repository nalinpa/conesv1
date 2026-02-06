import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";

export function ReviewsEmptyStateCard({
  onBack,
  onRetry,
}: {
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <CardShell>
      <View style={{ gap: 10 }}>
        <Text category="s1" style={{ fontWeight: "900" }}>
          No reviews yet
        </Text>

        <Text appearance="hint">
          Be the first to leave a rating after you’ve visited.
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button appearance="outline" onPress={onBack} style={{ flex: 1 }}>
            Back
          </Button>
          <Button appearance="ghost" onPress={onRetry} style={{ flex: 1 }}>
            Refresh
          </Button>
        </View>
      </View>
    </CardShell>
  );
}
