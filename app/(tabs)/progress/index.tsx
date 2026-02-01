import { useEffect, useMemo, useState } from "react";
import { View, ScrollView } from "react-native";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

import { completionService } from "@/lib/services/completionService";
import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";

import { Layout, Text, Button } from "@ui-kitten/components";

import { Screen } from "@/components/screen";
import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";
import { ConesToReviewCard } from "@/components/progress/ConesToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";

import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { goBadges, goCone, goProgressHome } from "@/lib/routes";

export default function ProgressScreen() {
  const { cones, loading: conesLoading, err: conesErr } = useCones();

  // live user state
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);
  const [completedAtByConeId, setCompletedAtByConeId] = useState<Record<string, number>>({});
  const [reviewedConeIds, setReviewedConeIds] = useState<Set<string>>(new Set());

  const { loc, err: locErr } = useUserLocation();
  const { badgeState } = useBadgesData();

  const [err, setErr] = useState<string>("");

  // Subscribe to user completions/reviews (live)
  useEffect(() => {
    let mounted = true;

    let unsubCompletions: (() => void) | null = null;
    let unsubReviews: (() => void) | null = null;

    (async () => {
      setErr("");

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in.");

        // user completions (live via service)
        unsubCompletions = completionService.watchMyCompletions(
          user.uid,
          (state) => {
            if (!mounted) return;
            setCompletedIds(state.completedConeIds);
            setShareBonusCount(state.shareBonusCount);
            setCompletedAtByConeId(state.completedAtByConeId);
          },
          (e: any) => {
            console.error(e);
            if (!mounted) return;
            setErr(e?.message ?? "Failed to load completions");
          }
        );

        // user reviews (live) — used only for “cones to review”
        const revQ = query(collection(db, COL.coneReviews), where("userId", "==", user.uid));
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
      }
    })();

    return () => {
      mounted = false;
      if (unsubCompletions) unsubCompletions();
      if (unsubReviews) unsubReviews();
    };
  }, []);

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

  const loading = conesLoading;
  const fatalErr = conesErr || err;

  if (loading) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading progress…" />
        </Layout>
      </Screen>
    );
  }

  if (fatalErr) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
          <ErrorCard
            title="Progress"
            message={fatalErr}
            action={{ label: "Retry", onPress: goProgressHome, appearance: "filled" }}
          />
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Layout style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            gap: 12,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text category="h4" style={{ fontWeight: "900" }}>
                Progress
              </Text>
              <Text appearance="hint" style={{ marginTop: 4 }}>
                {totals.completed} / {totals.total} completed
              </Text>
            </View>

            <Button size="small" appearance="outline" onPress={goBadges}>
              Badges
            </Button>
          </View>

          {/* Completion ring */}
          <CardShell>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <PieChart percent={totals.percent} />

              <View style={{ flex: 1, gap: 10 }}>
                <StatRow label="Completed" value={`${totals.completed}`} />
                <StatRow label="Remaining" value={`${Math.max(0, totals.total - totals.completed)}`} />
                <StatRow label="Share bonuses" value={`${shareBonusCount}`} />
              </View>
            </View>

            {allDone ? (
              <View style={{ marginTop: 12 }}>
                <Text category="s1" style={{ fontWeight: "900" }}>
                  You’ve completed everything ✅
                </Text>
              </View>
            ) : null}
          </CardShell>

          {/* Nearest unclimbed */}
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

          {/* Cones to review */}
          <ConesToReviewCard
            cones={conesToReview.map((c) => ({ id: c.id, name: c.name, description: c.description }))}
            onOpenCone={openCone}
          />

          {/* Badges summary */}
          <BadgesSummaryCard
            nextUp={badgeState.nextUp}
            recentlyUnlocked={badgeState.recentlyUnlocked}
            onViewAll={goBadges}
          />
        </ScrollView>
      </Layout>
    </Screen>
  );
}
