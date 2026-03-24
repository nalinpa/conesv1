import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";

import { TrackedMarker } from "@/components/map/TrackedMarker";
export { initialRegionFrom } from "./MapRegion";

const AUCKLAND_BOUNDS = {
  northEast: { latitude: -36.56, longitude: 175.15 },
  southWest: { latitude: -37.15, longitude: 174.4 },
};

export type ConeMapPoint = {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  radiusMeters?: number | null;
};

export const ConesMapView = React.memo(function ConesMapView({
  cones,
  completedIds,
  initialRegion,
  selectedConeId,
  onPressCone,
}: {
  cones: any[];
  completedIds: Set<string>;
  initialRegion: Region;
  selectedConeId: string | null;
  onPressCone: (coneId: string) => void;
}) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (selectedConeId && mapRef.current) {
      const cone = cones.find((c) => c.id === selectedConeId);
      if (cone) {
        mapRef.current.animateToRegion(
          {
            latitude: cone.lat - 0.005,
            longitude: cone.lng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          500,
        );
      }
    }
  }, [selectedConeId, cones]);

  const handleMapReady = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setMapBoundaries(
        AUCKLAND_BOUNDS.northEast,
        AUCKLAND_BOUNDS.southWest,
      );
    }
  }, []);

  const renderedMarkers = useMemo(() => {
    return cones.map((c) => (
      <TrackedMarker
        key={c.id}
        cone={c}
        selected={selectedConeId === c.id}
        completed={completedIds.has(c.id)}
        onPress={onPressCone}
      />
    ));
  }, [cones, completedIds, selectedConeId, onPressCone]);

  return (
    <MapView
      ref={mapRef}
      style={styles.flex1}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onMapReady={handleMapReady}
      minZoomLevel={10}
      maxZoomLevel={18}
      moveOnMarkerPress={false}
      showsTraffic={false}
      showsBuildings={false}
    >
      {renderedMarkers}
    </MapView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});