import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { BottomNavigation, BottomNavigationTab, useTheme } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Fixed imports to use relative paths to resolve aliasing issues in the environment
import {
  goProgressHome,
  goConesHome,
  goMapHome,
  goAccountHome,
} from "../../../lib/routes";
import { useSession } from "../../../lib/providers/SessionProvider";

function Ionicon({
  name,
  color,
  size = 26,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function tintFromProps(props: any): string | undefined {
  return (
    props?.style?.tintColor ?? props?.tintColor ?? props?.style?.color ?? props?.color
  );
}

type TabKey = "cones" | "progress" | "map" | "account";

const ALL_TABS: Array<{
  key: TabKey;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "cones", title: "Cones", icon: "triangle-outline" },
  { key: "progress", title: "Progress", icon: "stats-chart-outline" },
  { key: "map", title: "Map", icon: "map-outline" },
  { key: "account", title: "Account", icon: "person-outline" },
];

function KittenTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const { session } = useSession();
  const sessionLoading = session.status === "loading";
  const isGuest = session.status === "guest";

  const visibleTabs = useMemo(() => {
    // Guests can't use Progress, but Account remains (it can show “Sign in”)
    return isGuest ? ALL_TABS.filter((t) => t.key !== "progress") : ALL_TABS;
  }, [isGuest]);

  const activeRouteName = (state.routes[state.index]?.name ?? "cones") as TabKey;

  // If active route is hidden (guest deep-linked into "progress"), just highlight Map.
  const visibleActiveIndex = useMemo(() => {
    const idx = visibleTabs.findIndex((t) => t.key === activeRouteName);
    if (idx >= 0) return idx;

    const fallbackKey: TabKey = isGuest ? "map" : "progress";
    const fallbackIdx = visibleTabs.findIndex((t) => t.key === fallbackKey);
    return Math.max(0, fallbackIdx);
  }, [visibleTabs, activeRouteName, isGuest]);

  const bg = theme["background-basic-color-1"] ?? "#FFFFFF";
  const border = theme["border-basic-color-3"] ?? "rgba(0,0,0,0.12)";
  const activeBg = theme["color-primary-100"] ?? "rgba(95,179,162,0.18)";
  const activeTint =
    theme["color-primary-600"] ?? theme["color-primary-500"] ?? "#5FB3A2";

  const onSelectVisible = (visibleIndex: number) => {
    if (sessionLoading) return;

    const tab = visibleTabs[visibleIndex];
    if (!tab) return;

    const targetIndex = state.routes.findIndex((r: any) => r.name === tab.key);
    const targetRoute = state.routes[targetIndex];
    if (!targetRoute) return;

    const event = navigation.emit({
      type: "tabPress",
      target: targetRoute.key,
      canPreventDefault: true,
    });
    if (event.defaultPrevented) return;

    if (tab.key === "cones") return goConesHome();
    if (tab.key === "progress") return goProgressHome();
    if (tab.key === "map") return goMapHome();
    if (tab.key === "account") return goAccountHome();

    navigation.navigate(tab.key);
  };

  return (
    <BottomNavigation
      selectedIndex={visibleActiveIndex}
      onSelect={onSelectVisible}
      appearance="noIndicator"
      style={[
        styles.bottomNav,
        {
          backgroundColor: bg,
          borderTopColor: border,
          paddingBottom: Math.max(14, insets.bottom),
        },
      ]}
    >
      {visibleTabs.map((t) => {
        const isActive = t.key === activeRouteName;

        return (
          <BottomNavigationTab
            key={t.key}
            title={t.title}
            style={[
              styles.tab,
              isActive && { backgroundColor: activeBg },
              sessionLoading && styles.loadingOpacity,
            ]}
            titleStyle={[
              styles.title,
              isActive ? styles.titleActive : styles.titleInactive,
            ]}
            icon={(props: any) => {
              const tint = tintFromProps(props) ?? (isActive ? activeTint : undefined);
              return <Ionicon name={t.icon} color={tint} size={28} />;
            }}
          />
        );
      })}
    </BottomNavigation>
  );
}

export default function TabsLayout() {
  const { session } = useSession();
  const isGuest = session.status === "guest";

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <KittenTabBar {...props} />}
    >
      <Tabs.Screen name="cones" options={{ href: "/(tabs)/cones" }} />
      <Tabs.Screen
        name="progress"
        options={{
          href: isGuest ? null : "/(tabs)/progress",
        }}
      />
      <Tabs.Screen name="map" options={{ href: "/(tabs)/map" }} />
      <Tabs.Screen name="account" options={{ href: "/(tabs)/account" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 10,
    borderRadius: 18,
    marginHorizontal: 6,
  },
  loadingOpacity: {
    opacity: 0.7,
  },
  title: {
    fontSize: 13,
    marginTop: 2,
  },
  titleActive: {
    fontWeight: "900",
  },
  titleInactive: {
    fontWeight: "800",
  },
});
