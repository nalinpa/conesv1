import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Share } from "react-native";
import * as Location from "expo-location";
import { Stack, useLocalSearchParams } from "expo-router";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../../lib/firebase"; 
import { haversineMeters } from "../../../lib/geo"; 
import { Screen } from "@/components/screen";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

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

  // Load cone by ID
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

  // Load location (once per cone)
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

  // Check if already completed (prevents duplicates)
  useEffect(() => {
    if (!cone) return;

    (async () => {
      const user = auth.currentUser;
      if (!user) return;

      const qy = query(
        collection(db, "coneCompletions"),
        where("userId", "==", user.uid),
        where("coneId", "==", cone.id),
        limit(1)
      );

      const snap = await getDocs(qy);
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data() as any;
        setCompletedId(d.id);
        setShareBonus(!!data.shareBonus);
      } else {
        setCompletedId(null);
        setShareBonus(false);
      }
    })();
  }, [cone?.id]);

  const stats = useMemo(() => {
    if (!loc || !cone) {
      return {
        distance: null as number | null,
        accuracy: null as number | null,
        inRange: false,
      };
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const distance = haversineMeters(latitude, longitude, cone.lat, cone.lng);
    const acc = accuracy ?? null;

    // Gate completion: within radius AND accuracy <= 50m
    const inRange = distance <= cone.radiusMeters && (acc == null || acc <= 50);

    return { distance, accuracy: acc, inRange };
  }, [loc, cone]);

  async function refreshLocation() {
    setErr("");
    try {
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLoc(cur);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to refresh location.");
    }
  }

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
    const distance = haversineMeters(latitude, longitude, cone.lat, cone.lng);

    if (distance > cone.radiusMeters) {
      setErr(`Not in range yet. You are ~${Math.round(distance)}m away.`);
      return;
    }
    if (accuracy != null && accuracy > 50) {
      setErr(
        `GPS accuracy too low (${Math.round(
          accuracy
        )}m). Try refresh in a clearer spot.`
      );
      return;
    }

    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "coneCompletions"), {
        coneId: cone.id,
        coneSlug: cone.slug,
        coneName: cone.name,
        userId: user.uid,
        completedAt: serverTimestamp(),
        deviceLat: latitude,
        deviceLng: longitude,
        accuracyMeters: accuracy ?? null,
        distanceMeters: distance,
        shareBonus: false,
        shareConfirmed: false,
        sharedAt: null,
        sharedPlatform: null,
      });

      setCompletedId(ref.id);
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

    try {
      const text = `I just completed ${cone.name} 🌋 #AucklandCones #cones`;
      await Share.share({ message: text });

      await updateDoc(doc(db, "coneCompletions", completedId), {
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

  // Router header title
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
    <Screen>
      <Stack.Screen options={{ title: headerTitle }} />

      {/* Cone details */}
      <Card>
        <CardHeader>
          <CardTitle>{cone.name}</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          <Text className="text-muted-foreground">
            {cone.description || "No description yet."}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <Badge variant="secondary">
              <Text className="text-xs">Radius {cone.radiusMeters}m</Text>
            </Badge>
            <Badge variant="secondary">
              <Text className="text-xs">Slug {cone.slug}</Text>
            </Badge>
          </View>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>

        <CardContent className="gap-3">
          {!loc ? (
            <View className="items-center justify-center py-2">
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground">Distance</Text>
                <Text className="font-semibold text-foreground">
                  {stats.distance == null ? "—" : `${Math.round(stats.distance)} m`}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-foreground">Accuracy</Text>
                <Text className="font-semibold text-foreground">
                  {stats.accuracy == null ? "—" : `${Math.round(stats.accuracy)} m`}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-foreground">Range check</Text>
                <Text className={stats.inRange ? "font-extrabold text-green-700" : "font-extrabold text-red-700"}>
                  {stats.inRange ? "✅ In range" : "❌ Not in range"}
                </Text>
              </View>

              <Button variant="outline" onPress={refreshLocation}>
                <Text className="font-semibold">Refresh GPS</Text>
              </Button>
            </>
          )}

          {err ? (
            <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
              <Text className="text-sm text-destructive">{err}</Text>
            </View>
          ) : null}
        </CardContent>
      </Card>

      {/* Completion */}
      {!completedId ? (
        <Button
          className="mt-4"
          onPress={completeCone}
          disabled={saving || !loc}
        >
          <Text className="text-primary-foreground font-semibold">
            {saving ? "Saving…" : "Complete cone"}
          </Text>
        </Button>
      ) : (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Completed ✅</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <Text className="text-muted-foreground">
              Optional: share a pic on socials for bonus credit.
            </Text>

            <Button
              variant={shareBonus ? "secondary" : "outline"}
              onPress={doShareBonus}
              disabled={shareBonus}
            >
              <Text className="font-semibold">
                {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
              </Text>
            </Button>
          </CardContent>
        </Card>
      )}
    </Screen>
  );
}
