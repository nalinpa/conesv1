import { useEffect, useMemo, useState, useCallback } from "react";
import { View, ScrollView, Modal, TextInput, Pressable, Share } from "react-native";
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
import { nearestCheckpoint } from "../../../../lib/checkpoints";
import type { Cone, ConeCompletionWrite } from "@/lib/models";

// UI Kitten
import { Layout, Card, Text, Button, Spinner, Divider } from "@ui-kitten/components";

type PublicReviewDoc = {
  coneId: string;
  coneName: string;
  userId: string;
  reviewRating: number; // 1..5
  reviewText: string | null;
  reviewCreatedAt: any;
};

function surfGreen(active: boolean) {
  return active ? "#2a9d8f" : "#64748b";
}

function formatMeters(m: number | null) {
  if (m == null) return "—";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

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

  // -----------------------------
  // Load cone
  // -----------------------------
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

  // -----------------------------
  // Location (one-time per cone load)
  // -----------------------------
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

  // -----------------------------
  // Load completion doc (deterministic)
  // -----------------------------
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

  // -----------------------------
  // ✅ My review + public aggregate from coneReviews (live)
  // -----------------------------
  useEffect(() => {
    if (!cone) return;

    const user = auth.currentUser;
    const myId = user ? `${user.uid}_${cone.id}` : null;

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

  // -----------------------------
  // Derived status (nearest checkpoint)
  // -----------------------------
  const stats = useMemo(() => {
    if (!loc || !cone) {
      return {
        distance: null as number | null,
        accuracy: null as number | null,
        inRange: false,
        checkpointLabel: null as string | null,
        checkpointRadius: null as number | null,
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
      checkpointRadius: nearest.checkpoint.radiusMeters ?? null,
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
      if (!completedId) void refreshLocation();
      return () => {};
    }, [completedId, refreshLocation])
  );

  // -----------------------------
  // Actions
  // -----------------------------
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

        distanceMeters: nearest.distanceMeters,

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

  // -----------------------------
  // Loading / error states
  // -----------------------------
  if (coneLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Loading…" }} />
        <Layout style={{ gap: 12 }}>
          <Spinner />
          <Text appearance="hint">Loading cone…</Text>
        </Layout>
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Cone" }} />
        <Card>
          <Text category="h6" style={{ marginBottom: 8 }}>
            Couldn’t load cone
          </Text>
          <Text status="danger">{coneErr || "Cone missing."}</Text>

          <View style={{ height: 12 }} />
          <Button appearance="outline" onPress={() => router.replace("/(tabs)/cones")}>
            Back to list
          </Button>
        </Card>
      </Screen>
    );
  }

  // -----------------------------
  // Main UI
  // -----------------------------
  const completed = !!completedId;
  const hasReview = myReviewRating != null;
  const stars = "⭐".repeat(Math.max(0, Math.min(5, Math.round(myReviewRating ?? 0))));

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <Layout style={{ gap: 10 }}>
          <Text category="h4">{cone.name}</Text>
          <Text appearance="hint">
            {cone.description?.trim() ? cone.description.trim() : "No description yet."}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(100,116,139,0.25)",
              }}
            >
              <Text style={{ fontWeight: "700", color: surfGreen(true) }}>
                Radius {cone.radiusMeters}m
              </Text>
            </View>

            {cone.slug ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(100,116,139,0.25)",
                }}
              >
                <Text appearance="hint" style={{ fontWeight: "700" }}>
                  {cone.slug}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: completed ? "rgba(42,157,143,0.35)" : "rgba(239,68,68,0.25)",
                backgroundColor: completed ? "rgba(42,157,143,0.10)" : "rgba(239,68,68,0.08)",
              }}
            >
              <Text style={{ fontWeight: "800", color: completed ? surfGreen(true) : "#ef4444" }}>
                {completed ? "Completed" : "Not completed"}
              </Text>
            </View>
          </View>
        </Layout>

        <View style={{ height: 14 }} />

        {/* REVIEWS SUMMARY */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text category="h6">Reviews</Text>

            {ratingCount > 0 ? (
              <Button
                size="small"
                appearance="outline"
                onPress={() =>
                  router.push(`/(tabs)/cones/${cone.id}/reviews?coneName=${encodeURIComponent(cone.name)}`)
                }
              >
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
            <Text appearance="hint">
              ⭐ {avgRating?.toFixed(1)} / 5 ({ratingCount} review{ratingCount === 1 ? "" : "s"})
            </Text>
          )}

          <View style={{ height: 8 }} />
          <Text appearance="hint" style={{ fontSize: 12 }}>
            Reviews are public. You can leave one review per cone after completing it.
          </Text>
        </Card>

        <View style={{ height: 14 }} />

        {/* STATUS */}
        <Card>
          <Text category="h6">Status</Text>
          <View style={{ height: 10 }} />

          {!loc ? (
            <View style={{ alignItems: "center", paddingVertical: 10, gap: 10 }}>
              <Spinner />
              <Text appearance="hint">Getting your GPS…</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {stats.checkpointLabel ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text appearance="hint">Checkpoint</Text>
                  <Text style={{ fontWeight: "800" }}>{stats.checkpointLabel}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text appearance="hint">Distance</Text>
                <Text style={{ fontWeight: "800" }}>{formatMeters(stats.distance)}</Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text appearance="hint">Accuracy</Text>
                <Text style={{ fontWeight: "800" }}>
                  {stats.accuracy == null ? "—" : `${Math.round(stats.accuracy)} m`}
                </Text>
              </View>

              <Divider />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text appearance="hint">Range check</Text>
                <Text style={{ fontWeight: "900", color: stats.inRange ? surfGreen(true) : "#ef4444" }}>
                  {stats.inRange ? "✅ In range" : "❌ Not in range"}
                </Text>
              </View>

              <Button appearance="outline" onPress={() => void refreshLocation()}>
                Refresh GPS
              </Button>
            </View>
          )}

          {err ? (
            <View style={{ marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.10)" }}>
              <Text status="danger">{err}</Text>
            </View>
          ) : null}
        </Card>

        <View style={{ height: 14 }} />

        {/* ACTIONS */}
        {!completed ? (
          <Button
            size="giant"
            onPress={() => void completeCone()}
            disabled={saving || !loc}
            style={{ borderRadius: 14 }}
          >
            {saving ? "Saving…" : "Complete cone"}
          </Button>
        ) : (
          <Card>
            <Text category="h6">Completed ✅</Text>

            <View style={{ height: 12 }} />
            <Text style={{ fontWeight: "800" }}>Your review</Text>
            <View style={{ height: 8 }} />

            {!hasReview ? (
              <View style={{ gap: 10 }}>
                <Text appearance="hint">Leave a quick rating (once only) after you’ve done the cone.</Text>
                <Button appearance="outline" onPress={openReview}>
                  Leave a review
                </Button>
              </View>
            ) : (
              <View
                style={{
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(100,116,139,0.25)",
                }}
              >
                <Text style={{ fontWeight: "900" }}>
                  {stars}{" "}
                  <Text appearance="hint" style={{ fontWeight: "700" }}>
                    ({myReviewRating}/5)
                  </Text>
                </Text>

                <View style={{ height: 6 }} />
                <Text appearance="hint">
                  {myReviewText?.trim() ? myReviewText.trim() : "No comment."}
                </Text>
              </View>
            )}

            <View style={{ height: 16 }} />
            <Text appearance="hint">Optional: share a pic on socials for bonus credit.</Text>
            <View style={{ height: 10 }} />

            <Button
              appearance={shareBonus ? "filled" : "outline"}
              status={shareBonus ? "success" : "basic"}
              onPress={() => void doShareBonus()}
              disabled={shareBonus}
            >
              {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
            </Button>
          </Card>
        )}
      </ScrollView>

      {/* REVIEW MODAL */}
      <Modal visible={reviewOpen} transparent animationType="fade" onRequestClose={() => setReviewOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 18 }}>
          <Layout style={{ borderRadius: 18, padding: 16 }}>
            <Text category="h6">Leave a review</Text>
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
                      borderColor: selected ? "rgba(42,157,143,0.45)" : "rgba(100,116,139,0.25)",
                      backgroundColor: selected ? "rgba(42,157,143,0.12)" : "transparent",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: selected ? surfGreen(true) : "#64748b" }}>
                      {"⭐".repeat(n)}
                    </Text>
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
