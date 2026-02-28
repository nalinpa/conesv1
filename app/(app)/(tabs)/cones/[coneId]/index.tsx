import { useCallback, useEffect, useState } from "react";
import { AppState, ScrollView, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack as UIStack } from "@/components/ui/Stack";

import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
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
import { GAMEPLAY } from "@/lib/constants/gameplay";

const MAX_ACCURACY_METERS = GAMEPLAY.MAX_GPS_ACCURACY_METERS;

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();
  const { session } = useSession();
  const [reviewErr, setReviewErr] = useState<string | null>(null);
  const uid = session.status === "authed" ? session.uid : null;

  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);

  // 1. Get live location stream from global provider for instant UI updates
  const { location: loc, errorMsg: providerErr } = useLocation();

  // 2. Use the hook purely for the high-accuracy manual refresh capability
  const { refresh: refreshLocation, isRefreshing, err: manualErr } = useUserLocation();

  // 3. Combine errors to figure out overall status
  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : loc ? "granted" : "unknown";

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
    // We only need to trigger the high-accuracy refresh now
    if (locStatus !== "denied") await refreshLocation();
  }, [locStatus, refreshLocation]);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      const res = await triggerComplete({ uid, cone, loc, gate });
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
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
            hasLoc={!!loc}
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
        error={reviewErr}
        onChangeRating={(val) => {
          setDraftRating(val);
          setReviewErr(null); // Clear error when they change input
        }}
        onChangeText={(text) => {
          setDraftText(text);
          setReviewErr(null); // Clear error when they change input
        }}
        onClose={() => {
          setReviewOpen(false);
          setReviewErr(null); // Clean up on close
        }}
        onSave={async () => {
          setReviewErr(null);
          const res = await saveReviewToDb({
            coneId: cone.id,
            coneSlug: cone.slug,
            coneName: cone.name,
            reviewRating: draftRating!,
            reviewText: draftText,
          });
          if (res.ok) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setReviewOpen(false);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setReviewErr(res.err);
          }
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
    marginTop: -20,
  },
});
