import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, View, ScrollView } from "react-native";
import { Stack, router, useLocalSearchParams, useFocusEffect } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { goConesHome, goConeReviews } from "@/lib/routes";

import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { useSession } from "@/lib/providers/SessionProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCone } from "@/lib/hooks/useCone";
import { useConeCompletion } from "@/lib/hooks/useConeCompletion";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useConeReviewsSummary } from "@/lib/hooks/useConeReviewsSummary";

import { ConeHero } from "@/components/cone/detail/ConeHero";
import { ReviewsSummaryCard } from "@/components/cone/detail/ReviewsSummaryCard";
import { StatusCard } from "@/components/cone/detail/StatusCard";
import { ActionsCard } from "@/components/cone/detail/ActionsCard";
import { ReviewModal } from "@/components/cone/detail/ReviewModal";
import { completionService } from "@/lib/services/completionService";

const MAX_ACCURACY_METERS = 50;

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();

  // Session
  const { session } = useSession();
  const sessionLoading = session.status === "loading";
  const uid = session.status === "authed" ? session.uid : null;

  // Cone
  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);

  // Shared location flow
  const {
    loc,
    status: locStatus,
    err: locErr,
    refresh: refreshLocation,
    request: requestLocation,
    isRefreshing,
  } = useUserLocation();

  // Completion
  const { completedId, shareBonus, err: completionErr } =
    useConeCompletion(coneId);

  // GPS gate
  const gate = useGPSGate(cone, loc, { maxAccuracyMeters: MAX_ACCURACY_METERS });

  // Reviews summary (+ write)
  const {
    avgRating,
    ratingCount,
    myRating: myReviewRating,
    myText: myReviewText,
    err: reviewsErr,
    saving: reviewsSaving,
    saveReview: saveReviewToDb,
  } = useConeReviewsSummary(coneId);

  // UI state
  const [err, setErr] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Review modal draft
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftRating, setDraftRating] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");
  const [optimisticReviewRating, setOptimisticReviewRating] = useState<number | null>(
    null,
  );
  const [optimisticReviewText, setOptimisticReviewText] = useState<string | null>(
    null,
  );

  const refreshGPS = useCallback(async () => {
    // If permission is unknown, request first (updates hook state)
    if (locStatus === "unknown") {
      const res = await requestLocation();
      if (!res.ok) return;
    }

    // If denied, don't keep trying
    if (locStatus === "denied") return;

    // Guarded inside the hook (single-flight + min interval)
    await refreshLocation();
  }, [locStatus, requestLocation, refreshLocation]);

  // ---------------------------------
  // App returns from Settings → re-check permission + refresh fix
  // ---------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;

      const accuracyOk =
        gate.accuracyMeters == null || gate.accuracyMeters <= MAX_ACCURACY_METERS;

      const needsHelp = locStatus === "unknown" || !loc || !accuracyOk;

      if (needsHelp) {
        void refreshGPS();
      }
    });

    return () => sub.remove();
  }, [locStatus, loc, gate.accuracyMeters, refreshGPS]);

  useEffect(() => {
    if (myReviewRating != null) {
      setOptimisticReviewRating(null);
      setOptimisticReviewText(null);
    }
  }, [myReviewRating]);

  // ---------------------------------
  // Auto-refresh GPS on focus (skip if completed; avoid loops)
  // ---------------------------------
  useFocusEffect(
    useCallback(() => {
      if (completedId) return () => {};

      const accuracyOk =
        gate.accuracyMeters == null || gate.accuracyMeters <= MAX_ACCURACY_METERS;

      const needsHelp = !loc || !accuracyOk;

      if (needsHelp) {
        void refreshGPS();
      }

      return () => {};
    }, [completedId, loc, gate.accuracyMeters, refreshGPS]),
  );

  // ---------------------------------
  // Actions
  // ---------------------------------
  async function completeCone() {
    if (!cone) return;
    if (completedId) return;

    setErr("");

    if (sessionLoading) {
      setErr("Loading your session…");
      return;
    }

    if (!uid) {
      setErr("Please sign in to save your visits.");
      return;
    }

    if (locStatus === "denied") {
      setErr("Turn on location in Settings to mark visits.");
      return;
    }

    if (!loc) {
      const res = await requestLocation();
      if (!res.ok) {
        setErr("We don’t have your location yet. Try refresh.");
        return;
      }
      setErr("Got your location — tap I’m here again.");
      return;
    }

    // Gate checks
    if (!gate.inRange) {
      if (
        gate.distanceMeters != null &&
        gate.checkpointRadius != null &&
        gate.distanceMeters > gate.checkpointRadius
      ) {
        setErr(`Not quite there yet — about ${Math.round(gate.distanceMeters)} m away.`);
        return;
      }
      if (gate.accuracyMeters != null && gate.accuracyMeters > MAX_ACCURACY_METERS) {
        setErr(
          `Location isn’t accurate enough yet (${Math.round(
            gate.accuracyMeters,
          )} m). Try again in a clearer spot.`,
        );
        return;
      }
      setErr("Not quite there yet.");
      return;
    }

    setSaving(true);
    try {
      await completionService.completeCone({
        uid,
        cone,
        loc,
        gate,
      });

      // live snapshot (useConeCompletion) will update completedId + shareBonus
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "We couldn’t mark this visit. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function doShareBonus() {
    if (!cone) return;

    router.push({
      pathname: "/share-frame",
      params: {
        coneId: cone.id,
        coneName: cone.name,
        region: cone.region ?? "",
        visitedLabel: "Visited",
        completedAtMs: String(Date.now()),
      },
    });
  }

  function openReview() {
    if (!completedId) return;
    if (optimisticReviewRating != null || myReviewRating != null) return;

    setDraftRating(null);
    setDraftText("");
    setReviewOpen(true);
    setErr("");
  }

  async function saveReview() {
    if (!cone) return;

    if (sessionLoading) {
      setErr("Loading your session…");
      return;
    }

    if (!uid) {
      setErr("Please sign in to leave a review.");
      return;
    }

    if (!completedId) {
      setErr("Visit this volcano first, then you can leave a review.");
      return;
    }

    if (myReviewRating != null) return;

    if (draftRating == null || draftRating < 1 || draftRating > 5) {
      setErr("Pick a rating from 1 to 5.");
      return;
    }

    setErr("");

    const res = await saveReviewToDb({
      coneId: cone.id,
      coneSlug: cone.slug,
      coneName: cone.name,
      reviewRating: draftRating,
      reviewText: draftText,
    });

    if (!res.ok) {
      setErr(res.err);
      return;
    }

    // Keep optimistic UI (snappy)
    const cleanedText = draftText.trim() ? draftText.trim().slice(0, 280) : null;
    setOptimisticReviewRating(draftRating);
    setOptimisticReviewText(cleanedText);

    setReviewOpen(false);
  }

  // ---------------------------------
  // Loading / error states
  // ---------------------------------
  const headerTitle = cone?.name ?? "Volcano";

  if (sessionLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Loading…" }} />
        <LoadingState fullScreen={false} label="Loading your session…" />
      </Screen>
    );
  }

  if (coneLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Loading…" }} />
        <LoadingState fullScreen={false} label="Loading volcano…" />
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Volcano" }} />
        <ErrorCard
          title="Couldn’t load volcano"
          message={coneErr || "This volcano couldn’t be found."}
          action={{ label: "Back to list", onPress: goConesHome }}
        />
      </Screen>
    );
  }

  // ---------------------------------
  // Main UI
  // ---------------------------------
  const completed = !!completedId;
  const displayReviewRating = optimisticReviewRating ?? myReviewRating;
  const displayReviewText = optimisticReviewText ?? myReviewText;

  const hasReview = displayReviewRating != null;

  const topErr = err || completionErr || locErr || reviewsErr || "";
  void topErr;

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ConeHero cone={cone} completed={completed} />

        <View style={{ height: 14 }} />

        {err ? (
          <>
            <ErrorCard title="Heads up" message={err} status="warning" />
            <View style={{ height: 14 }} />
          </>
        ) : null}

        <ReviewsSummaryCard
          ratingCount={ratingCount}
          avgRating={avgRating}
          onViewAll={() => goConeReviews(cone.id, cone.name)}
        />

        <View style={{ height: 14 }} />

        <StatusCard
          completed={completed}
          loc={loc}
          locStatus={locStatus}
          accuracyMeters={gate.accuracyMeters}
          inRange={gate.inRange}
          onRefreshGPS={refreshGPS}
          refreshingGPS={isRefreshing}
          maxAccuracyMeters={MAX_ACCURACY_METERS}
        />

        <View style={{ height: 14 }} />

        <ActionsCard
          completed={completed}
          saving={saving}
          hasLoc={!!loc}
          onComplete={() => void completeCone()}
          hasReview={hasReview}
          myReviewRating={displayReviewRating}
          myReviewText={displayReviewText}
          onOpenReview={openReview}
          shareBonus={shareBonus}
          onShareBonus={() => void doShareBonus()}
        />
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        saving={reviewsSaving}
        draftRating={draftRating}
        draftText={draftText}
        onChangeRating={setDraftRating}
        onChangeText={setDraftText}
        onClose={() => setReviewOpen(false)}
        onSave={() => void saveReview()}
      />
    </Screen>
  );
}
