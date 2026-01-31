import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";

import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

import { nearestCheckpoint } from "../../../lib/checkpoints";
import { getBadgeState } from "@/lib/badges";

import { Layout, Text, Button } from "@ui-kitten/components";

import { Screen } from "@/components/screen";
import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";
import { ConesToReviewCard } from "@/components/progress/ConesToReviewCard";
import { BadgesSummaryCard } from "@/components/progress/BadgesSummaryCard";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";

// ✅ Shared padded card wrapper
import { CardShell } from "@/components/ui/CardShell";

type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: {
    id?: string;
    label?: string;
    lat: number;
    lng: number;
    radiusMeters: number;
  }[];
  description?: string;
  active: boolean;

  // optional metadata (safe if missing)
  type?: "cone" | "crater";
  region?: "north" | "central" | "south" | "harbour";
};

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [cones, setCones] = useState<Cone[]>([]);

  // live user state
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);
  const [completedAtByConeId, setCompletedAtByConeId] = useState<Record<string, number>>({});
  const [reviewedConeIds, setReviewedConeIds] = useState<Set<string>>(new Set());

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [locErr, setLocErr] = useState<string>("");

  // Load cones once + subscribe to user completions/reviews (live)
  useEffect(() => {
    let mounted = true;
    let unsubCompletions: (() => void) | null = null;
    let unsubReviews: (() => void) | null = null;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in.");

        // 1) cones list (static-ish)
        const conesQ = query(collection(db, "cones"), where("active", "==", true));
        const conesSnap = await getDocs(conesQ);

        const conesList: Cone[] = conesSnap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name,
            slug: data.slug,
            lat: data.lat,
            lng: data.lng,
            radiusMeters: data.radiusMeters,
            checkpoints: Array.isArray(data.checkpoints) ? data.checkpoints : undefined,
            description: data.description ?? "",
            active: !!data.active,
            type: data.type === "crater" ? "crater" : data.type === "cone" ? "cone" : undefined,
            region:
              data.region === "north" ||
              data.region === "central" ||
              data.region === "south" ||
              data.region === "harbour"
                ? data.region
                : undefined,
          };
        });

        if (!mounted) return;
        setCones(conesList);

        // 2) user completions (live)
        const compQ = query(collection(db, "coneCompletions"), where("userId", "==", user.uid));
        unsubCompletions = onSnapshot(
          compQ,
          (snap) => {
            const ids = new Set<string>();
            let bonus = 0;
            const byConeId: Record<string, number> = {};

            snap.docs.forEach((dd) => {
              const data = dd.data() as any;

              if (data?.coneId) ids.add(String(data.coneId));
              if (data?.shareBonus) bonus += 1;

              const ms =
                typeof data?.completedAt?.toMillis === "function"
                  ? data.completedAt.toMillis()
                  : typeof data?.completedAt === "number"
                    ? data.completedAt
                    : null;

              if (data?.coneId && ms != null) byConeId[String(data.coneId)] = ms;
            });

            setCompletedIds(ids);
            setShareBonusCount(bonus);
            setCompletedAtByConeId(byConeId);
          },
          (e) => {
            console.error(e);
            setErr(e?.message ?? "Failed to load completions");
          }
        );

        // 3) user reviews (live) — used only for “cones to review”
        const revQ = query(collection(db, "coneReviews"), where("userId", "==", user.uid));
        unsubReviews = onSnapshot(
          revQ,
          (snap) => {
            const ids = new Set<string>();
            snap.docs.forEach((dd) => {
              const data = dd.data() as any;
              if (data?.coneId) ids.add(String(data.coneId));
            });
            setReviewedConeIds(ids);
          },
          (e) => {
            console.error(e);
            setReviewedConeIds(new Set());
          }
        );
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load progress");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubCompletions) unsubCompletions();
      if (unsubReviews) unsubReviews();
    };
  }, []);

  // Location (for nearest unclimbed)
  useEffect(() => {
    (async () => {
      setLocErr("");
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocErr("Location permission denied.");
          return;
        }
        const cur = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLoc(cur);
      } catch (e: any) {
        setLocErr(e?.message ?? "Could not get location.");
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const total = cones.length;
    const completed = cones.reduce((acc, c) => acc + (completedIds.has(c.id) ? 1 : 0), 0);
    const percent = total === 0 ? 0 : completed / total;
    return { total, completed, percent };
  }, [cones, completedIds]);

  const nearestUnclimbed = useMemo(() => {
    const unclimbed = cones.filter((c) => !completedIds.has(c.id));
    if (unclimbed.length === 0) return null;

    if (!loc) return { cone: unclimbed[0], distance: null as number | null };

    const { latitude, longitude } = loc.coords;

    let best = unclimbed[0];
    let bestDist = nearestCheckpoint(best, latitude, longitude).distanceMeters;

    for (let i = 1; i < unclimbed.length; i++) {
      const c = unclimbed[i];
      const d = nearestCheckpoint(c, latitude, longitude).distanceMeters;
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }

    return { cone: best, distance: bestDist };
  }, [cones, completedIds, loc]);

  const conesToReview = useMemo(() => {
    return cones
      .filter((c) => completedIds.has(c.id) && !reviewedConeIds.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cones, completedIds, reviewedConeIds]);

  const badgeState = useMemo(() => {
    return getBadgeState({
      cones: cones.map((c) => ({
        id: c.id,
        type: c.type,
        region: c.region,
        active: c.active,
      })),
      completedConeIds: completedIds,
      shareBonusCount,
      completedAtByConeId,
    });
  }, [cones, completedIds, shareBonusCount, completedAtByConeId]);

  function goToCone(coneId: string) {
    router.push(`/(tabs)/cones/${coneId}`);
  }

  if (loading) {
    return (
      <Screen>
        <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text appearance="hint" style={{ marginTop: 10 }}>
            Loading progress…
          </Text>
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <Layout style={{ flex: 1, justifyContent: "center" }}>
          <CardShell status="danger">
            <Text category="h6" style={{ marginBottom: 6, fontWeight: "900" }}>
              Progress
            </Text>
            <Text status="danger">{err}</Text>

            <View style={{ height: 12 }} />
            <Button appearance="outline" onPress={() => router.replace("/(tabs)/progress")}>
              Retry
            </Button>
          </CardShell>
        </Layout>
      </Screen>
    );
  }

  const allDone = totals.total > 0 && totals
