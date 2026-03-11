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
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F8FAFC",
  },

  android: {
    package: "app.kompletion.cones",
    versionCode: 1,
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F8FAFC",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GMAPS_API_KEY,
      },
    },
    edgeToEdgeEnabled: true,
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.kompletion.cones",
    buildNumber: "1",
    googleServicesFile: "./GoogleService-Info.plist",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GMAPS_API_KEY,
    },
    infoPlist: {
      NSCameraUsageDescription:
        "Cones needs camera access so you can take photos of your volcano explorations.",
      NSPhotoLibraryUsageDescription:
        "Cones needs access to your photo library so you can attach photos of your visits.",
      NSLocationWhenInUseUsageDescription:
        "Cones uses your location to track your distance and verify when you have successfully reached a volcano.",
    },
  },

  plugins: [
    "expo-router",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "react-native",
        organization: "patel-td",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Cones needs access to your photo library so you can attach photos to your volcano reviews.",
        cameraPermission:
          "Cones needs camera access so you can take photos of your volcano explorations to add to your reviews.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Cones uses your location to track your distance and verify when you have successfully reached a volcano.",
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
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
