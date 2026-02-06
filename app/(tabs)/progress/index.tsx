import { useMemo } from "react";
import { View, ScrollView } from "react-native";

import { Layout, Text, Button } from "@ui-kitten/components";

import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

import { Screen } from "@/components/screen";
import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";
import { ConesToReviewCard } from "@/components/progress/ConesToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";

import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { goBadges, goCone, goProgressHome } from "@/lib/routes";

export default function ProgressScreen() {
  const { cones, loading: conesLoading, err: conesErr } = useCones();
  const { loc, err: locErr } = useUserLocation();

  const my = useMyCompletions();
  const myReviews = useMyReviews();
  const { badgeState } = useBadgesData();

  const completedIds = my.completedConeIds;
  const shareBonusCount = my.shareBonusCount;
  const reviewedConeIds = myReviews.reviewedConeIds;

  const totals = useMemo(() => {
    const total = cones.length;
    const completed = cones.reduce((acc, c) => acc + (completedIds.has(c.id) ? 1 : 0), 0);
    const percent = total === 0 ? 0 : completed / total;
    return { total, completed, percent };
  }, [cones, completedIds]);

  const nearestUnclimbed = useNearestUnclimbed(cones, completedIds, loc);

  const conesToReview = useMemo(() => {
    return cones
      .filter((c) => completedIds.has(c.id) && !reviewedConeIds.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cones, completedIds, reviewedConeIds]);

  const allDone = totals.total > 0 && totals.completed >= totals.total;

  function openCone(coneId: string) {
    goCone(coneId);
  }

  const loading = conesLoading || my.loading || myReviews.loading;
  const fatalErr = conesErr || my.err || myReviews.err;

  if (loading) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading progress…" />
        </Layout>
      </Screen>
    );
  }

  if (fatalErr) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
          <ErrorCard
            title="Progress"
            message={fatalErr}
            action={{ label: "Retry", onPress: goProgressHome, appearance: "filled" }}
          />
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Layout style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text category="h4" style={{ fontWeight: "900" }}>
                Progress
              </Text>
              <Text appearance="hint" style={{ marginTop: 4 }}>
                {totals.completed} / {totals.total} completed
              </Text>
            </View>

            <Button size="small" appearance="outline" onPress={goBadges}>
              Badges
            </Button>
          </View>

          <CardShell>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <PieChart percent={totals.percent} />

              <View style={{ flex: 1, gap: 10 }}>
                <StatRow label="Completed" value={`${totals.completed}`} />
                <StatRow
                  label="Remaining"
                  value={`${Math.max(0, totals.total - totals.completed)}`}
                />
                <StatRow label="Share bonuses" value={`${shareBonusCount}`} />
              </View>
            </View>

            {allDone ? (
              <View style={{ marginTop: 12 }}>
                <Text category="s1" style={{ fontWeight: "900" }}>
                  You’ve completed everything ✅
                </Text>
              </View>
            ) : null}
          </CardShell>

          <NearestUnclimbedCard
            cone={
              nearestUnclimbed
                ? {
                    id: nearestUnclimbed.cone.id,
                    name: nearestUnclimbed.cone.name,
                    description: nearestUnclimbed.cone.description,
                  }
                : null
            }
            distanceMeters={nearestUnclimbed?.distanceMeters ?? null}
            locErr={locErr}
            onOpenCone={openCone}
          />

          <ConesToReviewCard
            cones={conesToReview.map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description,
            }))}
            onOpenCone={openCone}
          />

          <BadgesSummaryCard
            nextUp={badgeState.nextUp}
            recentlyUnlocked={badgeState.recentlyUnlocked}
            onViewAll={goBadges}
          />
        </ScrollView>
      </Layout>
    </Screen>
  );
}
