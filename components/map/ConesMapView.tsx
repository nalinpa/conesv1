import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import MapView from "react-native-map-clustering";
import { PROVIDER_GOOGLE, Region } from "react-native-maps";

import { TrackedMarker } from "@/components/map/TrackedMarker";
export { initialRegionFrom } from "./MapRegion";

const AUCKLAND_BOUNDS = {
  northEast: { latitude: -36.56, longitude: 175.15 },
  southWest: { latitude: -37.15, longitude: 174.4 },
};

const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#D1EEDC" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#E8F5E9" }],
  },
  {
    featureType: "landscape",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape.natural.terrain",
    elementType: "geometry",
    stylers: [{ visibility: "on" }, { lightness: -5 }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }, { lightness: 10 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#C3E1FF" }],
  },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

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

  // Animate to cone when selected - adding a small offset to account for bottom sheet/overlay
  useEffect(() => {
    if (selectedConeId && mapRef.current) {
      const cone = cones.find((c) => c.id === selectedConeId);
      if (cone) {
        (mapRef.current as any).animateToRegion(
          {
            latitude: cone.lat - 0.005, // Offset so the cone isn't hidden by the MapOverlay
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
      (mapRef.current as any).setMapBoundaries(
        AUCKLAND_BOUNDS.northEast,
        AUCKLAND_BOUNDS.southWest,
      );
    }
  }, []);

  // PERFORMANCE OPTIMIZATION: Memoize the markers list
  // This prevents the map from having to "re-diff" 50+ components
  // every time the user's live location (outside this component) changes.
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
      moveOnMarkerPress={false}
      // Clustering Optimizations
      radius={50} // Radius of each cluster (pixels)
      extent={512} // Tile size
      nodeSize={64} // Higher = faster rendering, but less accurate clusters
      clusterColor="#66B2A2"
      clusterTextColor="#FFFFFF"
      // Helps with markers that move or change state
      animationEnabled={true}
      preserveClusterPressBehavior={true}
    >
      {renderedMarkers}
    </MapView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
