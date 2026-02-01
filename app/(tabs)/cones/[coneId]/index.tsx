import { useCallback, useEffect, useState } from "react";
import { View, ScrollView, Modal, TextInput, Pressable, Share } from "react-native";
import { Stack, useLocalSearchParams, useFocusEffect } from "expo-router";

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

import { Screen } from "@/components/screen";
import type { ConeCompletionWrite } from "@/lib/models";
import { formatMeters } from "@/lib/formatters";
import { goConesHome, goConeReviews } from "@/lib/routes";

import { Text, Button, Divider, Layout } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCone } from "@/lib/hooks/useCone";
import { useConeCompletion } from "@/lib/hooks/useConeCompletion";
import { useGPSGate } from "@/lib/hooks/useGPSGate";

type PublicReviewDoc = {
  coneId: string;
  coneName: string;
  userId: string;
  reviewRating: number; // 1..5
  reviewText: string | null;
  reviewCreatedAt: any;
};

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();

  // 4A
  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);

  // Shared location flow
  const {
    loc,
    status: locStatus,
    err: locErr,
    refresh: refreshLocation,
    request: requestLocation,
  } = useUserLocation();

  // 4B
  const {
    completedId,
    shareBonus,
    loading: completionLoading,
    err: completionErr,
    setShareBonusLocal,
  } = useConeCompletion(coneId);

  // 4C
  const gate = useGPSGate(cone, loc, { maxAccuracyMeters: 50 });

  const [err, setErr] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // My review (read-only after submit) — sourced from coneReviews
  const [myReviewRating, setMyReviewRating] = useState<number | null>(null);
  const [myReviewText, setMyReviewText] = useState<string | null>(null);

  // Review modal draft
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftRating, setDraftRating] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  // Public aggregate (client-side)
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  // ---------------------------------
  // Reviews (live): my review + aggregate
  // ---------------------------------
  useEffect(() => {
    if (!cone) return;

    const user = auth.currentUser;
    const myId = user ? `${user.uid}_${cone.id}` : null;

    const reviewsQ = query(collection(db, COL.coneReviews), where("coneId", "==", cone.id));

    const unsub = onSnapshot(
      reviewsQ,
      (snap) => {
        let sum = 0;
        let count = 0;

        let mineRating: number | null = null;
        let mineText: string | null = null;

        snap.docs.forEach((d) => {
          const data = d.data() as any;

          const r = typeof data?.reviewRating === "number" ? data.reviewRating : null;
          if (r != null && r >= 1 && r <= 5) {
            sum += r;
            count += 1;
          }

          if (myId && d.id === myId) {
            mineRating = typeof data?.reviewRating === "number" ? data.reviewRating : null;
            mineText = typeof data?.reviewText === "string" ? data.reviewText : null;
          }
        });

        setRatingCount(count);
        setAvgRating(count > 0 ? sum / count : null);

        setMyReviewRating(mineRating);
        setMyReviewText(mineText);
      },
      (e) => {
        console.error(e);
        setAvgRating(null);
        setRatingCount(0);
      }
    );

    return () => unsub();
  }, [cone?.id]);

  // ---------------------------------
  // Auto-refresh GPS on focus (skip if completed)
  // ---------------------------------
  useFocusEffect(
    useCallback(() => {
      if (!completedId) void refreshLocation();
      return () => {};
    }, [completedId, refreshLocation])
  );

  // ---------------------------------
  // Actions
  // ---------------------------------
  async function completeCone() {
    if (!cone) return;
    if (completedId) return;

    setErr("");

    const user = auth.currentUser;
    if (!user) {
      setErr("Not signed in.");
      return;
    }

    if (locStatus === "denied") {
      setErr("Location permission denied. Please enable it in Settings.");
      return;
    }

    if (!loc) {
      try {
        await requestLocation?.();
      } catch {}
      setErr("Location not available yet. Try refresh.");
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
      if (gate.accuracyMeters != null && gate.accuracyMeters > 50) {
        setErr(
          `GPS accuracy too low (${Math.round(gate.accuracyMeters)}m). Try refresh in a clearer spot.`
        );
        return;
      }
      setErr("Not in range yet.");
      return;
    }

    setSaving(true);
    try {
      const completionId = `${user.uid}_${cone.id}`;

      const payload: ConeCompletionWrite = {
        coneId: cone.id,
        coneSlug: cone.slug,
        coneName: cone.name,
        userId: user.uid,
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

    const user = auth.currentUser;
    if (!user) return;

    try {
      const text = `I just completed ${cone.name} 🌋 #AucklandCones #cones`;
      await Share.share({ message: text });

      const completionId = `${user.uid}_${cone.id}`;

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

    const user = auth.currentUser;
    if (!user) {
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

    setErr("");
    setReviewSaving(true);

    try {
      const reviewId = `${user.uid}_${cone.id}`;

      const publicPayload: PublicReviewDoc = {
        coneId: cone.id,
        coneName: cone.name,
        userId: user.uid,
        reviewRating: draftRating,
        reviewText: draftText.trim() ? draftText.trim() : null,
        reviewCreatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, COL.coneReviews, reviewId), publicPayload);

      setMyReviewRating(draftRating);
      setMyReviewText(draftText.trim() ? draftText.trim() : null);

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
  const stars = "⭐".repeat(Math.max(0, Math.min(5, Math.round(myReviewRating ?? 0))));

  // One “top” error string for UI
  const topErr = err || completionErr || locErr || "";

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={{ gap: 10 }}>
          <Text category="h4" style={{ fontWeight: "900" }}>
            {cone.name}
          </Text>

          <Text appearance="hint">
            {cone.description?.trim() ? cone.description.trim() : "No description yet."}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Pill>Radius {cone.radiusMeters}m</Pill>
            {cone.slug ? <Pill>{cone.slug}</Pill> : null}
            <Pill status={completed ? "success" : "danger"}>
              {completed ? "Completed" : "Not completed"}
            </Pill>
          </View>
        </View>

        <View style={{ height: 14 }} />

        {/* REVIEWS SUMMARY */}
        <CardShell>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text category="h6" style={{ fontWeight: "900" }}>
              Reviews
            </Text>

            {ratingCount > 0 ? (
              <Button size="small" appearance="outline" onPress={() => goConeReviews(cone.id, cone.name)}>
                View all
              </Button>
            ) : (
              <View />
            )}
          </View>

          <View style={{ height: 10 }} />

          {ratingCount === 0 ? (
            <Text appearance="hint">No reviews yet.</Text>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pill status="info">⭐ {avgRating?.toFixed(1)} / 5</Pill>
              <Text appearance="hint">
                ({ratingCount} review{ratingCount === 1 ? "" : "s"})
              </Text>
            </View>
          )}

          <View style={{ height: 10 }} />
          <Text appearance="hint" style={{ fontSize: 12 }}>
            Reviews are public. You can leave one review per cone after completing it.
          </Text>
        </CardShell>

        <View style={{ height: 14 }} />

        {/* STATUS */}
        <CardShell>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Status
          </Text>

          <View style={{ height: 12 }} />

          {!loc ? (
            <LoadingState
              fullScreen={false}
              size="small"
              label={locStatus === "denied" ? "Location permission denied" : "Getting your GPS…"}
              style={{ paddingVertical: 6 }}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {gate.checkpointLabel ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text appearance="hint">Checkpoint</Text>
                  <Text style={{ fontWeight: "800" }}>{gate.checkpointLabel}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text appearance="hint">Distance</Text>
                <Text style={{ fontWeight: "800" }}>{formatMeters(gate.distanceMeters)}</Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text appearance="hint">Accuracy</Text>
                <Text style={{ fontWeight: "800" }}>
                  {gate.accuracyMeters == null ? "—" : `${Math.round(gate.accuracyMeters)} m`}
                </Text>
              </View>

              <Divider />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text appearance="hint">Range check</Text>
                <Pill status={gate.inRange ? "success" : "danger"}>
                  {gate.inRange ? "✅ In range" : "❌ Not in range"}
                </Pill>
              </View>

              <Button appearance="outline" onPress={() => void refreshLocation()}>
                Refresh GPS
              </Button>
            </View>
          )}

          {topErr ? (
            <View style={{ marginTop: 12 }}>
              <Pill status="danger">{topErr}</Pill>
            </View>
          ) : null}
        </CardShell>

        <View style={{ height: 14 }} />

        {/* ACTIONS */}
        {!completed ? (
          <Button
            size="giant"
            onPress={() => void completeCone()}
            disabled={saving || completionLoading || !loc}
            style={{ borderRadius: 14 }}
          >
            {saving ? "Saving…" : completionLoading ? "Loading…" : "Complete cone"}
          </Button>
        ) : (
          <CardShell>
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text category="h6" style={{ fontWeight: "900" }}>
                  Completed
                </Text>
                <Pill status="success">✅</Pill>
              </View>

              {/* Review */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: "800" }}>Your review</Text>

                {!hasReview ? (
                  <View style={{ gap: 10 }}>
                    <Text appearance="hint">Leave a quick rating (once only) after you’ve done the cone.</Text>
                    <Button appearance="outline" onPress={openReview}>
                      Leave a review
                    </Button>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontWeight: "900" }}>
                        {stars}{" "}
                        <Text appearance="hint" style={{ fontWeight: "700" }}>
                          ({myReviewRating}/5)
                        </Text>
                      </Text>
                    </View>

                    <Text appearance="hint">{myReviewText?.trim() ? myReviewText.trim() : "No comment."}</Text>
                  </View>
                )}
              </View>

              {/* Share bonus */}
              <View style={{ gap: 8 }}>
                <Text appearance="hint">Optional: share a pic on socials for bonus credit.</Text>

                <Button
                  appearance={shareBonus ? "filled" : "outline"}
                  status={shareBonus ? "success" : "basic"}
                  onPress={() => void doShareBonus()}
                  disabled={shareBonus}
                >
                  {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
                </Button>
              </View>
            </View>
          </CardShell>
        )}
      </ScrollView>

      {/* REVIEW MODAL */}
      <Modal visible={reviewOpen} transparent animationType="fade" onRequestClose={() => setReviewOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <Layout style={{ borderRadius: 18, padding: 16 }}>
            <Text category="h6" style={{ fontWeight: "900" }}>
              Leave a review
            </Text>

            <View style={{ height: 8 }} />
            <Text appearance="hint">One-time only. Choose a rating and (optionally) add a short note.</Text>

            <View style={{ height: 14 }} />

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = draftRating === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setDraftRating(n)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: selected ? "rgba(95,179,162,0.55)" : "rgba(100,116,139,0.25)",
                      backgroundColor: selected ? "rgba(95,179,162,0.16)" : "transparent",
                    }}
                  >
                    <Text style={{ fontWeight: "900" }}>{"⭐".repeat(n)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: 14 }} />

            <View
              style={{
                borderWidth: 1,
                borderColor: "rgba(100,116,139,0.25)",
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={draftText}
                onChangeText={setDraftText}
                placeholder="Optional note (e.g. great views, muddy track)…"
                placeholderTextColor="rgba(100,116,139,0.9)"
                multiline
                style={{ minHeight: 84, color: "#0f172a" }}
                maxLength={280}
              />
              <Text appearance="hint" style={{ fontSize: 12 }}>
                {draftText.length} / 280
              </Text>
            </View>

            <View style={{ height: 14 }} />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                appearance="outline"
                style={{ flex: 1 }}
                disabled={reviewSaving}
                onPress={() => setReviewOpen(false)}
              >
                Cancel
              </Button>

              <Button
                style={{ flex: 1 }}
                disabled={reviewSaving || draftRating == null}
                onPress={() => void saveReview()}
              >
                {reviewSaving ? "Saving…" : "Save review"}
              </Button>
            </View>
          </Layout>
        </View>
      </Modal>
    </Screen>
  );
}
