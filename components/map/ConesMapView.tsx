import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { VolcanoMarker } from "@/components/map/VolcanoMarker";

/**
 * BOUNDARY DEFINITION
 * These coordinates define the rectangle that the user is allowed to pan within.
 * Locked strictly to the Auckland Volcanic Field region.
 */
const AUCKLAND_BOUNDS = {
  northEast: {
    latitude: -36.56,
    longitude: 175.15,
  },
  southWest: {
    latitude: -37.15,
    longitude: 174.4,
  },
};

type ConeMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
};

export function initialRegionFrom(
  userLat: number | null,
  userLng: number | null,
  cones: ConeMapPoint[],
): Region {
  if (userLat != null && userLng != null) {
    return {
      latitude: userLat,
      longitude: userLng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  if (cones.length) {
    const avgLat = cones.reduce((a, c) => a + c.lat, 0) / cones.length;
    const avgLng = cones.reduce((a, c) => a + c.lng, 0) / cones.length;
    return {
      latitude: avgLat,
      longitude: avgLng,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }

  return {
    latitude: -36.85,
    longitude: 174.76,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };
}

export const ConesMapView = React.memo(function ConesMapView({
  cones,
  completedIds,
  initialRegion,
  selectedConeId,
  onPressCone,
}: {
  cones: ConeMapPoint[];
  completedIds: Set<string>;
  initialRegion: Region;
  selectedConeId: string | null;
  onPressCone: (_coneId: string) => void;
}) {
  const mapRef = useRef<MapView>(null);
  const prevSelectedRef = useRef<string | null>(null);

  /**
   * ✅ FLICKER PREVENTION & PERFORMANCE
   * warmupTracking: Gives Android time to render all markers initially.
   * extraThawedId: Forces the marker being unselected to stay "active" during the transition.
   * thawIds: A set of IDs currently allowed to re-render.
   */
  const [warmupTracking, setWarmupTracking] = useState(true);
  const [extraThawedId, setExtraThawedId] = useState<string | null>(null);
  const [thawIds, setThawIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Extended warmup for better initial stability on Android
    const t = setTimeout(() => setWarmupTracking(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Synchronous selection detection
  const prevSelected = prevSelectedRef.current;
  const isSelectionChange = prevSelected !== selectedConeId;

  useEffect(() => {
    if (!isSelectionChange) return;

    // Immediately "thaw" the one we are moving away from to prevent flicker
    if (prevSelected) {
      setExtraThawedId(prevSelected);
    }

    const ids = new Set<string>();
    if (prevSelected) ids.add(prevSelected);
    if (selectedConeId) ids.add(selectedConeId);

    setThawIds(ids);
    prevSelectedRef.current = selectedConeId;

    // Maintain thaw long enough for native state to settle (covering shrink animation)
    const t = setTimeout(() => {
      setThawIds(new Set());
      setExtraThawedId(null);
    }, 400);

    return () => clearTimeout(t);
  }, [selectedConeId, isSelectionChange, prevSelected]);

  // Thaw markers on data changes (e.g. marking a cone as completed)
  useEffect(() => {
    if (!cones.length) return;
    const all = new Set(cones.map((c) => c.id));
    setThawIds(all);
    const t = setTimeout(() => setThawIds(new Set()), 1000);
    return () => clearTimeout(t);
  }, [cones, completedIds]);

  const handlePress = useCallback(
    (id: string) => {
      onPressCone(id);
    },
    [onPressCone],
  );

  const handleMapReady = useCallback(() => {
    // Apply the boundary lock strictly to the Auckland region via instance method
    if (mapRef.current) {
      mapRef.current.setMapBoundaries(
        AUCKLAND_BOUNDS.northEast,
        AUCKLAND_BOUNDS.southWest,
      );
    }
  }, []);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.flex1}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onMapReady={handleMapReady}
      /** 🔒 ZOOM CONSTRAINTS
       * Restricts zoom level so users can't see the whole world.
       */
      minZoomLevel={10}
      maxZoomLevel={20}
    >
      {cones.map((c) => {
        const completed = completedIds.has(c.id);
        const selected = selectedConeId === c.id;

        /**
         * ✅ TRACKING POLICY:
         * To prevent Android flicker, tracksViewChanges is true if:
         * 1. Global warmup is active.
         * 2. Marker is in the explicit thaw set.
         * 3. Marker was the previously selected one (handling the transition/shrink).
         * 4. Marker is the current selection (keeping it responsive).
         */
        const tracksViewChanges =
          warmupTracking || thawIds.has(c.id) || c.id === extraThawedId || selected;

        return (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.lat, longitude: c.lng }}
            onPress={() => handlePress(c.id)}
            hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
            tracksViewChanges={tracksViewChanges}
            anchor={{ x: 0.5, y: 0.65 }}
          >
            <VolcanoMarker selected={selected} completed={completed} />
          </Marker>
        );
      })}
    </MapView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
