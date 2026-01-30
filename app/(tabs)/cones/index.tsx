import { useEffect, useMemo, useState, useCallback } from "react";
import { View, ActivityIndicator, FlatList } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

import { Screen } from "@/components/screen";
import { nearestCheckpoint } from "../../../lib/checkpoints";
import type { Cone } from "@/lib/models";

import { Layout, Text, Card, Button } from "@ui-kitten/components";

type ConeRow = {
  cone: Cone;
  distance: number | null;
};

export default function ConeListPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [cones, setCones] = useState<Cone[]>([]);

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [locStatus, setLocStatus] = useState<"unknown" | "granted" | "denied">(
    "unknown"
  );
  const [locErr, setLocErr] = useState<string>("");

  const loadCones = useCallback(async () => {
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

      // stable baseline order (when no GPS)
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCones(list);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load cones");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestAndLoadLocation = useCallback(async () => {
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
  }, []);

  const refreshLocation = useCallback(async () => {
    setLocErr("");
    try {
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLoc(cur);
    } catch (e: any) {
      setLocErr(e?.message ?? "Failed to refresh location.");
    }
  }, []);

  useEffect(() => {
    void loadCones();
    void requestAndLoadLocation();
  }, [loadCones, requestAndLoadLocation]);

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
    router.push({
      pathname: "/(tabs)/cones/[coneId]",
      params: { coneId },
    });
  }

  if (loading) {
    return (
      <Screen>
        <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text appearance="hint" style={{ marginTop: 10 }}>
            Loading cones…
          </Text>
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <Layout style={{ flex: 1 }}>
          <Card status="danger" style={{ padding: 16 }}>
            <Text category="s1" style={{ marginBottom: 6, fontWeight: "800" }}>
              Couldn’t load cones
            </Text>
            <Text appearance="hint" style={{ marginBottom: 12 }}>
              {err}
            </Text>

            <Button onPress={() => void loadCones()}>Retry</Button>
          </Card>
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen>
      <Layout style={{ flex: 1 }}>
        {/* little extra top breathing room */}
        <View style={{ height: 6 }} />

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text category="h4">Cones</Text>

          <Button
            size="small"
            appearance="outline"
            onPress={() => {
              void (loc ? refreshLocation() : requestAndLoadLocation());
            }}
          >
            {loc ? "Refresh GPS" : "Enable GPS"}
          </Button>
        </View>

        <Text appearance="hint" style={{ marginTop: 6 }}>
          Tap a cone to view details and complete it when you’re in range.
        </Text>

        {locStatus === "denied" ? (
          <Card status="warning" style={{ marginTop: 12, padding: 12 }}>
            <Text>Location permission denied — distances won’t show.</Text>
          </Card>
        ) : null}

        {locErr ? (
          <Card status="danger" style={{ marginTop: 12, padding: 12 }}>
            <Text>{locErr}</Text>
          </Card>
        ) : null}

        <FlatList
          data={rows}
          keyExtractor={(item) => item.cone.id}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const { cone, distance } = item;

            return (
              <Card style={{ padding: 14 }} onPress={() => openCone(cone.id)}>
                <Text category="s1" style={{ fontWeight: "800" }}>
                  {cone.name}
                </Text>

                <Text appearance="hint" style={{ marginTop: 6 }} numberOfLines={2}>
                  {cone.description?.trim() ? cone.description.trim() : "Tap to view details"}
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
                  {cone.radiusMeters != null ? (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.08)",
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text category="c1">Radius {cone.radiusMeters}m</Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.08)",
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text category="c1">
                      {distance == null ? "Distance —" : `${Math.round(distance)} m`}
                    </Text>
                  </View>
                </View>

                <Text style={{ marginTop: 6, fontWeight: "700" }}>Open →</Text>
              </Card>
            );
          }}
        />
      </Layout>
    </Screen>
  );
}
