import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Layout, Text } from "@ui-kitten/components";

// Resolving aliases to relative paths to fix compilation errors
import { useBadgesData } from "../../../../lib/hooks/useBadgesData";
import { goProgressHome, goBadges } from "../../../../lib/routes";

import { LoadingState } from "../../../../components/ui/LoadingState";
import { CardShell } from "../../../../components/ui/CardShell";
import { Screen } from "../../../../components/ui/screen";
import { ErrorCard } from "../../../../components/ui/ErrorCard";
import { BadgeTile } from "../../../../components/badges/BadgeTile";
import { AppButton } from "../../../../components/ui/AppButton";

const SECTION_ORDER = ["Core", "Social", "Types", "Regions", "Reviews", "Completionist"];

type BadgeGroup = {
  section: string;
  items: Array<{
    id: string;
    name: string;
    icon: string; // The emoji icon
    unlockText: string;
    unlocked: boolean;
    progressLabel: string | null;
  }>;
};

function sectionRank(section: string) {
  const idx = SECTION_ORDER.indexOf(section);
  return idx === -1 ? 999 : idx;
}

export default function BadgesScreen() {
  const { loading, err, badgeState, badgeTotals, badgeItems } = useBadgesData();

  if (loading) {
    return (
      <Screen padded={false}>
        <Layout style={styles.container}>
          <LoadingState label="Loading badges…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <Layout style={styles.errorContainer}>
          <ErrorCard
            title="Badges"
            message={err}
            action={{ label: "Retry", onPress: goBadges, appearance: "filled" }}
          />
        </Layout>
      </Screen>
    );
  }

  const groups: BadgeGroup[] = (() => {
    const map = new Map<string, BadgeGroup>();

    for (const b of badgeItems) {
      const p = badgeState.progressById[b.id];
      const section = p?.badge.section ?? "Other";

      const g = map.get(section) ?? { section, items: [] };
      g.items.push(b);
      map.set(section, g);
    }

    const arr = Array.from(map.values());

    for (const g of arr) {
      g.items.sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;

        const pa = badgeState.progressById[a.id];
        const pb = badgeState.progressById[b.id];

        const da = pa?.distanceToEarn;
        const db = pb?.distanceToEarn;

        const aHas = typeof da === "number" && Number.isFinite(da);
        const bHas = typeof db === "number" && Number.isFinite(db);

        if (aHas && bHas && da !== db) return da - db;
        if (aHas !== bHas) return aHas ? -1 : 1;

        return a.name.localeCompare(b.name);
      });
    }

    arr.sort((a, b) => {
      const ra = sectionRank(a.section);
      const rb = sectionRank(b.section);
      if (ra !== rb) return ra - rb;
      return a.section.localeCompare(b.section);
    });

    return arr;
  })();

  return (
    <Screen padded={false}>
      <Layout style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View>
              <Text category="h1">Badges</Text>
              <Text appearance="hint" style={styles.headerSubtitle}>
                {badgeTotals.unlocked} of {badgeTotals.total} earned
              </Text>
            </View>

            <AppButton variant="secondary" size="sm" onPress={goProgressHome}>
              Back
            </AppButton>
          </View>

          {/* "Next Up" Badge Card with Emoji Icon */}
          <View style={styles.nextUpSection}>
            <CardShell>
              <Text category="h6" style={styles.sectionLabel}>Next up</Text>

              {!badgeState.nextUp ? (
                <Text appearance="hint" style={styles.noNextUpText}>
                  Nothing new right now.
                </Text>
              ) : (
                <View style={styles.nextUpCard}>
                  <View style={styles.nextUpIconRow}>
                    <Text style={styles.nextUpIcon}>{badgeState.nextUp.badge.icon}</Text>
                    <Text category="s1" style={styles.boldText} numberOfLines={1}>
                      {badgeState.nextUp.badge.name}
                    </Text>
                  </View>

                  <Text
                    appearance="hint"
                    style={styles.nextUpDescription}
                    numberOfLines={2}
                  >
                    {badgeState.nextUp.badge.unlockText}
                  </Text>

                  {badgeState.nextUp.progressLabel ? (
                    <Text
                      appearance="hint"
                      style={styles.nextUpProgress}
                      numberOfLines={2}
                    >
                      {badgeState.nextUp.progressLabel}
                    </Text>
                  ) : null}
                </View>
              )}
            </CardShell>
          </View>

          {/* Grouped Badge Lists - icons are passed to BadgeTile */}
          <View style={styles.groupsContainer}>
            {groups.map((g) => (
              <CardShell key={g.section}>
                <Text category="h6" style={styles.groupTitle}>
                  {g.section}
                </Text>

                <View>
                  {g.items.map((b) => (
                    <BadgeTile
                      key={b.id}
                      name={b.name}
                      icon={b.icon}
                      unlockText={b.unlockText}
                      unlocked={b.unlocked}
                      progressLabel={b.progressLabel}
                    />
                  ))}
                </View>
              </CardShell>
            ))}
          </View>
        </ScrollView>
      </Layout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSubtitle: {
    marginTop: 4,
  },
  nextUpSection: {
    marginTop: 14,
  },
  sectionLabel: {
    marginBottom: 4,
  },
  noNextUpText: {
    marginTop: 8,
  },
  nextUpCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  nextUpIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  nextUpIcon: {
    fontSize: 24,
  },
  boldText: {
    fontWeight: "800",
  },
  nextUpDescription: {
    marginTop: 2,
    lineHeight: 18,
  },
  nextUpProgress: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 12,
  },
  groupsContainer: {
    marginTop: 14,
    gap: 12,
  },
  groupTitle: {
    marginBottom: 10,
  },
});