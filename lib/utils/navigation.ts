import { Linking, Platform } from "react-native";

/**
 * Opens the native Maps app for turn-by-turn directions.
 * @param lat Destination latitude
 * @param lng Destination longitude
 * @param name Destination label (e.g., "Mt Roskill")
 */
export const getDirections = (lat: number, lng: number, name?: string) => {
  const destination = `${lat},${lng}`;
  const label = name ? encodeURIComponent(name) : "";

  // iOS: maps://app?daddr=lat,lng&q=label 
  // Android: google.navigation:q=lat,lng
  const url = Platform.select({
    ios: `maps://app?daddr=${destination}${label ? `&q=${label}` : ""}`,
    android: `google.navigation:q=${destination}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  });

  if (url) {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Correct browser fallback to Google Maps
        const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        Linking.openURL(browserUrl);
      }
    }).catch((err) => console.error("Navigation Utility Error:", err));
  }
};