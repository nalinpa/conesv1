import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Share } from "react-native";
import * as Location from "expo-location";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { haversineMeters } from "../lib/geo";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ConesStackParamList } from "../stacks/ConesStack";

type Props = NativeStackScreenProps<ConesStackParamList, "ConeDetail">;

export default function ConeDetailScreen({ route, navigation }: Props) {
  const { cone } = route.params;

  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [err, setErr] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [shareBonus, setShareBonus] = useState(false);

  // Set header title
  useEffect(() => {
    navigation.setOptions({ title: cone.name });
  }, [cone.name, navigation]);

  // Load location (once per cone)
  useEffect(() => {
    (async () => {
      setErr("");
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
  }, [cone.id]);

  // Check if already completed (prevents duplicates)
  useEffect(() => {
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
  }, [cone.id]);

  const stats = useMemo(() => {
    if (!loc) {
      return {
        distance: null as number | null,
        accuracy: null as number | null,
        inRange: false,
      };
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const distance = haversineMeters(latitude, longitude, cone.lat, cone.lng);
    const acc = accuracy ?? null;

    // Gate completion: within radius AND accuracy <= 50m (tweak later)
    const inRange = distance <= cone.radiusMeters && (acc == null || acc <= 50);

    return { distance, accuracy: acc, inRange };
  }, [loc, cone.lat, cone.lng, cone.radiusMeters]);

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
        distanceMeters: distance,
        // share bonus fields
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
    if (!completedId) return;

    // If already marked, don't re-run
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
    } catch (e) {
      // user cancelling share is normal — do nothing
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f8fafc" }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 16,
          padding: 14,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>{cone.name}</Text>
        <Text style={{ marginTop: 8, color: "#475569" }}>{cone.description}</Text>
      </View>

      <View
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 16,
          padding: 14,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontWeight: "800", color: "#0f172a" }}>Status</Text>

        {!loc ? (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ marginTop: 10, gap: 6 }}>
            <Text style={{ color: "#0f172a" }}>
              Distance: {stats.distance == null ? "—" : `${Math.round(stats.distance)} m`}
            </Text>
            <Text style={{ color: "#0f172a" }}>
              Accuracy: {stats.accuracy == null ? "—" : `${Math.round(stats.accuracy)} m`}
            </Text>
            <Text style={{ color: "#0f172a" }}>Radius: {cone.radiusMeters} m</Text>
            <Text style={{ fontWeight: "800", color: stats.inRange ? "#166534" : "#991b1b" }}>
              {stats.inRange ? "✅ In range" : "❌ Not in range"}
            </Text>

            <Pressable
              onPress={refreshLocation}
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 999,
              }}
            >
              <Text style={{ fontWeight: "700", color: "#0f172a" }}>Refresh GPS</Text>
            </Pressable>
          </View>
        )}
      </View>

      {err ? (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: "#fecaca",
            backgroundColor: "#fef2f2",
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#991b1b" }}>{err}</Text>
        </View>
      ) : null}

      {/* Completion block */}
      {!completedId ? (
        <Pressable
          onPress={completeCone}
          disabled={saving}
          style={{
            backgroundColor: "#4f46e5",
            padding: 14,
            borderRadius: 16,
            marginTop: 16,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
            {saving ? "Saving…" : "Complete cone"}
          </Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 16, gap: 10 }}>
          <View
            style={{
              padding: 14,
              borderRadius: 16,
              backgroundColor: "#ecfdf5",
              borderWidth: 1,
              borderColor: "#bbf7d0",
            }}
          >
            <Text style={{ fontWeight: "900", color: "#14532d" }}>Completed ✅</Text>
            <Text style={{ marginTop: 4, color: "#14532d" }}>
              Optional: share a pic on socials for bonus credit.
            </Text>
          </View>

          <Pressable
            onPress={doShareBonus}
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              padding: 14,
              borderRadius: 16,
              backgroundColor: "white",
              opacity: shareBonus ? 0.7 : 1,
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "800", color: "#0f172a" }}>
              {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
