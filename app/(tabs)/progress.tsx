import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; 
import { haversineMeters } from "../../lib/geo"; // adjust if your geo helper moved

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

function PieChart({
  percent,
  size = 120,
  strokeWidth = 14,
}: {
  percent: number; // 0..1
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, percent));
  const dash = c * clamped;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke="rgba(148, 163, 184, 0.35)"
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="hsl(var(--primary))"
          fill="transparent"
          strokeDasharray={`${dash} ${c - dash}`}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View className="absolute items-center justify-center">
        <Text className="text-2xl font-extrabold text-foreground">
          {Math.round(clamped * 100)}%
        </Text>
        <Text className="text-xs text-muted-foreground">complete</Text>
      </View>
    </View>
  );
}

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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading progress…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View className="flex-1 bg-background p-4">
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
      </View>
    );
  }

  const allDone = totals.total > 0 && totals.completed === totals.total;

  return (
    <View className="flex-1 bg-background p-4">
      {/* Top text */}
      <Text className="text-2xl font-extrabold text-foreground">
        Climb all Auckland volcanic cones 🌋
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        Complete each cone by getting within range and confirming your climb.
      </Text>

      {/* Pie + stats */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Your progress</CardTitle>
        </CardHeader>
        <CardContent className="flex-row items-center justify-between">
          <PieChart percent={totals.percent} />

          <View className="flex-1 pl-4 gap-2">
            <View className="flex-row items-center gap-2">
              <Badge>
                <Text className="text-xs">Completed</Text>
              </Badge>
              <Text className="text-base font-bold text-foreground">
                {totals.completed} / {totals.total}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Badge variant="secondary">
                <Text className="text-xs">Share bonus</Text>
              </Badge>
              <Text className="text-base font-bold text-foreground">
                {shareBonusCount}
              </Text>
            </View>

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

      {/* Nearest unclimbed */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Nearest unclimbed</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          {!nearestUnclimbed ? (
            <Text className="text-muted-foreground">
              No cones found — check admin “active” flags.
            </Text>
          ) : (
            <>
              <Pressable
                onPress={() => goToCone(nearestUnclimbed.cone.id)}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <Text className="text-lg font-extrabold text-card-foreground">
                  {nearestUnclimbed.cone.name}
                </Text>

                <Text className="mt-1 text-sm text-muted-foreground">
                  {nearestUnclimbed.cone.description || "Tap to view details"}
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Badge variant="secondary">
                      <Text className="text-xs">Distance</Text>
                    </Badge>
                    <Text className="font-semibold text-foreground">
                      {nearestUnclimbed.distance == null
                        ? locErr
                          ? "— (no GPS)"
                          : "—"
                        : `${Math.round(nearestUnclimbed.distance)} m`}
                    </Text>
                  </View>

                  <Text className="text-sm font-semibold text-primary">
                    Open →
                  </Text>
                </View>
              </Pressable>

              <Button onPress={() => goToCone(nearestUnclimbed.cone.id)}>
                <Text className="text-primary-foreground font-semibold">
                  Go to cone
                </Text>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bottom info */}
      <Text className="mt-4 text-xs text-muted-foreground">
        Tip: Better GPS accuracy helps when you’re close to the cone.
      </Text>
    </View>
  );
}
