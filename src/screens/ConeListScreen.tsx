import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { haversineMeters } from "../lib/geo";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ConesStackParamList } from "../stacks/ConesStack";

export type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  active: boolean;
  description: string;
};

type Row = { cone: Cone; distance: number | null };

type Props = NativeStackScreenProps<ConesStackParamList, "ConeList">;

export default function ConeListScreen({ navigation }: Props) {
  const [cones, setCones] = useState<Cone[]>([]);
  const [loadingCones, setLoadingCones] = useState(true);

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [locErr, setLocErr] = useState<string>("");

  useEffect(() => {
    const qy = query(collection(db, "cones"), where("active", "==", true));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Cone[];
        setCones(rows);
        setLoadingCones(false);
      },
      (e) => {
        console.error(e);
        setLoadingCones(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      setLocErr("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocErr("Location permission denied. Distances will be unavailable.");
        return;
      }
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLoc(cur);
    })();
  }, []);

  const rows = useMemo<Row[]>(() => {
    if (!loc) return cones.map((c) => ({ cone: c, distance: null }));
    const { latitude, longitude } = loc.coords;

    return cones
      .map((c) => ({
        cone: c,
        distance: haversineMeters(latitude, longitude, c.lat, c.lng),
      }))
      .sort((a, b) => (a.distance ?? 1e18) - (b.distance ?? 1e18));
  }, [cones, loc]);

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 16, backgroundColor: "#f8fafc" }}>
      <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
        Tip: distances depend on GPS accuracy.
      </Text>

      {locErr ? (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#fecaca",
            backgroundColor: "#fef2f2",
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#991b1b" }}>{locErr}</Text>
        </View>
      ) : null}

      {loadingCones ? (
        <View style={{ marginTop: 24 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList<Row>
          data={rows}
          keyExtractor={(r) => r.cone.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const c = item.cone;
            const d = item.distance;

            return (
              <Pressable
                onPress={() => navigation.navigate("ConeDetail", { cone: c })}
                style={{
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 16,
                  padding: 14,
                  backgroundColor: "white",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#0f172a" }}>
                  {c.name}
                </Text>

                <Text style={{ marginTop: 4, color: "#475569" }} numberOfLines={2}>
                  {c.description}
                </Text>

                <Text style={{ marginTop: 10, color: "#0f172a", fontWeight: "600" }}>
                  {d == null ? "Distance: —" : `Distance: ${Math.round(d)} m`}
                  {"  "}•{"  "}Radius: {c.radiusMeters} m
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
