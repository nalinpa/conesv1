import React from "react";
import { Tabs } from "expo-router";
import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { goProgressHome, goConesHome, goMapHome } from "@/lib/routes";

function Ionicon({
  name,
  color,
  size = 22,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function KittenTabBar({
  state,
  navigation,
}: {
  state: any;
  navigation: any;
}) {
  const insets = useSafeAreaInsets();

  const onSelect = (index: number) => {
    const route = state.routes[index];
    if (!route) return;

    // Preserve tab semantics (scroll-to-top handlers, etc)
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (event.defaultPrevented) return;

    // Force these tabs to always land on their index route
    // (prevents being "stuck" on nested screens like /progress/badges)
    if (route.name === "cones") {
      goConesHome();
      return;
    }

    if (route.name === "progress") {
      goProgressHome();
      return;
    }

    // Map can behave normally (or force it too if you want)
    if (route.name === "map") {
      goMapHome();
      return;
    }

    // Fallback
    navigation.navigate(route.name);
  };

  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={onSelect}
      appearance="noIndicator"
      style={{
        paddingTop: 10,
        paddingBottom: Math.max(12, insets.bottom),
      }}
    >
      <BottomNavigationTab
        title="Cones"
        icon={({ style }) => (
          <Ionicon name="triangle-outline" color={style?.tintColor} size={22} />
        )}
      />
      <BottomNavigationTab
        title="Progress"
        icon={({ style }) => (
          <Ionicon name="stats-chart-outline" color={style?.tintColor} size={22} />
        )}
      />
      <BottomNavigationTab
        title="Map"
        icon={({ style }) => (
          <Ionicon name="map-outline" color={style?.tintColor} size={22} />
        )}
      />
    </BottomNavigation>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <KittenTabBar {...props} />}
    >
      {/* href pins the tab route to the index as well (nice extra safety) */}
      <Tabs.Screen name="cones" options={{ href: "/(tabs)/cones" }} />
      <Tabs.Screen name="progress" options={{ href: "/(tabs)/progress" }} />
      <Tabs.Screen name="map" options={{ href: "/(tabs)/map" }} />
    </Tabs>
  );
}
