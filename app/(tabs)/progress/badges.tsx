import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { Layout, Text, Button } from "@ui-kitten/components";

import { COL } from "@/lib/constants/firestore";
import { auth, db } from "@/lib/firebase";
import { Screen } from "@/components/screen";
import { BADGES, getBadgeState } from "@/lib/badges";
import { CardShell } from "@/components/ui/CardShell";
import { goProgressHome } from "@/lib/routes";

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
        const conesQ = query(collection(db, COL.cones), where("active", "==", true));
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
        const compQ = query(collection(db, COL.coneCompletions), where("userId", "==", user.uid));
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
    const unlocked = badgeState.earnedIds.size;
    const total = BADGES.length;
    return { unlocked, total };
  }, [badgeState.earnedIds]);

  const items = useMemo(() => {
    return BADGES.map((b) => {
      const progress = badgeState.progressById[b.id];
      const unlocked = badgeState.earnedIds.has(b.id);
      return {
        id: b.id,
        name: b.name,
        unlockText: b.unlockText,
        unlocked,
        progressLabel: unlocked ? null : progress?.progressLabel ?? null,
      };
    });
  }, [badgeState.earnedIds, badgeState.progressById]);

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
          <CardShell status="danger">
            <Text category="h6" style={{ marginBottom: 6, fontWeight: "800" }}>
              Badges
            </Text>
            <Text status="danger">{err}</Text>
            <Button style={{ marginTop: 12 }} onPress={() => router.replace("/(tabs)/progress/badges")}>
              Retry
            </Button>
          </CardShell>
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

            <Button size="small" appearance="outline" onPress={goProgressHome}>
              Done
            </Button>
          </View>

          {/* Next up */}
          <View style={{ marginTop: 14 }}>
            <CardShell>
              <Text category="h6">Next up</Text>

              {!badgeState.nextUp ? (
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
                    {badgeState.nextUp.badge.name}
                  </Text>
                  <Text appearance="hint" style={{ marginTop: 6 }}>
                    {badgeState.nextUp.badge.unlockText}
                  </Text>
                  {badgeState.nextUp.progressLabel ? (
                    <Text appearance="hint" style={{ marginTop: 10 }}>
                      {badgeState.nextUp.progressLabel}
                    </Text>
                  ) : null}
                </View>
              )}
            </CardShell>
          </View>

          {/* Grid */}
          <View style={{ marginTop: 14 }}>
            <CardShell>
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
            </CardShell>
          </View>
        </ScrollView>
      </Layout>
    </Screen>
  );
}
