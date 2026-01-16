import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; 
import { haversineMeters } from "../../lib/geo"; 
import { Screen } from "@/components/screen";

import { PieChart } from "@/components/progress/PieChart";
import { StatRow } from "@/components/progress/StatRow";
import { NearestUnclimbedCard } from "@/components/progress/NearestUnclimbedCard";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  description?: string;
  active: boolean;
};

type Completion = {
  coneId: string;
  shareBonus?: boolean;
};

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [locErr, setLocErr] = useState<string>("");

  // Load cones + completions
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in.");

        // Active cones
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
            description: data.description ?? "",
            active: !!data.active,
          };
        });

        // Completions
        const compQ = query(
          collection(db, "coneCompletions"),
          where("userId", "==", user.uid)
        );
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
        setErr(e?.message ?? "Failed to load progress");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Try to load location (best-effort)
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

    // If no location, just return the first unclimbed (stable)
    if (!loc) return { cone: unclimbed[0], distance: null as number | null };

    const { latitude, longitude } = loc.coords;

    let best = unclimbed[0];
    let bestDist = haversineMeters(latitude, longitude, best.lat, best.lng);

    for (let i = 1; i < unclimbed.length; i++) {
      const c = unclimbed[i];
      const d = haversineMeters(latitude, longitude, c.lat, c.lng);
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }

    return { cone: best, distance: bestDist };
  }, [cones, completedIds, loc]);

  function goToCone(coneId: string) {
    router.push(`/(tabs)/cones/${coneId}`);
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading progress…</Text>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            <Text className="text-destructive">{err}</Text>
            <Button onPress={() => router.replace("/(tabs)/progress")}>
              <Text className="text-primary-foreground font-semibold">Retry</Text>
            </Button>
          </CardContent>
        </Card>
      </Screen>
    );
  }

  const allDone = totals.total > 0 && totals.completed === totals.total;

  return (
  <Screen>
    <Text className="text-2xl font-extrabold text-foreground">
      Climb all Auckland volcanic cones 🌋
    </Text>
    <Text className="mt-1 text-sm text-muted-foreground">
      Complete each cone by getting within range and confirming your climb.
    </Text>

    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Your progress</CardTitle>
      </CardHeader>

      <CardContent className="flex-row items-center justify-between">
        <PieChart percent={totals.percent} />

        <View className="flex-1 pl-4 gap-2">
          <StatRow
            label="Completed"
            value={`${totals.completed} / ${totals.total}`}
            variant="default"
          />

          <StatRow
            label="Share bonus"
            value={shareBonusCount}
            variant="secondary"
          />

          {allDone ? (
            <View className="mt-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
              <Text className="font-semibold text-foreground">
                You’ve completed them all 🎉
              </Text>
            </View>
          ) : null}
        </View>
      </CardContent>
    </Card>

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
      distanceMeters={nearestUnclimbed?.distance ?? null}
      locErr={locErr}
      onOpen={goToCone}
    />

    <Text className="mt-4 text-xs text-muted-foreground">
      Tip: Better GPS accuracy helps when you’re close to the cone.
    </Text>
  </Screen>
);
}
