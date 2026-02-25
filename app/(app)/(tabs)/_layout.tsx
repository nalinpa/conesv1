import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { BottomNavigation, BottomNavigationTab, useTheme } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  goProgressHome,
  goConesHome,
  goMapHome,
  goAccountHome,
} from "../../../lib/routes";
import { useSession } from "../../../lib/providers/SessionProvider";

const ALL_TABS: Array<{
  key: "cones" | "progress" | "map" | "account";
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "cones", title: "Cones", icon: "triangle-outline", activeIcon: "triangle" },
  {
    key: "progress",
    title: "Progress",
    icon: "stats-chart-outline",
    activeIcon: "stats-chart",
  },
  { key: "map", title: "Map", icon: "map-outline", activeIcon: "map" },
  { key: "account", title: "Profile", icon: "person-outline", activeIcon: "person" },
];

function KittenTabBar({ state }: any) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { session } = useSession();

  const isGuest = session.status === "guest";
  const sessionLoading = session.status === "loading";

  const visibleTabs = useMemo(
    () => (isGuest ? ALL_TABS.filter((t) => t.key !== "progress") : ALL_TABS),
    [isGuest],
  );

  const activeRouteName = state.routes[state.index]?.name ?? "cones";

  const visibleActiveIndex = useMemo(() => {
    const idx = visibleTabs.findIndex((t) => t.key === activeRouteName);
    return idx >= 0 ? idx : 0;
  }, [visibleTabs, activeRouteName]);

  const activeTint = "#66B2A2";
  const activeBg = "#66B2A215";

  const onSelect = (index: number) => {
    if (sessionLoading) return;
    const tab = visibleTabs[index];
    if (tab.key === "cones") return goConesHome();
    if (tab.key === "progress") return goProgressHome();
    if (tab.key === "map") return goMapHome();
    if (tab.key === "account") return goAccountHome();
  };

  return (
    <BottomNavigation
      selectedIndex={visibleActiveIndex}
      onSelect={onSelect}
      appearance="noIndicator"
      style={[
        styles.bottomNav,
        {
          backgroundColor: theme["background-basic-color-1"],
          borderTopColor: theme["border-basic-color-3"],
          paddingBottom: Math.max(20, insets.bottom),
        },
      ]}
    >
      {visibleTabs.map((t) => {
        const isActive = t.key === activeRouteName;
        return (
          <BottomNavigationTab
            key={t.key}
            title={t.title}
            style={[styles.tab, isActive && { backgroundColor: activeBg }]}
            icon={() => (
              <Ionicons
                name={isActive ? t.activeIcon : t.icon}
                size={24}
                color={isActive ? activeTint : theme["text-hint-color"]}
              />
            )}
          />
        );
      })}
    </BottomNavigation>
  );
}

export default function TabsLayout() {
  const { session } = useSession();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <KittenTabBar {...props} />}
    >
      <Tabs.Screen name="cones" options={{ href: "/(tabs)/cones" }} />
      <Tabs.Screen
        name="progress"
        options={{ href: session.status === "guest" ? null : "/(tabs)/progress" }}
      />
      <Tabs.Screen name="map" options={{ href: "/(tabs)/map" }} />
      <Tabs.Screen name="account" options={{ href: "/(tabs)/account" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 8,
    borderRadius: 14,
    marginHorizontal: 4,
  },
});
