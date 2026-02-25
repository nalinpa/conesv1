import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";

import { goCone } from "@/lib/routes";
import { Screen } from "@/components/ui/Screen";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { AppText } from "@/components/ui/AppText";

import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCones } from "@/lib/hooks/useCones";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useSession } from "@/lib/providers/SessionProvider";

import { ConesMapView, initialRegionFrom } from "@/components/map/ConesMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";
import { space } from "@/lib/ui/tokens";

export default function MapScreen() {
  const { session } = useSession();
  const { cones, loading, err } = useCones();
  const { completedConeIds: completedIds } = useMyCompletions();
  
  const {
    loc,
    err: locErr,
    status: locStatus,
    request: requestLocation,
    refresh: refreshLocation,
    isRefreshing,
  } = useUserLocation();

  const [selectedConeId, setSelectedConeId] = useState<string | null>(null);

  // Auto-select nearest unclimbed cone on first load
  const nearestUnclimbed = useNearestUnclimbed(cones, completedIds, loc);
  
  useEffect(() => {
    if (!selectedConeId && nearestUnclimbed?.cone?.id) {
      setSelectedConeId(nearestUnclimbed.cone.id);
    }
  }, [nearestUnclimbed?.cone?.id, selectedConeId]);

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
    return cones.find((c) => c.id === selectedConeId) ?? null;
  }, [cones, selectedConeId]);

  const gate = useGPSGate(selectedCone, loc);

  const initialRegion = useMemo(() => {
    if (loading) return null;
    return initialRegionFrom(loc?.coords.latitude ?? null, loc?.coords.longitude ?? null, mapCones);
  }, [loading, mapCones]);

  const refreshGPS = useCallback(async () => {
    if (locStatus === "unknown") await requestLocation();
    await refreshLocation();
  }, [locStatus, requestLocation, refreshLocation]);

  if (session.status === "loading" || loading) {
    return <Screen><LoadingState label="Locating volcanic field..." /></Screen>;
  }

  if (err) {
    return <Screen><ErrorCard title="Map Error" message={err} /></Screen>;
  }

  const activeCone = selectedCone ?? nearestUnclimbed?.cone ?? null;
  const overlayDistance = selectedCone && gate ? gate.distanceMeters : nearestUnclimbed?.distanceMeters;

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Explore", headerTransparent: true }} />
      
      <View style={styles.flex1}>
        <ConesMapView
          cones={mapCones}
          completedIds={completedIds}
          initialRegion={initialRegion!}
          selectedConeId={selectedConeId}
          onPressCone={setSelectedConeId}
        />

        {/* Top Alerts (GPS Errors) */}
        {locErr && (
          <View style={styles.overlayTop}>
            <CardShell status="warning" style={styles.alertCard}>
              <AppText variant="label" style={styles.boldText}>{locErr}</AppText>
            </CardShell>
          </View>
        )}

        {/* Bottom Selection Card */}
        {activeCone && (
          <View style={styles.overlayBottom}>
            <MapOverlayCard
              title={activeCone.name}
              distanceMeters={overlayDistance}
              onOpen={() => goCone(activeCone.id)}
              locStatus={locStatus}
              hasLoc={!!loc}
              onRefreshGPS={() => void refreshGPS()}
              refreshingGPS={isRefreshing}
              checkpointLabel={selectedCone && gate ? gate.checkpointLabel : null}
              checkpointRadiusMeters={selectedCone && gate ? gate.checkpointRadius : null}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  overlayTop: {
    position: "absolute",
    top: 60, // Clear the transparent header
    left: space.md,
    right: space.md,
  },
  overlayBottom: {
    position: "absolute",
    bottom: space.lg,
    left: space.md,
    right: space.md,
  },
  alertCard: {
    paddingVertical: space.sm,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  boldText: { fontWeight: "800" },
});