import { useEffect, useMemo, useState, useCallback } from "react";
import { Text, ActivityIndicator, Share, View, Modal, TextInput, Pressable, ScrollView } from "react-native";
import * as Location from "expo-location";
import { Stack, useLocalSearchParams, router, useFocusEffect } from "expo-router";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../../../lib/firebase";
import { Screen } from "@/components/screen";

import { ConeInfoCard } from "@/components/cone/ConeInfoCard";
import { ConeStatusCard } from "@/components/cone/ConeStatusCard";
import { ConeCompletionCard } from "@/components/cone/ConeCompletionCard";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

import { nearestCheckpoint } from "../../../../lib/checkpoints";
import type { Cone, ConeCompletionWrite } from "@/lib/models";

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

  const [cone, setCone] = useState<Cone | null>(null);
  const [coneLoading, setConeLoading] = useState(true);
  const [coneErr, setConeErr] = useState<string>("");

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [err, setErr] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [shareBonus, setShareBonus] = useState(false);

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      setConeLoading(true);
      setConeErr("");
      setCone(null);

      try {
        if (!coneId) throw new Error("Missing coneId.");

        const ref = doc(db, "cones", String(coneId));
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Cone not found.");

        const data = snap.data() as any;

        const c: Cone = {
          id: snap.id,
          name: data.name,
          slug: data.slug,
          lat: data.lat,
          lng: data.lng,
          radiusMeters: data.radiusMeters,
          checkpoints: Array.isArray(data.checkpoints) ? data.checkpoints : undefined,
          description: data.description ?? "",
          active: !!data.active,
        };

        if (mounted) setCone(c);
      } catch (e: any) {
        if (mounted) setConeErr(e?.message ?? "Failed to load cone.");
      } finally {
        if (mounted) setConeLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [coneId]);

  // Location (one-time per cone load)
  useEffect(() => {
    if (!cone) return;

    (async () => {
      setErr("");
      setLoc(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErr("Location permission denied.");
        return;
      }

      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLoc(cur);
    })();
  }, [cone?.id]);

  // Load completion doc (deterministic)
  useEffect(() => {
    if (!cone) return;

    (async () => {
      const user = auth.currentUser;
      if (!user) return;

      const completionId = `${user.uid}_${cone.id}`;
      const snap = await getDoc(doc(db, "coneCompletions", completionId));

      if (snap.exists()) {
        const data = snap.data() as any;
        setCompletedId(snap.id);
        setShareBonus(!!data.shareBonus);
      } else {
        setCompletedId(null);
        setShareBonus(false);
      }
    })();
  }, [cone?.id]);

  // ✅ My review + public aggregate from coneReviews (live)
  useEffect(() => {
    if (!cone) return;

    const user = auth.currentUser;
    const myId = user ? `${user.uid}_${cone.id}` : null;

    // Public aggregate: all reviews for this cone
    const reviewsQ = query(collection(db, "coneReviews"), where("coneId", "==", cone.id));

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

  const stats = useMemo(() => {
    if (!loc || !cone) {
      return {
        distance: null as number | null,
        accuracy: null as number | null,
        inRange: false,
        checkpointLabel: null as string | null,
      };
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const nearest = nearestCheckpoint(cone, latitude, longitude);

    const acc = accuracy ?? null;
    const inRange = nearest.distanceMeters <= nearest.checkpoint.radiusMeters && (acc == null || acc <= 50);

    return {
      distance: nearest.distanceMeters,
      accuracy: acc,
      inRange,
      checkpointLabel: nearest.checkpoint.label ?? null,
    };
  }, [loc, cone]);

  const refreshLocation = useCallback(async () => {
    setErr("");
    try {
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLoc(cur);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to refresh location.");
    }
  }, []);

  // ✅ Auto-refresh GPS on focus (but skip if cone already completed)
  useFocusEffect(
    useCallback(() => {
      if (!completedId) {
        void refreshLocation();
      }
      return () => {};
    }, [completedId, refreshLocation])
  );

  async function completeCone() {
    if (!cone) return;
    if (completedId) return;

    setErr("");
    const user = auth.currentUser;
    if (!user) {
      setErr("Not signed in.");
      return;
    }
    if (!loc) {
      setErr("Location not available yet. Try refresh.");
      return;
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const nearest = nearestCheckpoint(cone, latitude, longitude);

    if (nearest.distanceMeters > nearest.checkpoint.radiusMeters) {
      setErr(`Not in range yet. You are ~${Math.round(nearest.distanceMeters)}m away.`);
      return;
    }
    if (accuracy != null && accuracy > 50) {
      setErr(`GPS accuracy too low (${Math.round(accuracy)}m). Try refresh in a clearer spot.`);
      return;
    }

    const cp = nearest.checkpoint;

    setSaving(true);
    try {
      const completionId = `${user.uid}_${cone.id}`;

      const payload: ConeCompletionWrite = {
        coneId: cone.id,
        coneSlug: cone.slug,
        coneName: cone.name,
        userId: user.uid,
        completedAt: serverTimestamp(),
        deviceLat: latitude,
        deviceLng: longitude,
        accuracyMeters: accuracy ?? null,

        // Back-compat field used around the app
        distanceMeters: nearest.distanceMeters,

        // checkpoint details
        checkpointId: cp?.id ?? null,
        checkpointLabel: cp?.label ?? null,
        checkpointLat: cp?.lat ?? null,
        checkpointLng: cp?.lng ?? null,
        checkpointRadiusMeters: cp?.radiusMeters ?? null,
        checkpointDistanceMeters: nearest.distanceMeters,

        shareBonus: false,
        shareConfirmed: false,
        sharedAt: null,
        sharedPlatform: null,
      };

      await setDoc(doc(db, "coneCompletions", completionId), payload);

      setCompletedId(completionId);
      setShareBonus(false);
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

      await updateDoc(doc(db, "coneCompletions", completionId), {
        shareBonus: true,
        shareConfirmed: true,
        sharedAt: serverTimestamp(),
        sharedPlatform: "unknown",
      });

      setShareBonus(true);
    } catch {
      // user cancelling share is normal — do nothing
    }
  }

  function openReview() {
    if (!completedId) return;
    if (myReviewRating != null) return; // one-time only
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

    if (myReviewRating != null) return; // one-time only

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

      await setDoc(doc(db, "coneReviews", reviewId), publicPayload);

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

  const headerTitle = cone?.name ?? "Cone";

  if (coneLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Loading…" }} />
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading cone…</Text>
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Cone" }} />
        <Card>
          <CardHeader>
            <CardTitle>Couldn’t load cone</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            <Text className="text-destructive">{coneErr || "Cone missing."}</Text>
          </CardContent>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ConeInfoCard
          name={cone.name}
          description={cone.description}
          slug={cone.slug}
          radiusMeters={cone.radiusMeters}
        />

        {/* Public rating summary */}
        <Card className="mt-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle>Reviews</CardTitle>

              {ratingCount > 0 ? (
                <Button
                  variant="outline"
                  onPress={() =>
                    router.push(
                      `/(tabs)/cones/${cone.id}/reviews?coneName=${encodeURIComponent(cone.name)}`
                    )
                  }
                >
                  <Text className="font-semibold">View all</Text>
                </Button>
              ) : null}
            </View>
          </CardHeader>
          <CardContent className="gap-2">
            {ratingCount === 0 ? (
              <Text className="text-sm text-muted-foreground">No reviews yet.</Text>
            ) : (
              <Text className="text-sm text-muted-foreground">
                ⭐ {avgRating?.toFixed(1)} / 5 ({ratingCount} review{ratingCount === 1 ? "" : "s"})
              </Text>
            )}

            <Text className="text-xs text-muted-foreground">
              Reviews are public. You can leave one review per cone after completing it.
            </Text>
          </CardContent>
        </Card>

        <ConeStatusCard
          loadingLocation={!loc}
          distanceMeters={stats.distance}
          accuracyMeters={stats.accuracy}
          inRange={stats.inRange}
          checkpointLabel={stats.checkpointLabel ?? undefined}
          onRefreshGps={() => {
            void refreshLocation();
          }}
          errorText={err}
          showDistance={true}
        />

        <ConeCompletionCard
          completed={!!completedId}
          saving={saving}
          canComplete={!!loc}
          onComplete={completeCone}
          shareBonus={shareBonus}
          onShareBonus={doShareBonus}
          myReviewRating={myReviewRating}
          myReviewText={myReviewText}
          onLeaveReview={openReview}
        />
      </ScrollView>

      <Modal visible={reviewOpen} transparent animationType="fade" onRequestClose={() => setReviewOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Leave a review</CardTitle>
            </CardHeader>

            <CardContent className="gap-4">
              <Text className="text-sm text-muted-foreground">
                One-time only. Choose a rating and (optionally) add a short note.
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = draftRating === n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => setDraftRating(n)}
                      className={[
                        "rounded-full border px-3 py-2",
                        selected ? "border-primary/30 bg-primary/10" : "border-border bg-background",
                      ].join(" ")}
                    >
                      <Text className={selected ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {"⭐".repeat(n)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="rounded-xl border border-border bg-background px-3 py-2">
                <TextInput
                  value={draftText}
                  onChangeText={setDraftText}
                  placeholder="Optional note (e.g. great views, muddy track)…"
                  placeholderTextColor="rgba(100,116,139,0.9)"
                  multiline
                  className="text-foreground"
                  style={{ minHeight: 80 }}
                  maxLength={280}
                />
                <Text className="mt-2 text-xs text-muted-foreground">{draftText.length} / 280</Text>
              </View>

              <View className="flex-row gap-2">
                <Button variant="outline" onPress={() => setReviewOpen(false)} disabled={reviewSaving}>
                  <Text className="font-semibold">Cancel</Text>
                </Button>

                <Button onPress={() => void saveReview()} disabled={reviewSaving || draftRating == null}>
                  <Text className="text-primary-foreground font-semibold">
                    {reviewSaving ? "Saving…" : "Save review"}
                  </Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
