import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Cones",
  slug: "cones",
  scheme: "cones",
  version: "1.0.2",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  android: {
    package: "app.kompletion.cones",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    config: {
      googleMaps: {
        apiKey: process.env.GMAPS_API_KEY,
      },
    },
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.kompletion.cones",
    config: {
      googleMapsApiKey: process.env.GMAPS_API_KEY,
    },
    // Adding infoPlist here guarantees Apple sees exactly these strings
    infoPlist: {
      NSCameraUsageDescription: "We need camera access so you can take photos of your summit conquests and attach them to your volcano visits.",
      NSPhotoLibraryUsageDescription: "We need access to your photo library so you can choose existing photos to memorialize your volcano visits.",
      NSLocationWhenInUseUsageDescription: "Cones uses your location to show how close you are to nearby craters and to verify your summit visits.",
    },
  },

  // Configure the Expo plugins to set up the native permissions properly
  plugins: [
    "expo-router",
    [
      "expo-image-picker",
      {
        photosPermission: "We need access to your photo library so you can choose existing photos to memorialize your volcano visits.",
        cameraPermission: "We need camera access so you can take photos of your summit conquests and attach them to your volcano visits."
      }
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Cones uses your location to show how close you are to nearby craters and to verify your summit visits."
      }
    ]
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
};

export default config;