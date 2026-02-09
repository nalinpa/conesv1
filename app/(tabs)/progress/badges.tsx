import { View, ScrollView } from "react-native";
import { Layout, Text, Button } from "@ui-kitten/components";

import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { goProgressHome, goBadges } from "@/lib/routes";

import { LoadingState } from "@/components/ui/LoadingState";
import { CardShell } from "@/components/ui/CardShell";
import { Screen } from "@/components/ui/screen";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { BadgeTile } from "@/components/badges/BadgeTile";
import { AppButton } from "@/components/ui/AppButton";

const SECTION_ORDER = ["Core", "Social", "Types", "Regions", "Reviews", "Completionist"];

type BadgeGroup = {
  section: string;
  items: Array<{
    id: string;
    name: string;
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
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading badges…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
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
      <Layout style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text category="h1">Badges</Text>
              <Text appearance="hint" style={{ marginTop: 4 }}>
                {badgeTotals.unlocked} of {badgeTotals.total} earned
              </Text>
            </View>

              <AppButton
                variant="secondary"
                size="sm"
                onPress={goProgressHome}
              >
                Back
              </AppButton>
          </View>

          <View style={{ marginTop: 14 }}>
            <CardShell>
              <Text category="h6">Next up</Text>

              {!badgeState.nextUp ? (
                <Text appearance="hint" style={{ marginTop: 8 }}>
                  Nothing new right now.
                </Text>
              ) : (
                <View
                  style={{
                    marginTop: 12,
                    borderWidth: 1,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                >
                  <Text category="s1" style={{ fontWeight: "800" }} numberOfLines={1}>
                    {badgeState.nextUp.badge.name}
                  </Text>

                  <Text appearance="hint" style={{ marginTop: 6 }} numberOfLines={2}>
                    {badgeState.nextUp.badge.unlockText}
                  </Text>

                  {badgeState.nextUp.progressLabel ? (
                    <Text appearance="hint" style={{ marginTop: 10 }} numberOfLines={2}>
                      {badgeState.nextUp.progressLabel}
                    </Text>
                  ) : null}
                </View>
              )}
            </CardShell>
          </View>

          <View style={{ marginTop: 14, gap: 12 }}>
            {groups.map((g) => (
              <CardShell key={g.section}>
                <Text category="h6" style={{ marginBottom: 10 }}>
                  {g.section}
                </Text>

                <View>
                  {g.items.map((b) => (
                    <BadgeTile
                      key={b.id}
                      name={b.name}
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
