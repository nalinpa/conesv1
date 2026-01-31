import { useEffect, useMemo, useState, useCallback } from "react";
import { View, FlatList } from "react-native";
import * as Location from "expo-location";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { formatDistanceMeters } from "@/lib/formatters";

import { Screen } from "@/components/screen";
import { nearestCheckpoint } from "../../../lib/checkpoints";
import type { Cone } from "@/lib/models";
import { goCone } from "@/lib/routes";

import { Layout, Text, Button } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

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

  const loadCones = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const qy = query(collection(db, COL.cones), where("active", "==", true));
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
    goCone(coneId);
  }

  if (loading) {
    return (
      <Screen>
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading cones…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <Layout style={{ flex: 1 }}>
          <ErrorCard
            title="Couldn’t load cones"
            message={err}
            action={{ label: "Retry", onPress: () => void loadCones(), appearance: "filled" }}
          />
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
          <View style={{ marginTop: 12 }}>
            <CardShell status="warning">
              <Text>Location permission denied — distances won’t show.</Text>
            </CardShell>
          </View>
        ) : null}

        {locErr ? (
          <View style={{ marginTop: 12 }}>
            <CardShell status="danger">
              <Text>{locErr}</Text>
            </CardShell>
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
              <CardShell onPress={() => openCone(cone.id)}>
                <Text category="s1" style={{ fontWeight: "800" }}>
                  {cone.name}
                </Text>

                <Text appearance="hint" style={{ marginTop: 6 }} numberOfLines={2}>
                  {cone.description?.trim() ? cone.description.trim() : "Tap to view details"}
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {cone.radiusMeters != null ? (
                    <Pill status="basic">Radius {cone.radiusMeters}m</Pill>
                  ) : null}

                  <Pill status="basic">{formatDistanceMeters(distance, "label")}</Pill>
                </View>

                <Text style={{ marginTop: 10, fontWeight: "700" }}>Open →</Text>
              </CardShell>
            );
          }}
        />
      </Layout>
    </Screen>
  );
}
