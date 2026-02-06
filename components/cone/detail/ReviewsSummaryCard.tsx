import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";

export function ReviewsSummaryCard({
  ratingCount,
  avgRating,
  onViewAll,
}: {
  ratingCount: number;
  avgRating: number | null;
  onViewAll: () => void;
}) {
  return (
    <CardShell>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text category="h6" style={{ fontWeight: "900" }}>
          Reviews
        </Text>

        {ratingCount > 0 ? (
          <Button size="small" appearance="outline" onPress={onViewAll}>
            View all
          </Button>
        ) : (
          <View />
        )}
      </View>

      <View style={{ height: 10 }} />

      {ratingCount === 0 ? (
        <Text appearance="hint">No reviews yet — be the first.</Text>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pill status="info">⭐ {avgRating?.toFixed(1)} / 5</Pill>
          <Text appearance="hint">
            ({ratingCount} review{ratingCount === 1 ? "" : "s"})
          </Text>
        </View>
      )}

      <View style={{ height: 10 }} />
      <Text appearance="hint" style={{ fontSize: 12 }}>
        Reviews are public. After you’ve visited, you can leave one review for this volcano.
      </Text>
    </CardShell>
  );
}
