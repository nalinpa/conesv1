import React from "react";
import { Tabs } from "expo-router";
import { BottomNavigation, BottomNavigationTab, useTheme } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { goProgressHome, goConesHome, goMapHome } from "@/lib/routes";

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

/**
 * Eva BottomNavigation passes slightly different props shapes depending on version.
 * We defensively read tintColor.
 */
function tintFromProps(props: any): string | undefined {
  return props?.style?.tintColor ?? props?.tintColor ?? props?.style?.color ?? props?.color;
}

function KittenTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const onSelect = (index: number) => {
    const route = state.routes[index];
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (event.defaultPrevented) return;

    if (route.name === "cones") return goConesHome();
    if (route.name === "progress") return goProgressHome();
    if (route.name === "map") return goMapHome();

    navigation.navigate(route.name);
  };

  const activeIndex = state.index;

  const bg = theme["background-basic-color-1"] ?? "#FFFFFF";
  const border = theme["border-basic-color-3"] ?? "rgba(0,0,0,0.12)";
  const activeBg = theme["color-primary-100"] ?? "rgba(95,179,162,0.18)";
  const activeTint = theme["color-primary-600"] ?? theme["color-primary-500"] ?? "#5FB3A2";

  const icon = (name: keyof typeof Ionicons.glyphMap, tabIndex: number) => (props: any) => {
    const tint = tintFromProps(props) ?? (tabIndex === activeIndex ? activeTint : undefined);
    const isActive = tabIndex === activeIndex;

    return (
      <React.Fragment>
        {/* Active "chip" behind icon */}
        {isActive ? (
          <React.Fragment>
            {/* using a simple view-like style via wrapper */}
          </React.Fragment>
        ) : null}

        <Ionicon name={name} color={tint} size={28} />
      </React.Fragment>
    );
  };

  // We can't directly wrap the icon with a View via BottomNavigationTab's icon prop
  // in a typed-safe way across Eva versions, so we use the 'iconStyle' for chip effect
  // by styling the tab itself.
  const tabStyle = (tabIndex: number) => {
    const isActive = tabIndex === activeIndex;
    return {
      paddingVertical: 10,
      borderRadius: 18,
      marginHorizontal: 6,
      backgroundColor: isActive ? activeBg : "transparent",
    } as const;
  };

  return (
    <BottomNavigation
      selectedIndex={activeIndex}
      onSelect={onSelect}
      appearance="noIndicator"
      style={{
        backgroundColor: bg,
        borderTopWidth: 1,
        borderTopColor: border,

        paddingTop: 10,
        paddingBottom: Math.max(14, insets.bottom),
        paddingHorizontal: 10,
      }}
    >
      <BottomNavigationTab
        title="Cones"
        style={tabStyle(0)}
        titleStyle={{
          fontWeight: activeIndex === 0 ? "900" : "800",
          fontSize: 13,
          marginTop: 2,
        }}
        icon={icon("triangle-outline", 0)}
      />

      <BottomNavigationTab
        title="Progress"
        style={tabStyle(1)}
        titleStyle={{
          fontWeight: activeIndex === 1 ? "900" : "800",
          fontSize: 13,
          marginTop: 2,
        }}
        icon={icon("stats-chart-outline", 1)}
      />

      <BottomNavigationTab
        title="Map"
        style={tabStyle(2)}
        titleStyle={{
          fontWeight: activeIndex === 2 ? "900" : "800",
          fontSize: 13,
          marginTop: 2,
        }}
        icon={icon("map-outline", 2)}
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
      <Tabs.Screen name="cones" options={{ href: "/(tabs)/cones" }} />
      <Tabs.Screen name="progress" options={{ href: "/(tabs)/progress" }} />
      <Tabs.Screen name="map" options={{ href: "/(tabs)/map" }} />
    </Tabs>
  );
}
