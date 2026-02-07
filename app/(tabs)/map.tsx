import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { useGPSGate } from "@/lib/hooks/useGPSGate";

import { ConesMapView } from "@/components/map/ConesMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";

function titleCase(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export default function MapScreen() {
  const { loading: authLoading, uid } = useAuthUser();

  const { cones, loading, err } = useCones();

  const {
    loc,
    err: locErr,
    status: locStatus,
    request: requestLocation,
    refresh: refreshLocation, // ✅ guarded (Highest)
    isRefreshing, // ✅ disable buttons / show spinner
  } = useUserLocation();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedConeId, setSelectedConeId] = useState<string | null>(null);

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
  }, [authLoading, uid]);

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

  const activeCone = selectedCone ?? nearestUnclimbed?.cone ?? null;

  // If nothing selected, we can still show nearest-unclimbed overlay (your existing behavior)
  // Once user selects a cone, selection takes precedence.
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
          userLat={userLat}
          userLng={userLng}
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
