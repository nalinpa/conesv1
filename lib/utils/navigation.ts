import { Linking, Platform } from "react-native";

export const getDirections = (lat: number, lng: number, name: string) => {
  const destination = `${lat},${lng}`;

  // Create OS-specific map URLs
  const url = Platform.select({
    ios: `maps://app?daddr=${destination}&q=${name}`,
    android: `google.navigation:q=${destination}`,
  });

  if (url) {
    Linking.openURL(url).catch(() => {
      // Fallback to browser if the native maps app fails to open
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      );
    });
  }
};
