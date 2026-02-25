import React from "react";
import { View, StyleSheet } from "react-native";
import { Award, TrendingUp, Star, Share2, CheckCircle2, Circle } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { PieChart } from "@/components/progress/PieChart";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

// Internal helper for the dashboard rows
function StatRow({ label, value, icon }: { label: string; value: number | string; icon: any }) {
  return (
    <Row justify="space-between" align="center">
      <Row gap="xs" align="center">
        {icon}
        <AppText variant="label" status="hint">{label}</AppText>
      </Row>
      <AppText variant="body" style={styles.statValue}>{value}</AppText>
    </Row>
  );
}

export function ProgressHeaderCard({
  completed,
  total,
  percent,
  reviewCount,
  shareCount,
  allDone,
  onOpenBadges,
  onBrowseVolcanoes,
}: {
  completed: number;
  total: number;
  percent: number;
  reviewCount: number;
  shareCount: number;
  allDone: boolean;
  onOpenBadges: () => void;
  onBrowseVolcanoes?: () => void;
}) {
  const remaining = Math.max(0, total - completed);
  const isEmpty = total > 0 && completed <= 0;

  return (
    <Stack gap="md">
      {/* Header Row */}
      <Row justify="space-between" align="center">
        <View style={styles.flex1}>
          <AppText variant="sectionTitle">Your Journey</AppText>
          <AppText variant="hint">Auckland Volcanic Field</AppText>
        </View>
        <AppButton variant="ghost" size="sm" onPress={onOpenBadges} style={styles.badgeBtn}>
          <Row gap="xs" align="center">
            <AppIcon icon={Award} variant="surf" size={16} />
            <AppText variant="label" status="surf">Badges</AppText>
          </Row>
        </AppButton>
      </Row>

      {/* Main Stats Card */}
      <CardShell status="surf">
        <Stack gap="lg">
          <Row align="center" gap="lg">
            <PieChart percent={percent} />
            
            <View style={styles.flex1}>
              <Stack gap="sm">
                <StatRow 
                  label="Visited" 
                  value={completed} 
                  icon={<AppIcon icon={CheckCircle2} size={14} variant="surf" />} 
                />
                <StatRow 
                  label="Remaining" 
                  value={remaining} 
                  icon={<AppIcon icon={Circle} size={14} variant="hint" />} 
                />
                <StatRow 
                  label="Reviews" 
                  value={reviewCount} 
                  icon={<AppIcon icon={Star} size={14} variant="surf" />} 
                />
                <StatRow 
                  label="Shares" 
                  value={shareCount} 
                  icon={<AppIcon icon={Share2} size={14} variant="surf" />} 
                />
              </Stack>
            </View>
          </Row>

          {allDone && (
            <CardShell status="success" style={styles.successCard}>
              <AppText variant="body" style={styles.bold}>
                Master of Cones: All peaks visited! ✅
              </AppText>
            </CardShell>
          )}
        </Stack>
      </CardShell>

      {/* Call to action for new users */}
      {isEmpty && (
        <CardShell status="basic">
          <Stack gap="sm">
            <Row gap="sm" align="center">
              <AppIcon icon={TrendingUp} variant="surf" size={18} />
              <AppText variant="sectionTitle">No visits yet</AppText>
            </Row>
            <AppText variant="body">
              Pick a volcano, then tap <AppText variant="body" style={styles.bold}>I’m here</AppText> when you’re nearby.
            </AppText>
            {onBrowseVolcanoes && (
              <AppButton onPress={onBrowseVolcanoes} style={{ marginTop: 4 }}>
                Browse Volcanoes
              </AppButton>
            )}
          </Stack>
        </CardShell>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  bold: { fontWeight: "800" },
  statValue: { fontWeight: "700" },
  badgeBtn: { paddingHorizontal: 0 },
  successCard: { padding: space.sm },
});