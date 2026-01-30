import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { Layout, Card, Text, Button } from "@ui-kitten/components";

import { auth, db } from "@/lib/firebase";
import { Screen } from "@/components/screen";
import { getBadgeState } from "@/lib/badges";

type Cone = {
  id: string;
  active: boolean;
  type?: "cone" | "crater";
  region?: "north" | "central" | "south" | "harbour";
};

function BadgeTile({
  name,
  unlockText,
  unlocked,
  progressLabel,
}: {
  name: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel?: string | null;
}) {
  return (
    <View style={{ width: "50%", padding: 6 }}>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 18,
          padding: 12,
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        <Text category="s1" style={{ fontWeight: "800" }}>
          {name}
        </Text>

        <Text appearance="hint" style={{ marginTop: 6 }}>
          {unlockText}
        </Text>

        <View style={{ marginTop: 10 }}>
          {unlocked ? (
            <Text category="c1" style={{ fontWeight: "800" }}>
              Unlocked ✓
            </Text>
          ) : progressLabel ? (
            <Text appearance="hint" category="c1">
              {progressLabel}
            </Text>
          ) : (
            <Text appearance="hint" category="c1">
              Locked
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function getProgressLabelForBadge(
  progressByBadgeId: unknown,
  badgeId: string
): string | null {
  if (!progressByBadgeId) return null;

  // Case 1: Record<string, string | {progressLabel:string} | {label:string}>
  if (typeof progressByBadgeId === "object" && !Array.isArray(progressByBadgeId)) {
    const rec = progressByBadgeId as Record<string, any>;
    const v = rec[badgeId];
    if (typeof v === "string") return v;
    if (v && typeof v === "object") {
      if (typeof v.progressLabel === "string") return v.progressLabel;
      if (typeof v.label === "string") return v.label;
    }
    return null;
  }

  // Case 2: Array<{ badgeId, progressLabel }>
  if (Array.isArray(progressByBadgeId)) {
    const found = (progressByBadgeId as any[]).find((p) => String(p?.badgeId) === String(badgeId));
    if (!found) return null;
    if (typeof found.progressLabel === "string") return found.progressLabel;
    if (typeof found.label === "string") return found.label;
    return null;
  }

  return null;
}

export default function BadgesScreen() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);
  const [completedAtByConeId, setCompletedAtByConeId] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    let unsubCompletions: (() => void) | null = null;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in.");

        // cones
        const conesQ = query(collection(db, "cones"), where("active", "==", true));
        const conesSnap = await getDocs(conesQ);

        const conesList: Cone[] = conesSnap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
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

        // completions (live)
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
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load badges");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsubCompletions) unsubCompletions();
    };
  }, []);

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

  const totals = useMemo(() => {
    const unlocked = Array.isArray((badgeState as any)?.unlocked) ? (badgeState as any).unlocked.length : 0;
    const total = Array.isArray((badgeState as any)?.allBadges) ? (badgeState as any).allBadges.length : 0;
    return { unlocked, total };
  }, [badgeState]);

  const items = useMemo(() => {
    const state: any = badgeState as any;

    const all: any[] = Array.isArray(state?.allBadges) ? state.allBadges : [];
    const unlockedArr: any[] = Array.isArray(state?.unlocked) ? state.unlocked : [];
    const unlockedIds = new Set(unlockedArr.map((u) => String(u?.badge?.id ?? u?.id ?? "")));

    return all.map((b) => {
      const id = String(b?.id ?? "");
      const progressLabel = getProgressLabelForBadge(state?.progressByBadgeId, id);

      return {
        id,
        name: String(b?.name ?? "Badge"),
        unlockText: String(b?.unlockText ?? ""),
        unlocked: unlockedIds.has(id),
        progressLabel,
      };
    });
  }, [badgeState]);

  if (loading) {
    return (
      <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text appearance="hint" style={{ marginTop: 10 }}>
          Loading badges…
        </Text>
      </Layout>
    );
  }

  if (err) {
    return (
      <Screen>
        <Layout style={{ flex: 1, padding: 16, justifyContent: "center" }}>
          <Card status="danger" style={{ padding: 16 }}>
            <Text category="h6" style={{ marginBottom: 6 }}>
              Badges
            </Text>
            <Text status="danger">{err}</Text>
            <Button style={{ marginTop: 12 }} onPress={() => router.replace("/(tabs)/progress/badges")}>
              Retry
            </Button>
          </Card>
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen>
      <Layout style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text category="h1">Badges</Text>
              <Text appearance="hint" style={{ marginTop: 4 }}>
                {totals.unlocked} / {totals.total} unlocked
              </Text>
            </View>

            <Button size="small" appearance="outline" onPress={() => router.back()}>
              Done
            </Button>
          </View>

          {/* Next up */}
          <Card style={{ padding: 16, marginTop: 14 }}>
            <Text category="h6">Next up</Text>

            {!((badgeState as any)?.nextUp) ? (
              <Text appearance="hint" style={{ marginTop: 8 }}>
                Nothing queued — you might already have everything that’s configured.
              </Text>
            ) : (
              <View
                style={{
                  marginTop: 12,
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              >
                <Text category="s1" style={{ fontWeight: "800" }}>
                  {(badgeState as any).nextUp.badge.name}
                </Text>
                <Text appearance="hint" style={{ marginTop: 6 }}>
                  {(badgeState as any).nextUp.badge.unlockText}
                </Text>
                {(badgeState as any).nextUp.progressLabel ? (
                  <Text appearance="hint" style={{ marginTop: 10 }}>
                    {(badgeState as any).nextUp.progressLabel}
                  </Text>
                ) : null}
              </View>
            )}
          </Card>

          {/* Grid */}
          <Card style={{ padding: 12, marginTop: 14 }}>
            <Text category="h6" style={{ marginBottom: 10 }}>
              All badges
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {items.map((b) => (
                <BadgeTile
                  key={b.id}
                  name={b.name}
                  unlockText={b.unlockText}
                  unlocked={b.unlocked}
                  progressLabel={b.progressLabel}
                />
              ))}
            </View>

            <Text appearance="hint" style={{ marginTop: 10 }}>
              Tip: unlocked badges are full opacity; locked badges are faded.
            </Text>
          </Card>
        </ScrollView>
      </Layout>
    </Screen>
  );
}
