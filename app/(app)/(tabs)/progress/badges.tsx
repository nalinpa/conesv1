import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Trophy } from "lucide-react-native";

import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { LoadingState } from "@/components/ui/LoadingState";
import { CardShell } from "@/components/ui/CardShell";
import { Screen } from "@/components/ui/Screen";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { BadgeTile } from "@/components/badges/BadgeTile";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";

const SECTION_ORDER = ["Core", "Social", "Types", "Regions", "Reviews", "Completionist"];

export default function BadgesScreen() {
  const { loading, err, badgeState, badgeTotals, badgeItems } = useBadgesData();

  if (loading)
    return (
      <Screen>
        <LoadingState label="Polishing your trophies..." />
      </Screen>
    );
  if (err)
    return (
      <Screen>
        <ErrorCard
          title="Badges"
          message={err}
          action={{ label: "Retry", onPress: () => router.replace("/badges") }}
        />
      </Screen>
    );

  // Grouping Logic
  const groups = (() => {
    const map = new Map();
    badgeItems.forEach((b) => {
      const section = badgeState.progressById[b.id]?.badge.section ?? "Other";
      if (!map.has(section)) map.set(section, { section, items: [] });
      map.get(section).items.push(b);
    });

    return Array.from(map.values()).sort((a, b) => {
      const ra = SECTION_ORDER.indexOf(a.section);
      const rb = SECTION_ORDER.indexOf(b.section);
      return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
    });
  })();

  const nextUp = badgeState.nextUp;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Row justify="space-between" align="center" style={styles.header}>
          <Stack>
            <AppText variant="screenTitle">Badges</AppText>
            <Row gap="xs" align="center">
              <Trophy size={14} color="#66B2A2" />
              <AppText variant="label" status="surf" style={styles.bold}>
                {badgeTotals.unlocked} of {badgeTotals.total} earned
              </AppText>
            </Row>
          </Stack>
          <AppButton variant="ghost" size="sm" onPress={() => router.back()}>
            <ChevronLeft size={20} color="#64748B" />
          </AppButton>
        </Row>

        {/* Next Up Focus Card */}
        {nextUp && (
          <View style={styles.section}>
            <CardShell status="surf">
              <Stack gap="sm">
                <AppText variant="label" status="surf" style={styles.upper}>
                  Next Milestone
                </AppText>
                <Row gap="md" align="center">
                  <View style={styles.nextUpIconBg}>
                    <AppText style={styles.emojiIconLarge}>{nextUp.badge.icon}</AppText>
                  </View>
                  <Stack style={styles.flex1}>
                    <AppText variant="sectionTitle" status="surf">
                      {nextUp.badge.name}
                    </AppText>
                    <AppText variant="label" status="surf" opacity={0.8}>
                      {nextUp.badge.unlockText}
                    </AppText>
                  </Stack>
                </Row>
                {nextUp.progressLabel && (
                  <View style={styles.progressBarContainer}>
                    <AppText variant="label" status="surf" style={styles.bold}>
                      {nextUp.progressLabel}
                    </AppText>
                  </View>
                )}
              </Stack>
            </CardShell>
          </View>
        )}

        {/* Badge Groups */}
        <Stack gap="lg" style={styles.groupsContainer}>
          {groups.map((g: any) => (
            <Stack key={g.section} gap="sm">
              <AppText variant="label" status="hint" style={styles.upper}>
                {g.section}
              </AppText>
              <CardShell status="basic">
                <Stack gap="xs">
                  {g.items.map((b: any) => (
                    <BadgeTile
                      key={b.id}
                      name={b.name}
                      icon={b.icon}
                      unlockText={b.unlockText}
                      unlocked={b.unlocked}
                      progressLabel={b.progressLabel}
                    />
                  ))}
                </Stack>
              </CardShell>
            </Stack>
          ))}
        </Stack>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { padding: 16, paddingTop: 24 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  groupsContainer: { paddingHorizontal: 16 },
  bold: { fontWeight: "800" },
  upper: {
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "900",
    fontSize: 11,
  },
  nextUpIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiIconLarge: { fontSize: 32 },
  progressBarContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
});
