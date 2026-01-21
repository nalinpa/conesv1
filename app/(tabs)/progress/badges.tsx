import { ScrollView, View, Text } from "react-native";
import { useMemo, useEffect, useState } from "react";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";

import { Screen } from "@/components/screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { auth, db } from "@/lib/firebase";
import { BADGES, getBadgeState, type BadgeDefinition } from "@/lib/badges";
import { BadgesGrid } from "@/components/progress/BadgesGrid";

type ConeMeta = {
  id: string;
  active: boolean;
  type?: "cone" | "crater";
  region?: "north" | "central" | "south" | "harbour";
};

type Completion = {
  coneId: string;
  shareBonus?: boolean;
};

export default function BadgesDetailPage() {
  const [cones, setCones] = useState<ConeMeta[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setErr("");
      try {
        const user = auth.currentUser;
        if (!user) return;

        const conesQ = query(collection(db, "cones"), where("active", "==", true));
        const conesSnap = await getDocs(conesQ);
        const conesList: ConeMeta[] = conesSnap.docs.map((d) => {
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

        const compQ = query(collection(db, "coneCompletions"), where("userId", "==", user.uid));
        const compSnap = await getDocs(compQ);

        const ids = new Set<string>();
        let bonus = 0;

        compSnap.docs.forEach((d) => {
          const data = d.data() as Completion;
          if (data?.coneId) ids.add(data.coneId);
          if (data?.shareBonus) bonus += 1;
        });

        if (!mounted) return;
        setCones(conesList);
        setCompletedIds(ids);
        setShareBonusCount(bonus);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load badges");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const state = useMemo(() => {
    return getBadgeState({ cones, completedConeIds: completedIds, shareBonusCount });
  }, [cones, completedIds, shareBonusCount]);

  const earnedCount = state.earnedIds.size;

  const sections = useMemo(() => {
    const bySection = new Map<string, BadgeDefinition[]>();
    for (const b of BADGES) {
      const key = b.section;
      const list = bySection.get(key) ?? [];
      list.push(b);
      bySection.set(key, list);
    }
    return Array.from(bySection.entries());
  }, []);

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold text-foreground">Badges</Text>
          <Button variant="outline" onPress={() => router.back()}>
            <Text className="font-semibold">Back</Text>
          </Button>
        </View>

        <Text className="mt-1 text-sm text-muted-foreground">
          Earned {earnedCount} / {BADGES.length}. Tap a badge to see the unlock text.
        </Text>

        {err ? (
          <View className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
            <Text className="text-sm text-destructive">{err}</Text>
          </View>
        ) : null}

        {sections.map(([title, list]) => (
          <Card key={title} className="mt-4">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <BadgesGrid badges={list} earnedIds={state.earnedIds} progressById={state.progressById} />
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
