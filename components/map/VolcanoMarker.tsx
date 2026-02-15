import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const WRAPPER_SIZE = 36;
const BG_COLOR = "white";

export function VolcanoMarker({
  selected,
  completed,
}: {
  selected: boolean;
  completed: boolean;
}) {
  // 🔸 Icon colors stay the SAME regardless of selection
  const coneColor = completed ? "rgba(95,179,162,1)" : "rgba(71,85,105,0.95)";

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrapper,
        selected ? styles.wrapperSelected : styles.wrapperUnselected,
      ]}
    >
      <MaterialCommunityIcons name="terrain" size={22} color={coneColor} />

      {/* Completed badge */}
      {completed ? (
        <View style={[styles.badge, styles.badgeBorder]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
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
    borderColor: "rgba(95,179,162,0.95)", // surf green
    elevation: 4,
    // iOS shadow for parity with Android elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wrapperUnselected: {
    borderWidth: 2,
    borderColor: "rgba(148,163,184,0.6)", // slate-400
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(34,197,94,0.95)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeBorder: {
    borderColor: BG_COLOR,
  },
});
