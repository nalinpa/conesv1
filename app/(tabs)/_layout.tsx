import { Tabs, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "../../lib/firebase";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!loggedIn) {
    return <Redirect href="/login" />;
  }

  /**
   * DESIGN CONSTANTS
   */
  const TAB_BAR_BASE_HEIGHT = 56; // visual bar height (icons + labels)
  const EXTRA_BOTTOM_SPACE = 12;  // breathing room below bar

  return (
    <View className="flex-1 bg-background">
      <Tabs
        initialRouteName="progress"
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: "#4f46e5",
          tabBarInactiveTintColor: "#64748b",

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },

          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#e2e8f0",

            // ✅ space INSIDE the bar (icons/labels)
            paddingTop: 8,

            // ✅ space BELOW the bar (home indicator / gesture area)
            paddingBottom: insets.bottom + EXTRA_BOTTOM_SPACE,

            // ✅ total bar height accounts for safe area
            height:
              TAB_BAR_BASE_HEIGHT +
              insets.bottom +
              EXTRA_BOTTOM_SPACE,
          },
        }}
      >
        <Tabs.Screen
          name="cones"
          options={{
            title: "Cones",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "list" : "list-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "trophy" : "trophy-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
