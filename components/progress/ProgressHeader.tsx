import { View } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";

function asCount(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function ProgressHeaderCard({
  completed,
  total,
  percent,
  shareBonusCount,
  allDone,
  onOpenBadges,
  onBrowseVolcanoes,
}: {
  completed: number;
  total: number;
  percent: number;
  shareBonusCount: number;
  allDone: boolean;
  onOpenBadges: () => void;
  onBrowseVolcanoes?: () => void;
}) {
  const completedCount = asCount(completed);
  const totalCount = asCount(total);
  const percentValue = asCount(percent);
  const bonusCount = asCount(shareBonusCount);

  const remaining = Math.max(0, totalCount - completedCount);

  // ✅ robust empty detection
  const isEmpty = totalCount > 0 && completedCount <= 0;

  return (
    <>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text category="h4" style={{ fontWeight: "900" }}>
            Your journey 
          </Text>
          <Text appearance="hint" style={{ marginTop: 4 }}>
            {completedCount} of {totalCount} volcanoes visited
          </Text>
        </View>

        <Button size="small" appearance="outline" onPress={onOpenBadges}>
          Badges
        </Button>
      </View>

      {isEmpty ? (
        <CardShell>
          <View style={{ gap: 10 }}>
            <Text category="s1" style={{ fontWeight: "900" }}>
              No visits yet
            </Text>

            <Text appearance="hint">
              Pick a volcano, then tap <Text style={{ fontWeight: "900" }}>I’m here</Text>{" "}
              when you’re nearby.
            </Text>

            {onBrowseVolcanoes ? (
              <View style={{ marginTop: 6 }}>
                <Button appearance="outline" onPress={onBrowseVolcanoes}>
                  Browse volcanoes
                </Button>
              </View>
            ) : null}
          </View>
        </CardShell>
      ) : (
        <CardShell>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <PieChart percent={percentValue} />

            <View style={{ flex: 1, gap: 10 }}>
              <StatRow label="Visited" value={`${completedCount}`} />
              <StatRow label="Still to explore" value={`${remaining}`} />
              <StatRow label="Bonus credits" value={`${bonusCount}`} />
            </View>
          </View>

          {allDone ? (
            <View style={{ marginTop: 12 }}>
              <Text category="s1" style={{ fontWeight: "900" }}>
                You’ve visited every volcano in the Auckland Volcanic Field ✅
              </Text>
            </View>
          ) : null}
        </CardShell>
      )}
    </>
  );
}
