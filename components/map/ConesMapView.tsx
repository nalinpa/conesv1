import React, { useRef, useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";

import { TrackedMarker } from "@/components/map/TrackedMarker";
export { initialRegionFrom } from "./MapRegion";

const AUCKLAND_BOUNDS = {
  northEast: { latitude: -36.56, longitude: 175.15 },
  southWest: { latitude: -37.15, longitude: 174.4 },
};

// Subtle, clean map style to make your markers pop
const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

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

  // Animate to cone when selected
  useEffect(() => {
    if (selectedConeId && mapRef.current) {
      const cone = cones.find((c) => c.id === selectedConeId);
      if (cone) {
        mapRef.current.animateToRegion(
          {
            latitude: cone.lat - 0.005, // Slightly offset so the bottom card doesn't hide it
            longitude: cone.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
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

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.flex1}
      initialRegion={initialRegion}
      customMapStyle={MAP_STYLE}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onMapReady={handleMapReady}
      minZoomLevel={10}
      maxZoomLevel={18}
      // Helps with performance during markers rendering
      moveOnMarkerPress={false}
    >
      {cones.map((c) => (
        <TrackedMarker
          key={c.id}
          cone={c}
          selected={selectedConeId === c.id}
          completed={completedIds.has(c.id)}
          onPress={onPressCone}
        />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
