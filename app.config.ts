import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Cones",
  slug: "cones",
  scheme: "cones",
  version: "1.0.2",

  android: {
    package: "com.anonymous.cones",
    config: {
      googleMaps: {
        apiKey: process.env.GMAPS_API_KEY,
      },
    },
  },

  ios: {
    bundleIdentifier: "com.anonymous.cones",
    config: {
      googleMapsApiKey: process.env.GMAPS_API_KEY,
    },
  },

  extra: {
    eas: {
      projectId: "96e0a072-322d-4e01-a3b4-b4c6edc4cd9f", 
    },
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
  },
};

export default config;