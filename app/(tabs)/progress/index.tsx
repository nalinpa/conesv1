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
import { ConesToReviewCard } from "@/components/progress/ConesToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";

import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { goBadges, goCone, goConesHome, goProgressHome } from "@/lib/routes";
import { ProgressHeaderCard } from "@/components/progress/ProgressHeader";

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
          <ProgressHeaderCard
            completed={totals.completed}
            total={totals.total}
            percent={totals.percent}
            shareBonusCount={shareBonusCount}
            allDone={allDone}
            onOpenBadges={goBadges}
            onBrowseVolcanoes={goConesHome}
          />

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
