import { View } from "react-native";
import { Button } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";

import { space } from "@/lib/ui/tokens";
import { AppButton } from "../ui/AppButton";

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
    <Stack gap="md">
      {/* Header */}
      <Row justify="space-between" align="flex-start" style={{ gap: space.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="sectionTitle">Your journey</AppText>
          <AppText variant="hint" style={{ marginTop: space.xs }}>
            {completedCount} of {totalCount} volcanoes visited
          </AppText>
        </View>

       <AppButton
            variant="secondary"
            size="sm"
            onPress={onOpenBadges}
            >
            Badges
        </AppButton>
      </Row>

      {isEmpty ? (
        <CardShell>
          <Stack gap="sm">
            <AppText variant="sectionTitle">No visits yet</AppText>

            <AppText variant="body">
              Pick a volcano, then tap <AppText variant="body" style={{ fontWeight: "800" }}>
                I’m here
              </AppText>{" "}
              when you’re nearby.
            </AppText>

            {onBrowseVolcanoes ? (
              <View style={{ marginTop: space.xs }}>
               <AppButton onPress={onBrowseVolcanoes}>
                    Browse volcanoes
                </AppButton>
              </View>
            ) : null}
          </Stack>
        </CardShell>
      ) : (
        <CardShell>
          <Stack gap="md">
            <Row align="center" gap="lg">
              <PieChart percent={percentValue} />

              <View style={{ flex: 1 }}>
                <Stack gap="sm">
                  <StatRow label="Visited" value={`${completedCount}`} />
                  <StatRow label="Still to explore" value={`${remaining}`} />
                  <StatRow label="Bonus credits" value={`${bonusCount}`} />
                </Stack>
              </View>
            </Row>

            {allDone ? (
              <CardShell status="success">
                <AppText variant="body" style={{ fontWeight: "800" }}>
                  You’ve visited every volcano in the Auckland Volcanic Field ✅
                </AppText>
              </CardShell>
            ) : null}
          </Stack>
        </CardShell>
      )}
    </Stack>
  );
}
