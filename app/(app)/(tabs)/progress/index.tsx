import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack } from "@/components/ui/Stack";
import { Section } from "@/components/ui/Section";
import { CardShell } from "@/components/ui/CardShell";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

import { ConesToReviewCard } from "@/components/progress/ConesToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";
import { ProgressHeaderCard } from "@/components/progress/ProgressHeader";

import { goBadges, goCone, goConesHome, goLogin, goProgressHome } from "@/lib/routes";

export default function ProgressScreen() {
  const { session } = useSession();

  if (session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Syncing progress…" />
      </Screen>
    );
  }

  if (session.status !== "authed") return <GuestProgress />;

  return <AuthedProgress />;
}

function GuestProgress() {
  return (
    <Screen scrollable padded>
      <Section title="Progress">
        <CardShell status="surf">
          <Stack gap="md">
            <AppText variant="body">
              Join the community to track your climbs, earn badges for reaching summits,
              and share your experiences.
            </AppText>
            <Stack gap="sm">
              <AppButton variant="primary" onPress={goLogin}>
                Sign In
              </AppButton>
              <AppButton variant="secondary" onPress={goConesHome}>
                Browse Cones
              </AppButton>
            </Stack>
          </Stack>
        </CardShell>
      </Section>
    </Screen>
  );
}

function AuthedProgress() {
  const { cones, loading: conesLoading, err: conesErr } = useCones();
  
  // Use the global location provider for instant hot-caching
  const { location: loc, errorMsg: locErr } = useLocation();

  const my = useMyCompletions();
  const myReviews = useMyReviews();
  const { badgeState } = useBadgesData();

  const totals = useMemo(() => {
    const total = cones.length;
    const completed = cones.filter((c) => my.completedConeIds.has(c.id)).length;
    const percent = total === 0 ? 0 : completed / total;
    return { total, completed, percent };
  }, [cones, my.completedConeIds]);

  const nearestUnclimbed = useNearestUnclimbed(cones, my.completedConeIds, loc);

  const conesToReview = useMemo(() => {
    return cones.filter(
      (c) => my.completedConeIds.has(c.id) && !myReviews.reviewedConeIds.has(c.id),
    );
  }, [cones, my.completedConeIds, myReviews.reviewedConeIds]);

  const loading = conesLoading || my.loading || myReviews.loading;
  const fatalErr = conesErr || my.err || myReviews.err;

  if (loading)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );

  if (fatalErr) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <ErrorCard
            title="Progress Error"
            message={fatalErr}
            action={{ label: "Retry", onPress: goProgressHome }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable padded>
      <Stack gap="xl">
        {/* Statistics Dashboard */}
        <ProgressHeaderCard
          completed={totals.completed}
          total={totals.total}
          percent={totals.percent}
          reviewCount={myReviews.reviewedConeIds.size}
          shareCount={my.shareBonusCount || 0}
          allDone={totals.completed >= totals.total && totals.total > 0}
          onOpenBadges={goBadges}
          onBrowseVolcanoes={goConesHome}
        />

        {/* Tactical Mission (Card handles its own title) */}
        <Section>
          <NearestUnclimbedCard
            cone={nearestUnclimbed?.cone}
            distanceMeters={nearestUnclimbed?.distanceMeters}
            locErr={locErr}
            onOpenCone={goCone}
          />
        </Section>

        {/* Action Required */}
        {conesToReview.length > 0 && (
          <Section>
            <ConesToReviewCard cones={conesToReview} onOpenCone={goCone} />
          </Section>
        )}

        {/* Achievements */}
        <Section>
          <BadgesSummaryCard
            nextUp={badgeState.nextUp}
            recentlyUnlocked={badgeState.recentlyUnlocked}
            onViewAll={goBadges}
          />
        </Section>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
  },
});