import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Cones",
  slug: "cones",
  scheme: "cones",
  version: "1.0.2",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F8FAFC",
  },

  android: {
    package: "app.kompletion.cones",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F8FAFC",
    },
    config: {
      googleMaps: {
        apiKey: process.env.GMAPS_API_KEY,
      },
    },
    edgeToEdgeEnabled: true,
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.kompletion.cones",
    config: {
      googleMapsApiKey: process.env.GMAPS_API_KEY,
    },
    infoPlist: {
      NSCameraUsageDescription:
        "We need camera access so you can take photos of your summit conquests.",
      NSPhotoLibraryUsageDescription:
        "We need access to your photo library to memorialize your volcano visits.",
      NSLocationWhenInUseUsageDescription:
        "Cones uses your location to verify your summit visits.",
    },
  },

  plugins: [
    "expo-router",
    [
      "expo-image-picker",
      {
        photosPermission: "We need access to your photo library.",
        cameraPermission: "We need camera access.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Cones uses your location to verify summit visits.",
      },
    ],
  ],

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
});
