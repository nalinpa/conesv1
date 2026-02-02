import React, { useEffect, useRef } from "react";
import MapView, { Marker, Circle } from "react-native-maps";

type ConeLite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

export function ConesMapView({
  cones,
  completedIds,
  userLat,
  userLng,
  onPressCone,
}: {
  cones: ConeLite[];
  completedIds: Set<string>;
  userLat: number | null;
  userLng: number | null;
  onPressCone: (coneId: string) => void;
}) {
  const mapRef = useRef<MapView | null>(null);
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (userLat == null || userLng == null) return;
    if (!mapRef.current) return;
    if (hasCenteredRef.current) return;

    hasCenteredRef.current = true;

    mapRef.current.animateToRegion(
      {
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      },
      600,
    );
  }, [userLat, userLng]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      showsUserLocation
      initialRegion={{
        latitude: userLat ?? -36.8485,
        longitude: userLng ?? 174.7633,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      }}
    >
      {cones.map((cone) => {
        const completed = completedIds.has(cone.id);

        return (
          <React.Fragment key={cone.id}>
            <Circle
              center={{ latitude: cone.lat, longitude: cone.lng }}
              radius={cone.radiusMeters}
              strokeColor={completed ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}
              fillColor={completed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}
            />

            <Marker
              coordinate={{ latitude: cone.lat, longitude: cone.lng }}
              pinColor={completed ? "green" : "red"}
              title={cone.name}
              onPress={() => onPressCone(cone.id)}
            />
          </React.Fragment>
        );
      })}
    </MapView>
  );
}
