import React from "react";
import { View, StyleSheet } from "react-native";
import { Check, MountainIcon } from "lucide-react-native";

// Total canvas size needs to be larger than the circle to account for shadows and badges
const CANVAS_SIZE = 37; 
const CIRCLE_SIZE = 32; 
const BG_COLOR = "white";

export function VolcanoMarker({
  selected,
  completed,
}: {
  selected: boolean;
  completed: boolean;
}) {
  const coneColor = completed ? "rgba(95,179,162,1)" : "rgba(30, 41, 59, 1)";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          selected ? styles.selected : styles.unselected,
        ]}
      >
        <MountainIcon 
          size={20} 
          color={coneColor} 
          fill={selected ? coneColor : "transparent"} 
          strokeWidth={2.5} 
        />
      </View>

      {completed && (
        <View style={styles.badge}>
          <Check size={10} color="#fff" strokeWidth={4} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", 
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: BG_COLOR,
    borderWidth: 2,
  },
  unselected: {
    borderColor: "rgba(30, 41, 59, 0.8)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selected: {
    borderColor: "rgba(95,179,162,1)",
    borderWidth: 3,
    transform: [{ scale: 1.1 }], 
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(34,197,94,1)",
    borderWidth: 2,
    borderColor: BG_COLOR,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});