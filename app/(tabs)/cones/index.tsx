import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Screen } from "@/components/screen";

import { ConeListItem } from "@/components/cone/ConeListItem";
import { nearestCheckpoint } from "../../../lib/checkpoints";

import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

import type { Cone } from "@/lib/models";

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
          checkpoints: Array.isArray(data.checkpoints) ? data.checkpoints : undefined,
          description: data.description ?? "",
          active: !!data.active,
        };
      });

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
    if (!loc) return cones.map((c) => ({ cone: c, distance: null }));

    const { latitude, longitude } = loc.coords;

    const list = cones.map((c) => ({
      cone: c,
      distance: nearestCheckpoint(c, latitude, longitude).distanceMeters,
    }));

    list.sort((a, b) => {
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
      <Screen>
        <ActivityIndicator />
        <Text className="mt-2 text-muted-foreground">Loading cones…</Text>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <Card>
          <CardContent className="gap-3">
            <Text className="text-destructive">{err}</Text>
            <Button onPress={loadCones}>
              <Text className="text-primary-foreground font-semibold">Retry</Text>
            </Button>
          </CardContent>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-foreground">Cones</Text>

        <Button
          variant="outline"
          onPress={() => {
            void (loc ? refreshLocation() : requestAndLoadLocation());
          }}
        >
          <Text className="font-semibold">{loc ? "Refresh GPS" : "Enable GPS"}</Text>
        </Button>
      </View>

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

      <FlatList
        data={rows}
        keyExtractor={(item) => item.cone.id}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const { cone, distance } = item;

          return (
            <ConeListItem
              cone={{
                id: cone.id,
                name: cone.name,
                description: cone.description,
                radiusMeters: cone.radiusMeters,
              }}
              distanceMeters={distance}
              onPress={openCone}
            />
          );
        }}
      />
    </Screen>
  );
}
