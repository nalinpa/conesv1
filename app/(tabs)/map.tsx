import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

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
import { useAuthUser } from "@/lib/hooks/useAuthUser";

import { ConesMapView } from "@/components/map/ConesMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";

export default function MapScreen() {
  const { user, loading: authLoading, uid } = useAuthUser();

  const { cones, loading, err } = useCones();
  const { loc, err: locErr } = useUserLocation();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Live completions listener (auth-safe)
  useEffect(() => {
    let unsub: (() => void) | null = null;

    // while auth hydrates, do nothing (avoid racing currentUser)
    if (authLoading) return;

    // logged out -> clear state
    if (!uid) {
      setCompletedIds(new Set());
      return;
    }

    unsub = completionService.watchMyCompletions(
      uid,
      ({ completedConeIds }) => setCompletedIds(completedConeIds),
      (e) => console.error(e),
    );

    return () => {
      if (unsub) unsub();
    };
  }, [authLoading, user]);

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

  // Optional: if you want Map to be “quiet” during auth hydration
  // (AuthGate should handle routing anyway)
  if (authLoading) {
    return (
      <Screen>
        <LoadingState label="Signing you in…" />
      </Screen>
    );
  }

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
