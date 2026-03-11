import type { Region } from "react-native-maps";

// Default Auckland CBD center
const DEFAULT_CENTER = {
  latitude: -36.8485,
  longitude: 174.7633,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function initialRegionFrom(
  userLat: number | null,
  userLng: number | null,
  cones: { lat: number; lng: number }[],
): Region {
  // 1. Priority: User location (Zoomed in closer)
  if (userLat != null && userLng != null) {
    return {
      latitude: userLat,
      longitude: userLng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  // 2. Fallback: Center of all cones
  if (cones.length > 0) {
    // We calculate the min/max to find the true geographic center
    let minLat = cones[0].lat;
    let maxLat = cones[0].lat;
    let minLng = cones[0].lng;
    let maxLng = cones[0].lng;

    for (const cone of cones) {
      if (cone.lat < minLat) minLat = cone.lat;
      if (cone.lat > maxLat) maxLat = cone.lat;
      if (cone.lng < minLng) minLng = cone.lng;
      if (cone.lng > maxLng) maxLng = cone.lng;
    }

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.2, 0.12),
      longitudeDelta: Math.max((maxLng - minLng) * 1.2, 0.12),
    };
  }

  // 3. Ultimate Fallback: Auckland CBD
  return DEFAULT_CENTER;
}
