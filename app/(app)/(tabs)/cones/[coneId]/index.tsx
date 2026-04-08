import React, { useCallback, useEffect, useState } from "react";
import { AppState, ScrollView, StyleSheet } from "react-native";
import { Stack as ExpoStack, router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack as UIStack } from "@/components/ui/Stack";

import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCone } from "@/lib/hooks/useCone";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useConeReviewsSummary } from "@/lib/hooks/useConeReviewsSummary";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useDraftsStore, useTrackingStore } from "@/lib/store/index";
import { GAMEPLAY } from "@/lib/constants/gameplay";

import { ConeHero } from "@/components/cone/detail/ConeHero";
import { ReviewsSummaryCard } from "@/components/cone/detail/ReviewsSummaryCard";
import { StatusCard } from "@/components/cone/detail/StatusCard";
import { ActionsCard } from "@/components/cone/detail/ActionsCard";
import { ReviewModal } from "@/components/cone/detail/ReviewModal";
import { goConesHome, goConeReviews } from "@/lib/routes";
import { FloatingBackButton } from "@/components/cone/detail/FloatingBackButton";

const MAX_ACCURACY_METERS = GAMEPLAY.MAX_GPS_ACCURACY_METERS;

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();
  const { session } = useSession();

  const {
    completedConeIds,
    pendingConeIds,
    sharedConeIds,
    loading: compsLoading,
  } = useMyCompletions();

  const isCompleted = !!coneId && completedConeIds.has(coneId);
  const isSyncing = !!coneId && pendingConeIds.has(coneId);
  const hasShareBonus = !!coneId && sharedConeIds.has(coneId);

  const [reviewErr, setReviewErr] = useState<string | null>(null);

  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);
  const { location: userCoords, errorMsg: providerErr } = useLocation();
  const { refresh: refreshLocation, err: manualErr } = useUserLocation();

  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : userCoords ? "granted" : "unknown";

  const gate = useGPSGate(cone, userCoords, { maxAccuracyMeters: MAX_ACCURACY_METERS });

  const {
    avgRating,
    ratingCount,
    myRating,
    myText: myReviewText,
    saving: reviewsSaving,
    saveReview: saveReviewToDb,
  } = useConeReviewsSummary(coneId);

  const [showBackButton, setShowBackButton] = useState(true);
  const [err, setErr] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const { drafts, setDraft, clearDraft } = useDraftsStore();
  const { triggerSuccessUI } = useTrackingStore();
  const currentDraft = drafts[coneId || ""] || { rating: null, text: "" };

  const refreshGPS = useCallback(async () => {
    if (locStatus !== "denied") await refreshLocation();
  }, [locStatus, refreshLocation]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (
        state === "active" &&
        (!userCoords || (gate.accuracyMeters || 0) > MAX_ACCURACY_METERS)
      ) {
        refreshGPS();
      }
    });
    return () => sub.remove();
  }, [userCoords, gate.accuracyMeters, refreshGPS]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (err) {
      timeoutId = setTimeout(() => {
        setErr("");
      }, 10000); // 10 seconds and then hide the error
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [err]);

  if (coneLoading || compsLoading || session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Scouting location..." />
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <ErrorCard
          title="Volcano Not Found"
          message={coneErr || "Could not find volcano."}
          action={{ label: "Go Back", onPress: goConesHome }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ExpoStack.Screen
        options={{
          title: cone.name,
          headerTransparent: true,
          headerTintColor: "#fff",
          headerLeft: () => null,
        }}
      />

      <FloatingBackButton visible={showBackButton} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setShowBackButton(offsetY < 50);
        }}
      >
        <ConeHero cone={cone} completed={isCompleted} />

        <UIStack gap="md" style={styles.content}>
          {err && (
            <ErrorCard
              status="warning"
              title="Check-in Issue"
              message={err || "An unknown error occurred"}
            />
          )}

          <StatusCard
            coneId={coneId}
            title={cone.name}
            completed={isCompleted}
            loc={userCoords}
            onCheckIn={() => triggerSuccessUI(cone.name, coneId)}
          />

          <ReviewsSummaryCard
            ratingCount={ratingCount}
            avgRating={avgRating}
            onViewAll={() => goConeReviews(cone.id, cone.name)}
            isCompleted={isCompleted}
            hasUserReviewed={!!myRating}
            onAddReview={() => setReviewOpen(true)}
          />

          <ActionsCard
            id={cone.id}
            title={cone.name}
            distanceMeters={gate.distanceMeters ?? 0}
            completed={isCompleted}
            shareBonus={hasShareBonus}
            isSyncing={isSyncing}
            hasLoc={!!userCoords}
            hasReview={!!myRating}
            myReviewRating={myRating}
            myReviewText={myReviewText}
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
        draftRating={currentDraft.rating}
        draftText={currentDraft.text}
        error={reviewErr}
        onChangeRating={(val) => {
          if (coneId) setDraft(coneId, val, currentDraft.text);
          setReviewErr(null);
        }}
        onChangeText={(text) => {
          if (coneId) setDraft(coneId, currentDraft.rating, text);
          setReviewErr(null);
        }}
        onClose={() => {
          setReviewOpen(false);
          setReviewErr(null);
        }}
        onSave={async () => {
          setReviewErr(null);
          const res = await saveReviewToDb({
            coneId: cone.id,
            coneSlug: cone.slug,
            coneName: cone.name,
            reviewRating: currentDraft.rating!,
            reviewText: currentDraft.text,
          });
          if (res.ok) {
            if (coneId) clearDraft(coneId);
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
