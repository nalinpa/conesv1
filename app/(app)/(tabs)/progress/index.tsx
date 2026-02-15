import React, { useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { Stack } from "@/components/ui/Stack";
import { Section } from "@/components/ui/Section";
import { AppText } from "@/components/ui/AppText";
import { CardShell } from "@/components/ui/CardShell";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";

import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

import { ConesToReviewCard } from "@/components/progress/ConesToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";
import { ProgressHeaderCard } from "@/components/progress/ProgressHeader";

import { goBadges, goCone, goConesHome, goLogin, goProgressHome } from "@/lib/routes";
import { space } from "@/lib/ui/tokens";

export default function ProgressScreen() {
  const { session } = useSession();

  if (session.status === "loading") {
    return (
      <Screen padded={false}>
        <View style={styles.flex1}>
          <LoadingState label="Loading…" />
        </View>
      </Screen>
    );
  }

  // Guests + logged-out both get the “marketing” screen
  if (session.status !== "authed") return <GuestProgress />;

  return <AuthedProgress />;
}

function GuestProgress() {
  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Stack gap="lg">
          <Section>
            <CardShell>
              <Stack gap="sm">
                <AppText variant="screenTitle">Progress</AppText>

                <AppText variant="body">
                  You can browse cones and read reviews without signing in. Sign in to
                  track completions and earn badges.
                </AppText>

                <Stack gap="sm" style={styles.guestActions}>
                  <AppButton variant="primary" onPress={goLogin}>
                    Sign in
                  </AppButton>

                  <AppButton variant="secondary" onPress={goConesHome}>
                    Browse cones
                  </AppButton>
                </Stack>
              </Stack>
            </CardShell>
          </Section>
        </Stack>
      </ScrollView>
    </Screen>
  );
}

function AuthedProgress() {
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
        <View style={styles.flex1}>
          <LoadingState label="Loading progress…" />
        </View>
      </Screen>
    );
  }

  if (fatalErr) {
    return (
      <Screen padded={false}>
        <View style={styles.errorContainer}>
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
        contentContainerStyle={styles.scrollContent}
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

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  guestActions: {
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
});
