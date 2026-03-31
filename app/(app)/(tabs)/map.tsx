import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import BottomSheet from "@gorhom/bottom-sheet";

import { goCone } from "@/lib/routes";
import { Screen } from "@/components/ui/Screen";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { AppText } from "@/components/ui/AppText";

import { useLocation } from "@/lib/providers/LocationProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useNearestUnclimbed } from "@/lib/hooks/useNearestUnclimbed";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useSession } from "@/lib/providers/SessionProvider";
import { useAppData } from "@/lib/providers/DataProvider";

import { ConesMapView, initialRegionFrom } from "@/components/map/ConesMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";
import { space } from "@/lib/ui/tokens";
import { useMapStore, useTrackingStore } from "@/lib/store/index";

export default function MapScreen() {
  const { session } = useSession();
  const { conesData, completionsData } = useAppData();
  const { cones, loading, err } = conesData;
  const completedIds = completionsData.completedConeIds;

  const { location: loc, errorMsg: providerErr } = useLocation();

  const { refresh: refreshLocation, isRefreshing, err: manualErr } = useUserLocation();

  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : loc ? "granted" : "unknown";

  const { selectedConeId, setSelectedConeId } = useMapStore();

  const nearestUnclimbed = useNearestUnclimbed(cones, completedIds, loc);
  const { targetId, isTracking } = useTrackingStore();
  useKeepAwake();

  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    // Only auto-select if nothing is currently selected
    if (!selectedConeId) {
      if (isTracking && targetId) {
        setSelectedConeId(targetId);
      } else if (nearestUnclimbed?.cone?.id) {
        setSelectedConeId(nearestUnclimbed.cone.id);
      }
    }
  }, [
    selectedConeId,
    isTracking,
    targetId,
    nearestUnclimbed?.cone?.id,
    setSelectedConeId,
  ]);

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

  const lat = loc?.coords.latitude;
  const lng = loc?.coords.longitude;
  const hasMapCones = mapCones.length > 0;

  const initialRegion = useMemo(() => {
    if (loading || !hasMapCones) return null;

    return initialRegionFrom(lat ?? null, lng ?? null, mapCones);
  }, [loading, hasMapCones, lat, lng, mapCones]);

  const refreshGPS = useCallback(async () => {
    if (locStatus !== "denied") await refreshLocation();
  }, [locStatus, refreshLocation]);

  const handleConePress = useCallback(
    (id: string) => {
      Haptics.selectionAsync();
      setSelectedConeId(id);
      // Snap the sheet up so they can read the MapOverlayCard clearly
      bottomSheetRef.current?.snapToIndex(1);
    },
    [setSelectedConeId],
  );

  if (session.status === "loading" || loading) {
    return (
      <Screen>
        <LoadingState label="Locating volcanic field..." />
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <ErrorCard title="Map Error" message={err} />
      </Screen>
    );
  }

  const activeCone = selectedCone ?? nearestUnclimbed?.cone ?? null;
  const overlayDistance =
    selectedCone && gate ? gate.distanceMeters : nearestUnclimbed?.distanceMeters;

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Explore", headerTransparent: true }} />

      <View style={styles.flex1}>
        <ConesMapView
          cones={mapCones}
          completedIds={completedIds}
          initialRegion={initialRegion!}
          selectedConeId={selectedConeId}
          onPressCone={handleConePress}
        />

        {locErr && (
          <View style={styles.overlayTop}>
            <CardShell status="warning" style={styles.alertCard}>
              <AppText variant="label" style={styles.boldText}>
                {locErr}
              </AppText>
            </CardShell>
          </View>
        )}

        {activeCone && (
          <MapOverlayCard
            id={activeCone.id}
            title={activeCone.name}
            distanceMeters={overlayDistance ?? 0}
            onOpen={() => goCone(activeCone.id)}
            locStatus={locStatus}
            hasLoc={!!loc}
            userLocation={loc}
            refreshingGPS={isRefreshing}
            completed={completedIds.has(activeCone.id)}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  overlayTop: {
    position: "absolute",
    top: 60,
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
