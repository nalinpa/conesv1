import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { goCone } from "@/lib/routes";

import { Screen } from "@/components/ui/screen";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { Text } from "@ui-kitten/components";

import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";

import { useSession } from "@/lib/providers/SessionProvider";

import { ConesMapView, initialRegionFrom } from "@/components/map/ConesMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";

export default function MapScreen() {
  const { session } = useSession();
  const sessionLoading = session.status === "loading";

  const { cones, loading, err } = useCones();

  const {
    loc,
    err: locErr,
    status: locStatus,
    request: requestLocation,
    refresh: refreshLocation, // ✅ guarded (Highest)
    isRefreshing, // ✅ disable buttons / show spinner
  } = useUserLocation();

  const { completedConeIds: completedIds } = useMyCompletions();
  const [selectedConeId, setSelectedConeId] = useState<string | null>(null);

  const nearestUnclimbed = useNearestUnclimbed(cones, completedIds, loc);

  // Auto-select nearest cone ONCE (so marker styling matches overlay)
  useEffect(() => {
    if (selectedConeId) return; // user already selected something
    const nearestId = nearestUnclimbed?.cone?.id ?? null;
    if (!nearestId) return;
    setSelectedConeId(nearestId);
  }, [nearestUnclimbed?.cone?.id, selectedConeId]);

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

  const selectedCone = useMemo(() => {
    if (!selectedConeId) return null;
    return cones.find((c) => c.id === selectedConeId) ?? null;
  }, [cones, selectedConeId]);

  // Calculate initial region ONCE when loading finishes.
  // We ignore subsequent location updates for the viewport (user can pan manually).
  const initialRegion = useMemo(() => {
    if (loading) return null;
    return initialRegionFrom(userLat, userLng, mapCones);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const gate = useGPSGate(selectedCone, loc);

  const refreshGPS = useCallback(async () => {
    // If permission is unknown, request first (shows prompt).
    if (locStatus === "unknown") {
      const res = await requestLocation();
      if (!res.ok) return;
    }

    // Then always try a high-accuracy fix (guarded + throttled in hook)
    await refreshLocation();
  }, [locStatus, requestLocation, refreshLocation]);

  if (sessionLoading) {
    return (
      <Screen>
        <LoadingState label="Loading…" />
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

  const activeCone = selectedCone ?? nearestUnclimbed?.cone ?? null;

  const overlayTitle = activeCone?.name ?? "";

  // distance: use gate distance for selected; otherwise nearest-unclimbed distance
  const overlayDistanceMeters =
    selectedCone && gate ? gate.distanceMeters ?? null : nearestUnclimbed?.distanceMeters ?? null;

  // checkpoint info: only meaningful for selected cone (gate)
  const overlayCheckpointLabel = selectedCone && gate ? gate.checkpointLabel ?? null : null;
  const overlayCheckpointRadius = selectedCone && gate ? gate.checkpointRadius ?? null : null;

  return (
    <Screen padded={false}>
      <View style={{ flex: 1 }}>
        <ConesMapView
          cones={mapCones}
          completedIds={completedIds}
          initialRegion={initialRegion!}
          selectedConeId={selectedConeId}
          onPressCone={(coneId) => setSelectedConeId(coneId)}
        />

        {activeCone ? (
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
            <MapOverlayCard
              title={overlayTitle}
              distanceMeters={overlayDistanceMeters}
              onOpen={() => goCone(activeCone.id)}
              locStatus={locStatus}
              hasLoc={!!loc}
              onRefreshGPS={() => void refreshGPS()}
              refreshingGPS={isRefreshing}
              checkpointLabel={overlayCheckpointLabel}
              checkpointRadiusMeters={overlayCheckpointRadius}
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
