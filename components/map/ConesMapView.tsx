import React, { useRef, useCallback } from "react";
import { StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";

import { TrackedMarker } from "@/components/map/TrackedMarker";
export { initialRegionFrom } from "./MapRegion";

const AUCKLAND_BOUNDS = {
  northEast: { latitude: -36.56, longitude: 175.15 },
  southWest: { latitude: -37.15, longitude: 174.4 },
};

export type ConeMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
};

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
      minZoomLevel={10}
      maxZoomLevel={20}
    >
      {cones.map((c) => (
        <TrackedMarker
          key={c.id} // Stable key prevents unmounting flicker
          cone={c}
          selected={selectedConeId === c.id}
          completed={completedIds.has(c.id)}
          onPress={handlePress}
        />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});