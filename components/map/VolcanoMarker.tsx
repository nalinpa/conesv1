import React from "react";
import { View, StyleSheet } from "react-native";
import { Mountain, Check } from "lucide-react-native";

const WRAPPER_SIZE = 36;
const BG_COLOR = "white";

export function VolcanoMarker({
  selected,
  completed,
}: {
  selected: boolean;
  completed: boolean;
}) {
  const coneColor = completed ? "rgba(95,179,162,1)" : "rgba(71,85,105,1)";

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrapper,
        selected ? styles.wrapperSelected : styles.wrapperUnselected,
      ]}
    >
      <Mountain size={20} color={coneColor} strokeWidth={2.5} />

      {/* Completed badge */}
      {completed ? (
        <View style={[styles.badge, styles.badgeBorder]}>
          <Check size={12} color="#fff" strokeWidth={3.5} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: WRAPPER_SIZE,
    height: WRAPPER_SIZE,
    borderRadius: WRAPPER_SIZE / 2,
    backgroundColor: BG_COLOR,
  },
  wrapperSelected: {
    borderWidth: 3,
    borderColor: "rgba(95,179,162,1)", // Solid surf green
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4.5,
  },
  wrapperUnselected: {
    borderWidth: 2,
    // Darker, much more opaque slate border so it doesn't blend into the map
    borderColor: "rgba(71,85,105,0.85)", 
    // Higher elevation/shadow so it pops off the map layer
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
  },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(34,197,94,1)", // Solid green
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeBorder: {
    borderColor: BG_COLOR,
  },
});