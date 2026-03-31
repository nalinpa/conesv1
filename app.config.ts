import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Cones",
  slug: "cones",
  scheme: "cones",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F8FAFC",
  },

  ios: {
    bundleIdentifier: "app.kompletion.cones",
    supportsTablet: false,
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    infoPlist: {
      NSCameraUsageDescription:
        "Cones needs camera access to capture and share photos of your volcano explorations.",
      NSPhotoLibraryUsageDescription:
        "Cones needs access to your photos so you can select and share your favorite shots.",
      NSLocationWhenInUseUsageDescription:
        "Cones uses your location to track your progress and verify when you have reached a volcano.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: "app.kompletion.cones",
    versionCode: 1,
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F8FAFC",
    },
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    edgeToEdgeEnabled: true,
  },

  plugins: [
    "expo-router",
    ["react-native-maps", {}],
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
          "Allow Cones to access your photos to share your volcanic adventures.",
        cameraPermission:
          "Allow Cones to use your camera to capture your summit moments.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Cones uses your location to track your distance and verify when you have reached a volcano.",
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          forceStaticLinking: ["RNFBApp", "RNFBAuth", "RNFBFirestore"],
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
