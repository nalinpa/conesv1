import { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { Layout, Text, Button } from "@ui-kitten/components";

import { BADGES, getBadgeState } from "@/lib/badges";
import type { ConeMeta } from "@/lib/badges";
import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { goProgressHome, goBadges } from "@/lib/routes";

import { LoadingState } from "@/components/ui/LoadingState";
import { CardShell } from "@/components/ui/CardShell";
import { Screen } from "@/components/screen";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { BadgeTile } from "@/components/badges/BadgeTile";

export default function BadgesScreen() {
  const {
    loading,
    err,  
    conesMeta,
    completedConeIds,
    shareBonusCount,
    completedAtByConeId,
  } = useBadgesData();

  const badgeState = useMemo(() => {
    return getBadgeState({
      cones: conesMeta as ConeMeta[],
      completedConeIds,
      shareBonusCount,
      completedAtByConeId,
    });
  }, [conesMeta, completedConeIds, shareBonusCount, completedAtByConeId]);

  const totals = useMemo(() => {
    const unlocked = badgeState.earnedIds.size;
    const total = BADGES.length;
    return { unlocked, total };
  }, [badgeState.earnedIds]);

  const items = useMemo(() => {
    return BADGES.map((b) => {
      const progress = badgeState.progressById[b.id];
      const unlocked = badgeState.earnedIds.has(b.id);
      return {
        id: b.id,
        name: b.name,
        unlockText: b.unlockText,
        unlocked,
        progressLabel: unlocked ? null : progress?.progressLabel ?? null,
      };
    });
  }, [badgeState.earnedIds, badgeState.progressById]);

  if (loading) {
    return (
      <Layout style={{ flex: 1 }}>
        <LoadingState label="Loading badges…" />
      </Layout>
    );
  }

  if (err) {
    return (
      <Screen>
        <Layout style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <ErrorCard
            title="Badges"
            message={err}
            action={{ label: "Retry", onPress: goBadges, appearance: "filled" }}
          />
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen>
      <Layout style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text category="h1">Badges</Text>
              <Text appearance="hint" style={{ marginTop: 4 }}>
                {totals.unlocked} / {totals.total} unlocked
              </Text>
            </View>

            <Button size="small" appearance="outline" onPress={goProgressHome}>
              Done
            </Button>
          </View>

          {/* Next up */}
          <View style={{ marginTop: 14 }}>
            <CardShell>
              <Text category="h6">Next up</Text>

              {!badgeState.nextUp ? (
                <Text appearance="hint" style={{ marginTop: 8 }}>
                  Nothing queued — you might already have everything that’s configured.
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
                  <Text category="s1" style={{ fontWeight: "800" }}>
                    {badgeState.nextUp.badge.name}
                  </Text>
                  <Text appearance="hint" style={{ marginTop: 6 }}>
                    {badgeState.nextUp.badge.unlockText}
                  </Text>
                  {badgeState.nextUp.progressLabel ? (
                    <Text appearance="hint" style={{ marginTop: 10 }}>
                      {badgeState.nextUp.progressLabel}
                    </Text>
                  ) : null}
                </View>
              )}
            </CardShell>
          </View>

          {/* Grid */}
          <View style={{ marginTop: 14 }}>
            <CardShell>
              <Text category="h6" style={{ marginBottom: 10 }}>
                All badges
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {items.map((b) => (
                  <BadgeTile
                    key={b.id}
                    name={b.name}
                    unlockText={b.unlockText}
                    unlocked={b.unlocked}
                    progressLabel={b.progressLabel}
                  />
                ))}
              </View>

              <Text appearance="hint" style={{ marginTop: 10 }}>
                Tip: unlocked badges are full opacity; locked badges are faded.
              </Text>
            </CardShell>
          </View>
        </ScrollView>
      </Layout>
    </Screen>
  );
}
