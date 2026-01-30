import React from "react";
import { Tabs } from "expo-router";
import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

    // Let React Navigation handle tab semantics properly.
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
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
      <Tabs.Screen name="cones" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="map" />
    </Tabs>
  );
}
