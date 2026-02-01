import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";

export function ProgressHeader({
  completed,
  total,
  onViewBadges,
}: {
  completed: number;
  total: number;
  onViewBadges: () => void;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text category="h4" style={{ fontWeight: "900" }}>
          Progress
        </Text>

        <Button size="small" appearance="outline" onPress={onViewBadges}>
          Badges
        </Button>
      </View>

      <Text appearance="hint">
        {completed} / {total} cones completed ({pct}%)
      </Text>
    </View>
  );
}
