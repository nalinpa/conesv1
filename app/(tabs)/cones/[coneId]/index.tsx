import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, View, ScrollView, Share } from "react-native";
import { Stack, useLocalSearchParams, useFocusEffect } from "expo-router";

import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

import { Screen } from "@/components/screen";
import type { ConeCompletionWrite } from "@/lib/models";
import { goConesHome, goConeReviews } from "@/lib/routes";

import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { useAuthUser } from "@/lib/hooks/useAuthUser";
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

type PublicReviewDoc = {
  coneId: string;
  coneName: string;
  userId: string;
  reviewRating: number; // 1..5
  reviewText: string | null;
  reviewCreatedAt: any;
};

const MAX_ACCURACY_METERS = 50;

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();

  // Auth (avoid auth.currentUser races)
  const { loading: authLoading, uid } = useAuthUser();

  // Cone
  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);

  // Shared location flow
  const {
    loc,
    status: locStatus,
    err: locErr,
    refresh: refreshLocation,
    request: requestLocation,
    isRefreshing 
  } = useUserLocation();

  // Completion
  const {
    completedId,
    shareBonus,
    err: completionErr,
    setShareBonusLocal,
  } = useConeCompletion(coneId);

  // GPS gate
  const gate = useGPSGate(cone, loc, { maxAccuracyMeters: MAX_ACCURACY_METERS });

  // Reviews summary
  const {
    avgRating,
    ratingCount,
    myRating: myReviewRating,
    myText: myReviewText,
    err: reviewsErr,
  } = useConeReviewsSummary(coneId);

  // UI state
  const [err, setErr] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Review modal draft
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftRating, setDraftRating] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  const refreshGPS = useCallback(async () => {
    // If permission is unknown, request first (updates hook state)
    if (locStatus === "unknown") {
      await requestLocation();
    }

    // Guarded inside the hook (single-flight + min interval)
    await refreshLocation();
  }, [locStatus, requestLocation, refreshLocation]);

  // ---------------------------------
  // App returns from Settings → re-check permission + refresh fix
  // ---------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;

      (async () => {
        // Re-check permission + grab a quick fix
        const perm = await requestLocation();

        // If granted, also try a high-accuracy refresh (GUARDED in hook)
        if (perm.ok) {
          await refreshLocation();
        }
      })();
    });

    return () => sub.remove();
  }, [requestLocation, refreshLocation]);

  const onRefreshGPS = useCallback(async () => {
    // If permission state is unknown, prompt first.
    // (If already granted/denied, request() is not needed.)
    if (locStatus === "unknown") {
      const res = await requestLocation();
      if (!res.ok) return; // denied or failed -> hook sets err/status
    }

    // High accuracy refresh (already single-flight + throttled inside the hook)
    await refreshLocation();
  }, [locStatus, requestLocation, refreshLocation]);


  // ---------------------------------
  // Auto-refresh GPS on focus (skip if completed; avoid loops)
  // Only refresh when we actually "need help":
  //  - no loc yet, or
  //  - accuracy is too low
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

    if (authLoading) {
      setErr("Signing you in…");
      return;
    }
    if (!uid) {
      setErr("Not signed in.");
      return;
    }

    if (locStatus === "denied") {
      setErr("Location permission denied. Please enable it in Settings.");
      return;
    }

    if (!loc) {
      const res = await requestLocation();
      if (!res.ok) {
        setErr("Location not available yet. Try refresh.");
        return;
      }
      setErr("Location acquired — tap Complete again.");
      return;
    }

    // Gate checks
    if (!gate.inRange) {
      if (
        gate.distanceMeters != null &&
        gate.checkpointRadius != null &&
        gate.distanceMeters > gate.checkpointRadius
      ) {
        setErr(`Not in range yet. You are ~${Math.round(gate.distanceMeters)}m away.`);
        return;
      }
      if (gate.accuracyMeters != null && gate.accuracyMeters > MAX_ACCURACY_METERS) {
        setErr(
          `GPS accuracy too low (${Math.round(
            gate.accuracyMeters,
          )}m). Try refresh in a clearer spot.`,
        );
        return;
      }
      setErr("Not in range yet.");
      return;
    }

    setSaving(true);
    try {
      const completionId = `${uid}_${cone.id}`;

      const payload: ConeCompletionWrite = {
        coneId: cone.id,
        coneSlug: cone.slug,
        coneName: cone.name,
        userId: uid,
        completedAt: serverTimestamp(),

        deviceLat: loc.coords.latitude,
        deviceLng: loc.coords.longitude,
        accuracyMeters: loc.coords.accuracy ?? null,

        distanceMeters: gate.distanceMeters ?? 0,

        checkpointId: gate.checkpointId ?? null,
        checkpointLabel: gate.checkpointLabel ?? null,
        checkpointLat: gate.checkpointLat ?? null,
        checkpointLng: gate.checkpointLng ?? null,
        checkpointRadiusMeters: gate.checkpointRadius ?? null,
        checkpointDistanceMeters: gate.distanceMeters ?? null,

        shareBonus: false,
        shareConfirmed: false,
        sharedAt: null,
        sharedPlatform: null,
      };

      await setDoc(doc(db, COL.coneCompletions, completionId), payload);
      // live snapshot will update completedId + shareBonus
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to save completion");
    } finally {
      setSaving(false);
    }
  }

  async function doShareBonus() {
    if (!cone) return;
    if (!completedId) return;
    if (shareBonus) return;

    if (authLoading) return;
    if (!uid) return;

    try {
      const text = `I just completed ${cone.name} 🌋 #AucklandCones #cones`;
      await Share.share({ message: text });

      const completionId = `${uid}_${cone.id}`;

      await updateDoc(doc(db, COL.coneCompletions, completionId), {
        shareBonus: true,
        shareConfirmed: true,
        sharedAt: serverTimestamp(),
        sharedPlatform: "unknown",
      });

      // UI snappiness; snapshot will confirm
      setShareBonusLocal(true);
    } catch {
      // cancel is normal
    }
  }

  function openReview() {
    if (!completedId) return;
    if (myReviewRating != null) return;
    setDraftRating(null);
    setDraftText("");
    setReviewOpen(true);
  }

  async function saveReview() {
    if (!cone) return;

    if (authLoading) {
      setErr("Signing you in…");
      return;
    }
    if (!uid) {
      setErr("Not signed in.");
      return;
    }

    if (!completedId) {
      setErr("Complete the cone first to leave a review.");
      return;
    }

    if (myReviewRating != null) return;

    if (draftRating == null || draftRating < 1 || draftRating > 5) {
      setErr("Pick a rating from 1 to 5.");
      return;
    }

    const cleanedText = draftText.trim() ? draftText.trim().slice(0, 280) : null;

    setErr("");
    setReviewSaving(true);

    try {
      const reviewId = `${uid}_${cone.id}`;

      const publicPayload: PublicReviewDoc = {
        coneId: cone.id,
        coneName: cone.name,
        userId: uid,
        reviewRating: draftRating,
        reviewText: cleanedText,
        reviewCreatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, COL.coneReviews, reviewId), publicPayload);

      // Optional: local optimism (hook snapshot will confirm anyway)
      setReviewOpen(false);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to save review");
    } finally {
      setReviewSaving(false);
    }
  }

  // ---------------------------------
  // Loading / error states
  // ---------------------------------
  const headerTitle = cone?.name ?? "Cone";

  if (authLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Loading…" }} />
        <LoadingState fullScreen={false} label="Signing you in…" />
      </Screen>
    );
  }

  if (coneLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Loading…" }} />
        <LoadingState fullScreen={false} label="Loading cone…" />
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Cone" }} />
        <ErrorCard
          title="Couldn’t load cone"
          message={coneErr || "Cone missing."}
          action={{ label: "Back to list", onPress: goConesHome }}
        />
      </Screen>
    );
  }

  // ---------------------------------
  // Main UI
  // ---------------------------------
  const completed = !!completedId;
  const hasReview = myReviewRating != null;

  // One “top” error string for UI (if you want to show it in a banner later)
  const topErr = err || completionErr || locErr || reviewsErr || "";
  void topErr; // keeps TS happy if unused

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
        {/* HERO */}
        <ConeHero cone={cone} completed={completed} />

        <View style={{ height: 14 }} />

        {/* REVIEWS SUMMARY */}
        <ReviewsSummaryCard
          ratingCount={ratingCount}
          avgRating={avgRating}
          onViewAll={() => goConeReviews(cone.id, cone.name)}
        />

        <View style={{ height: 14 }} />

        {/* STATUS */}
        <StatusCard
          completed={completed}
          loc={loc}
          locStatus={locStatus}
          accuracyMeters={gate.accuracyMeters}
          inRange={gate.inRange}
          onRefreshGPS={onRefreshGPS}
          refreshingGPS={isRefreshing}
          maxAccuracyMeters={MAX_ACCURACY_METERS}
        />

        <View style={{ height: 14 }} />

        {/* ACTIONS */}
        <ActionsCard
          completed={completed}
          saving={saving}
          hasLoc={!!loc}
          onComplete={() => void completeCone()}
          hasReview={hasReview}
          myReviewRating={myReviewRating}
          myReviewText={myReviewText}
          onOpenReview={openReview}
          shareBonus={shareBonus}
          onShareBonus={() => void doShareBonus()}
        />
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        saving={reviewSaving}
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
