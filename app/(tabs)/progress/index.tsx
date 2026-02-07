import { useMemo } from "react";
import { View, ScrollView } from "react-native";

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
import { ProgressHeaderCard } from "@/components/progress/ProgressHeader";

import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { goBadges, goCone, goConesHome, goProgressHome } from "@/lib/routes";

import { space } from "@/lib/ui/tokens";
import { Stack } from "@/components/ui/Stack";
import { Section } from "@/components/ui/Section";
import { AppText } from "@/components/ui/AppText";

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
    const completed = cones.reduce(
      (acc, c) => acc + (completedIds.has(c.id) ? 1 : 0),
      0,
    );
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
        <View style={{ flex: 1 }}>
          <LoadingState label="Loading progress…" />
        </View>
      </Screen>
    );
  }

  if (fatalErr) {
    return (
      <Screen padded={false}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: space.md,
          }}
        >
          <ErrorCard
            title="Progress"
            message={fatalErr}
            action={{ label: "Retry", onPress: goProgressHome, appearance: "filled" }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: space.md,
          paddingTop: space.md,
          paddingBottom: space.xl,
        }}
      >
        <Stack gap="lg">
          <Section>
            <ProgressHeaderCard
              completed={totals.completed}
              total={totals.total}
              percent={totals.percent}
              shareBonusCount={shareBonusCount}
              allDone={allDone}
              onOpenBadges={goBadges}
              onBrowseVolcanoes={goConesHome}
            />
          </Section>

          <Section>
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
          </Section>

          <Section>
            <ConesToReviewCard
              cones={conesToReview.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
              }))}
              onOpenCone={openCone}
            />
          </Section>

          <Section>
            <BadgesSummaryCard
              nextUp={badgeState.nextUp}
              recentlyUnlocked={badgeState.recentlyUnlocked}
              onViewAll={goBadges}
            />
          </Section>
        </Stack>
      </ScrollView>
    </Screen>
  );
}
