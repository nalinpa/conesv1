import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; 
import { haversineMeters } from "../../lib/geo";
import { MapOverlay } from "@/components/map/MapOverlay";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

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

export default function MapPage() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

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

        const coneList: Cone[] = conesSnap.docs.map((d) => {
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

        // Completions for user
        const compQ = query(
          collection(db, "coneCompletions"),
          where("userId", "==", user.uid)
        );
        const compSnap = await getDocs(compQ);

        const ids = new Set<string>();
        compSnap.docs.forEach((d) => {
          const data = d.data() as any;
          if (data?.coneId) ids.add(String(data.coneId));
        });

        if (!mounted) return;
        setCones(coneList);
        setCompletedIds(ids);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load map data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Load location (best effort)
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

  const initialRegion: Region = useMemo(() => {
    // Default: Auckland CBD-ish
    const fallback: Region = {
      latitude: -36.8485,
      longitude: 174.7633,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };

    if (!loc) return fallback;

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [loc]);

  const nearestUnclimbed = useMemo(() => {
    const unclimbed = cones.filter((c) => !completedIds.has(c.id));
    if (unclimbed.length === 0) return null;

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

  function openCone(coneId: string) {
    router.push(`/(tabs)/cones/${coneId}`);
  }

  function centerOnMe() {
    if (!loc || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      400
    );
  }

  if (loading) {
    return (
      <View
        className="absolute left-0 right-0 top-0 z-10 px-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading map…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View className="flex-1 bg-background p-4">
        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <Text className="text-destructive">{err}</Text>
            <Button onPress={() => router.replace("/(tabs)/map")}>
              <Text className="text-primary-foreground font-semibold">Retry</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  const completedCount = completedIds.size;
  const totalCount = cones.length;

  return (
    <View className="flex-1 bg-background">
      {/* Overlay header */}
      <View
        className="absolute left-0 right-0 top-0 z-10 px-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <MapOverlay
          completedCount={completedCount}
          totalCount={totalCount}
          locErr={locErr}
          nearestUnclimbed={
            nearestUnclimbed
              ? {
                  cone: { id: nearestUnclimbed.cone.id, name: nearestUnclimbed.cone.name },
                  distanceMeters: nearestUnclimbed.distance,
                }
              : null
          }
          onOpenCone={openCone}
          onCenter={centerOnMe}
          canCenter={!!loc}
        />
      </View>

      {/* Map */}
      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      >
        {loc ? (
          <Marker
            coordinate={{
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }}
            title="You"
            pinColor="#2563eb"
          />
        ) : null}

        {cones.map((c) => {
          const done = completedIds.has(c.id);
          return (
            <Marker
              key={c.id}
              coordinate={{ latitude: c.lat, longitude: c.lng }}
              title={c.name}
              description={done ? "Completed" : "Not completed"}
              pinColor={done ? "#16a34a" : "#dc2626"}
              onPress={() => openCone(c.id)}
            />
          );
        })}
      </MapView>
    </View>
  );
}
