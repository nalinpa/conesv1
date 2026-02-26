import { useCallback, useEffect, useState } from "react";
import { AppState, ScrollView, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack as UIStack } from "@/components/ui/Stack";

import { useSession } from "@/lib/providers/SessionProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCone } from "@/lib/hooks/useCone";
import { useConeCompletion } from "@/lib/hooks/useConeCompletion";
import { useConeCompletionMutation } from "@/lib/hooks/useConeCompletionMutation";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useConeReviewsSummary } from "@/lib/hooks/useConeReviewsSummary";

import { ConeHero } from "@/components/cone/detail/ConeHero";
import { ReviewsSummaryCard } from "@/components/cone/detail/ReviewsSummaryCard";
import { StatusCard } from "@/components/cone/detail/StatusCard";
import { ActionsCard } from "@/components/cone/detail/ActionsCard";
import { ReviewModal } from "@/components/cone/detail/ReviewModal";
import { goConesHome, goConeReviews } from "@/lib/routes";

const MAX_ACCURACY_METERS = 50;

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);
  const {
    loc,
    status: locStatus,
    refresh: refreshLocation,
    request: requestLocation,
    isRefreshing,
  } = useUserLocation();
  const { completedId } = useConeCompletion(coneId);

  const {
    completeCone: triggerComplete,
    loading: completing,
    err: mutationErr,
    reset: resetMutationErr,
  } = useConeCompletionMutation();
  const gate = useGPSGate(cone, loc, { maxAccuracyMeters: MAX_ACCURACY_METERS });
  const {
    avgRating,
    ratingCount,
    myRating,
    saving: reviewsSaving,
    saveReview: saveReviewToDb,
  } = useConeReviewsSummary(coneId);

  const [err, setErr] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftRating, setDraftRating] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");

  const refreshGPS = useCallback(async () => {
    if (locStatus === "unknown") await requestLocation();
    if (locStatus !== "denied") await refreshLocation();
  }, [locStatus, requestLocation, refreshLocation]);

  // Sync GPS on App State Change
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (
        state === "active" &&
        (!loc || (gate.accuracyMeters || 0) > MAX_ACCURACY_METERS)
      ) {
        refreshGPS();
      }
    });
    return () => sub.remove();
  }, [loc, gate.accuracyMeters, refreshGPS]);

  const handleComplete = async () => {
    if (!cone || completedId || completing) return;
    setErr("");
    resetMutationErr();

    if (!uid) {
      setErr("Sign in to save your visit.");
      return;
    }
    
    if (!gate.inRange) {
      setErr(
        gate.distanceMeters
          ? `You're ${Math.round(gate.distanceMeters)}m away.`
          : "Not in range.",
      );
      return;
    }
    if (loc) {
      await triggerComplete({ uid, cone, loc, gate });
    }
  };

  if (coneLoading || session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Preparing summit..." />
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <ErrorCard
          title="Peak Not Found"
          message={coneErr || "Could not find volcano."}
          action={{ label: "Go Back", onPress: goConesHome }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{ title: cone.name, headerTransparent: true, headerTintColor: "#fff" }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <ConeHero cone={cone} completed={!!completedId} />

        <UIStack gap="md" style={styles.content}>
          {(err || mutationErr) && (
            <ErrorCard
              status="warning"
              title="Check-in Issue"
              message={err || mutationErr || "An unknown error occurred"}
            />
          )}

          <StatusCard
            completed={!!completedId}
            loc={loc}
            locStatus={locStatus}
            accuracyMeters={gate.accuracyMeters}
            inRange={gate.inRange}
            onRefreshGPS={refreshGPS}
            refreshingGPS={isRefreshing}
          />

          <ReviewsSummaryCard
            ratingCount={ratingCount}
            avgRating={avgRating}
            onViewAll={() => goConeReviews(cone.id, cone.name)}
          />

          <ActionsCard
            completed={!!completedId}
            saving={completing}
            onComplete={handleComplete}
            hasReview={!!myRating}
            onOpenReview={() => setReviewOpen(true)}
            onShareBonus={() =>
              router.push({
                pathname: "/share-frame",
                params: { coneId: cone.id, coneName: cone.name },
              })
            }
          />
        </UIStack>
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        saving={reviewsSaving}
        draftRating={draftRating}
        draftText={draftText}
        onChangeRating={setDraftRating}
        onChangeText={setDraftText}
        onClose={() => setReviewOpen(false)}
        onSave={async () => {
          const res = await saveReviewToDb({
            coneId: cone.id,
            coneSlug: cone.slug,
            coneName: cone.name,
            reviewRating: draftRating!,
            reviewText: draftText,
          });
          if (res.ok) setReviewOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -20, // Overlap the hero for a layered look
  },
});
