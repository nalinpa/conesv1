import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { auth } from "@/lib/firebase";
import { goCone } from "@/lib/routes";
import { completionService } from "@/lib/services/completionService";

import { Screen } from "@/components/screen";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { Text } from "@ui-kitten/components";

import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";

import { ConesMapView } from "@/components/map/ConesMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";

export default function MapScreen() {
  const { cones, loading, err } = useCones();
  const { loc, err: locErr } = useUserLocation();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

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

  const userLat = loc?.coords.latitude ?? null;
  const userLng = loc?.coords.longitude ?? null;

  const mapCones = useMemo(() => {
    return cones.map((c) => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      radiusMeters: c.radiusMeters,
    }));
  }, [cones]);

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
        <ConesMapView
          cones={mapCones}
          completedIds={completedIds}
          userLat={userLat}
          userLng={userLng}
          onPressCone={(coneId) => goCone(coneId)}
        />

        {/* Nearest unclimbed overlay */}
        {nearestUnclimbed ? (
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
            <MapOverlayCard
              title="Nearest unclimbed"
              subtitle={nearestUnclimbed.cone.name}
              distanceMeters={nearestUnclimbed.distanceMeters ?? null}
              onOpen={() => goCone(nearestUnclimbed.cone.id)}
            />
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