import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, FlatList } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { haversineMeters } from "../../../lib/geo"; 

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

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

type ConeRow = {
  cone: Cone;
  distance: number | null;
};

export default function ConeListPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [cones, setCones] = useState<Cone[]>([]);

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [locStatus, setLocStatus] = useState<"unknown" | "granted" | "denied">("unknown");
  const [locErr, setLocErr] = useState<string>("");

  async function loadCones() {
    setLoading(true);
    setErr("");

    try {
      const qy = query(collection(db, "cones"), where("active", "==", true));
      const snap = await getDocs(qy);

      const list: Cone[] = snap.docs.map((d) => {
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

      // stable default sort
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCones(list);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load cones");
    } finally {
      setLoading(false);
    }
  }

  async function requestAndLoadLocation() {
    setLocErr("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocStatus("denied");
        setLoc(null);
        return;
      }

      setLocStatus("granted");
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLoc(cur);
    } catch (e: any) {
      setLocErr(e?.message ?? "Could not get location.");
    }
  }

  async function refreshLocation() {
    setLocErr("");
    try {
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLoc(cur);
    } catch (e: any) {
      setLocErr(e?.message ?? "Failed to refresh location.");
    }
  }

  useEffect(() => {
    loadCones();
    requestAndLoadLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows: ConeRow[] = useMemo(() => {
    if (!loc) {
      return cones.map((c) => ({ cone: c, distance: null }));
    }

    const { latitude, longitude } = loc.coords;

    const list = cones.map((c) => ({
      cone: c,
      distance: haversineMeters(latitude, longitude, c.lat, c.lng),
    }));

    list.sort((a, b) => {
      // distance sort (nulls last)
      if (a.distance == null && b.distance == null) return a.cone.name.localeCompare(b.cone.name);
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

    return list;
  }, [cones, loc]);

  function openCone(coneId: string) {
    router.push(`/(tabs)/cones/${coneId}`);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading cones…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View className="flex-1 bg-background p-4">
        <Card>
          <CardContent className="gap-3">
            <Text className="text-destructive">{err}</Text>
            <Button onPress={loadCones}>
              <Text className="text-primary-foreground font-semibold">Retry</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-foreground">Cones</Text>

        <Button
          variant="outline"
          onPress={loc ? refreshLocation : requestAndLoadLocation}
        >
          <Text className="font-semibold">{loc ? "Refresh GPS" : "Enable GPS"}</Text>
        </Button>
      </View>

      {/* Subheader */}
      <Text className="mt-2 text-sm text-muted-foreground">
        Tap a cone to view details and complete it when you’re in range.
      </Text>

      {locStatus === "denied" ? (
        <View className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
          <Text className="text-sm text-destructive">
            Location permission denied — distances won’t show.
          </Text>
        </View>
      ) : null}

      {locErr ? (
        <View className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
          <Text className="text-sm text-destructive">{locErr}</Text>
        </View>
      ) : null}

      {/* List */}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.cone.id}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const { cone, distance } = item;

          return (
            <Pressable
              onPress={() => openCone(cone.id)}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-lg font-extrabold text-card-foreground">
                    {cone.name}
                  </Text>

                  <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
                    {cone.description || "Tap to view details"}
                  </Text>

                  <View className="mt-3 flex-row flex-wrap gap-2">
                    <View className="rounded-full border border-border bg-background px-3 py-1">
                      <Text className="text-xs text-foreground">
                        Radius {cone.radiusMeters}m
                      </Text>
                    </View>

                    <View className="rounded-full border border-border bg-background px-3 py-1">
                      <Text className="text-xs text-foreground">
                        {distance == null ? "Distance —" : `${Math.round(distance)} m`}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text className="text-sm font-semibold text-primary">Open →</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
