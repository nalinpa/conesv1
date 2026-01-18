import { useEffect, useMemo, useState } from "react";
import { Text, ActivityIndicator, Share } from "react-native";
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
import { Screen } from "@/components/screen";

import { ConeInfoCard } from "@/components/cone/ConeInfoCard";
import { ConeStatusCard } from "@/components/cone/ConeStatusCard";
import { ConeCompletionCard } from "@/components/cone/ConeCompletionCard";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

import { nearestCheckpoint } from "../../../lib/checkpoints";

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
    const nearest = nearestCheckpoint(cone, latitude, longitude);

    const acc = accuracy ?? null;
    const inRange = nearest.distanceMeters <= nearest.radiusMeters && (acc == null || acc <= 50);

    return { distance: nearest.distanceMeters, accuracy: acc, inRange };
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
    const nearest = nearestCheckpoint(cone, latitude, longitude);

    if (nearest.distanceMeters > nearest.radiusMeters) {
      setErr(`Not in range yet. You are ~${Math.round(nearest.distanceMeters)}m away.`);
      return;
    }
    if (accuracy != null && accuracy > 50) {
      setErr(`GPS accuracy too low (${Math.round(accuracy)}m). Try refresh in a clearer spot.`);
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

        // IMPORTANT: this is now distance to the nearest checkpoint (or fallback)
        distanceMeters: nearest.distanceMeters,

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

      <ConeInfoCard
        name={cone.name}
        description={cone.description}
        slug={cone.slug}
        radiusMeters={cone.radiusMeters}
      />

      <ConeStatusCard
        loadingLocation={!loc}
        distanceMeters={stats.distance}
        accuracyMeters={stats.accuracy}
        inRange={stats.inRange}
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
      />
    </Screen>
  );
}
