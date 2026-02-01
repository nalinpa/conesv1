import React, { useEffect, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";

import { auth } from "@/lib/firebase";
import { formatDistanceMeters } from "@/lib/formatters";
import { goCone } from "@/lib/routes";

import { Screen } from "@/components/screen";
import type { Cone } from "@/lib/models";
import { completionService } from "@/lib/services/completionService";

import { Text } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";

export default function MapScreen() {
  const { cones, loading, err } = useCones();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const { loc, err: locErr } = useUserLocation();

  // Live completions listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = completionService.watchMyCompletions(
      user.uid,
      ({ completedConeIds }) => setCompletedIds(completedConeIds),
      (e) => console.error(e)
    );

    return () => unsub();
  }, []);

  const nearestUnclimbed = useNearestUnclimbed(cones, completedIds, loc);

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading map…" />
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <ErrorCard title="Map error" message={err} />
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
                {nearestUnclimbed.distanceMeters != null
                  ? ` · ${formatDistanceMeters(nearestUnclimbed.distanceMeters)}`
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
