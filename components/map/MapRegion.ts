import type { Region } from "react-native-maps";

export function initialRegionFrom(
  userLat: number | null,
  userLng: number | null,
  cones: { lat: number; lng: number }[],
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
