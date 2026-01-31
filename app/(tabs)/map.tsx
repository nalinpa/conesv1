import React, { useEffect, useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";

import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { formatDistanceMeters } from "@/lib/formatters";
import { goCone } from "@/lib/routes";

import { Screen } from "@/components/screen";
import { nearestCheckpoint } from "@/lib/checkpoints";

// UI Kitten
import { Text } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";

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
  active: boolean;
};

function toNum(v: any): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [locErr, setLocErr] = useState<string>("");

  // -----------------------------
  // Load cones (one-time)
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const conesQ = query(collection(db, COL.cones), where("active", "==", true));
        const snap = await getDocs(conesQ);

        const list: Cone[] = snap.docs
          .map((d) => {
            const data = d.data() as any;

            const checkpoints = Array.isArray(data.checkpoints)
              ? data.checkpoints
                  .map((cp: any) => ({
                    id: cp.id,
                    label: cp.label,
                    lat: toNum(cp.lat),
                    lng: toNum(cp.lng),
                    radiusMeters: toNum(cp.radiusMeters),
                  }))
                  .filter(
                    (cp: any) =>
                      Number.isFinite(cp.lat) &&
                      Number.isFinite(cp.lng) &&
                      Number.isFinite(cp.radiusMeters)
                  )
              : undefined;

            return {
              id: d.id,
              name: String(data.name ?? ""),
              slug: String(data.slug ?? ""),
              lat: toNum(data.lat),
              lng: toNum(data.lng),
              radiusMeters: toNum(data.radiusMeters),
              checkpoints,
              active: !!data.active,
            };
          })
          .filter(
            (c) =>
              c.name &&
              Number.isFinite(c.lat) &&
              Number.isFinite(c.lng) &&
              Number.isFinite(c.radiusMeters)
          );

        if (!mounted) return;
        setCones(list);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load map");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------------
  // Live completions listener
  // -----------------------------
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qy = query(collection(db, COL.coneCompletions), where("userId", "==", user.uid));

    const unsub = onSnapshot(
      qy,
      (snap) => {
        const ids = new Set<string>();
        snap.docs.forEach((d) => {
          const data = d.data() as any;
          if (data?.coneId) ids.add(String(data.coneId));
        });
        setCompletedIds(ids);
      },
      (e) => {
        console.error(e);
      }
    );

    return () => unsub();
  }, []);

  // -----------------------------
  // Location (one-time)
  // -----------------------------
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

  // -----------------------------
  // Nearest unclimbed (live)
  // -----------------------------
  const nearestUnclimbed = useMemo(() => {
    const unclimbed = cones.filter((c) => !completedIds.has(c.id));
    if (unclimbed.length === 0) return null;

    if (!loc) return { cone: unclimbed[0], distance: null as number | null };

    const { latitude, longitude } = loc.coords;

    let best = unclimbed[0];
    let bestDist = nearestCheckpoint(best, latitude, longitude).distanceMeters;

    for (let i = 1; i < unclimbed.length; i++) {
      const c = unclimbed[i];
      const d = nearestCheckpoint(c, latitude, longitude).distanceMeters;
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }

    return { cone: best, distance: bestDist };
  }, [cones, completedIds, loc]);

  // -----------------------------
  // UI states
  // -----------------------------
  if (loading) {
    return (
      <Screen>
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1, gap: 10 }}>
          <ActivityIndicator />
          <Text appearance="hint">Loading map…</Text>
        </View>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <CardShell status="danger">
          <Text category="s1" style={{ fontWeight: "800", marginBottom: 6 }}>
            Map error
          </Text>
          <Text status="danger">{err}</Text>
        </CardShell>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation
          initialRegion={{
            latitude: loc?.coords.latitude ?? -36.8485,
            longitude: loc?.coords.longitude ?? 174.7633,
            latitudeDelta: 0.25,
            longitudeDelta: 0.25,
          }}
        >
          {cones.map((cone) => {
            const completed = completedIds.has(cone.id);

            return (
              <React.Fragment key={cone.id}>
                {/* Circle must be a direct child of MapView */}
                <Circle
                  center={{ latitude: cone.lat, longitude: cone.lng }}
                  radius={cone.radiusMeters}
                  strokeColor={completed ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}
                  fillColor={completed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}
                />

                <Marker
                  coordinate={{ latitude: cone.lat, longitude: cone.lng }}
                  pinColor={completed ? "green" : "red"}
                  title={cone.name}
                  onPress={() => goCone(cone.id)}
                />
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Nearest unclimbed overlay */}
        {nearestUnclimbed ? (
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
            <CardShell style={{ borderRadius: 18 }}>
              <Text category="s1" style={{ fontWeight: "800" }}>
                Nearest unclimbed
              </Text>

              <View style={{ height: 6 }} />

              <Text appearance="hint">
                {nearestUnclimbed.cone.name}
                {nearestUnclimbed.distance != null
                  ? ` · ${formatDistanceMeters(nearestUnclimbed.distance)}`
                  : ""}
              </Text>

              <View style={{ height: 10 }} />
              <Text appearance="hint" category="c1">
                Tap the marker to open the cone.
              </Text>
            </CardShell>
          </View>
        ) : null}

        {/* Location error toast */}
        {locErr ? (
          <View style={{ position: "absolute", left: 16, right: 16, top: 16 }}>
            <CardShell status="warning" style={{ borderRadius: 16 }}>
              <Text status="warning">{locErr}</Text>
            </CardShell>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
