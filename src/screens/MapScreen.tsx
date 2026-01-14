import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase"; // adjust path if needed

// ✅ must match your Bottom Tab route name for the Cones tab
const CONES_TAB_ROUTE = "Cones";

// ✅ must match your stack screen name (from your code snippet)
const CONE_DETAIL_SCREEN = "ConeDetail";

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

const AUCKLAND_REGION: Region = {
  latitude: -36.8485,
  longitude: 174.7633,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedConeIds, setCompletedConeIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [userRegion, setUserRegion] = useState<Region | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // 1) Load active cones
        const conesQ = query(collection(db, "cones"), where("active", "==", true));
        const conesSnap = await getDocs(conesQ);

        const rows: Cone[] = conesSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        if (mounted) setCones(rows);

        // 2) Load this user's completions for coloring
        const user = auth.currentUser;
        if (user) {
          const completionsQ = query(
            collection(db, "coneCompletions"),
            where("userId", "==", user.uid)
          );
          const completionsSnap = await getDocs(completionsQ);

          const completedIds = new Set<string>();
          completionsSnap.docs.forEach((doc) => {
            const data = doc.data() as any;
            if (data?.coneId) completedIds.add(data.coneId);
          });

          if (mounted) setCompletedConeIds(completedIds);
        }

        // 3) Location (center map)
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== "granted") {
          if (mounted) setLocationDenied(true);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!mounted) return;

        setUserRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const initialRegion = useMemo(() => userRegion ?? AUCKLAND_REGION, [userRegion]);

  const openConeDetail = (cone: Cone) => {
    // ✅ IMPORTANT: ConeDetail expects { cone: Cone }
    navigation.navigate(CONES_TAB_ROUTE, {
      screen: CONE_DETAIL_SCREEN,
      params: { cone },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {locationDenied ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Location permission is off — showing Auckland. Enable location to center on you.
          </Text>
        </View>
      ) : null}

      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!locationDenied}
        showsMyLocationButton={!locationDenied}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      >
        {cones.map((c) => {
          const completed = completedConeIds.has(c.id);

          return (
            <React.Fragment key={c.id}>
              <Marker
                coordinate={{ latitude: c.lat, longitude: c.lng }}
                title={c.name}
                description={completed ? "Completed" : "Not completed"}
                pinColor={completed ? "green" : "red"}
                onPress={() => openConeDetail(c)}
              />

              {Number.isFinite(c.radiusMeters) && c.radiusMeters > 0 ? (
                <Circle
                  center={{ latitude: c.lat, longitude: c.lng }}
                  radius={c.radiusMeters}
                  strokeWidth={1}
                  strokeColor={completed ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.5)"}
                  fillColor={completed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)"}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  bannerText: { color: "white" },
});
