import { View } from "react-native";
import { Text, Divider } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";

export function ProgressCompletionCard({
  completed,
  total,
  shareBonusCount,
}: {
  completed: number;
  total: number;
  shareBonusCount: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <CardShell>
      <Text category="h6" style={{ fontWeight: "900" }}>
        Completion
      </Text>

      <View style={{ height: 12 }} />

      <PieChart percent={completed} size={total} />

      <View style={{ height: 12 }} />

      <View style={{ gap: 8 }}>
        <StatRow label="Completed" value={`${completed}`} />
        <StatRow label="Remaining" value={`${Math.max(0, total - completed)}`} />
        <StatRow label="Completion" value={`${pct}%`} />
      </View>

      <View style={{ height: 12 }} />
      <Divider />
      <View style={{ height: 10 }} />

      <Text appearance="hint" style={{ fontSize: 12 }}>
        Share bonus saved: {shareBonusCount}
      </Text>
    </CardShell>
  );
}
