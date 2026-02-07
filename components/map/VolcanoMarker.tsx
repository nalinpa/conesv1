import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function VolcanoMarker({
  selected,
  completed,
}: {
  selected: boolean;
  completed: boolean;
}) {
  const wrapperSize = selected ? 36 : 34;

  // 🔹 Outline logic
  const outlineColor = selected
    ? "rgba(95,179,162,0.95)"     // surf green (selected)
    : "rgba(148,163,184,0.6)";   // slate-400-ish (unselected)

  const outlineWidth = selected ? 3 : 2;

  const bgColor = "white";

  // 🔸 Icon colors stay the SAME regardless of selection
  const coneColor = completed
    ? "rgba(95,179,162,1)"
    : "rgba(71,85,105,0.95)";

  const flameColor = completed
    ? "rgba(34,197,94,0.95)"
    : "rgba(245,158,11,0.95)";

  return (
    <View
      pointerEvents="none"
      style={{
        width: wrapperSize,
        height: wrapperSize,
        borderRadius: wrapperSize / 2,
        backgroundColor: bgColor,
        borderWidth: outlineWidth,
        borderColor: outlineColor,
        alignItems: "center",
        justifyContent: "center",
        elevation: selected ? 4 : 2,
        paddingTop: 4,
      }}
    >
      {/* Volcano cone */}
      <Ionicons name="triangle" size={26} color={coneColor} />

      {/* Lava flame */}
      <View style={{ position: "absolute", top: 10 }}>
        <Ionicons name="flame" size={16} color={flameColor} />
      </View>

      {/* Completed badge */}
      {completed ? (
        <View
          style={{
            position: "absolute",
            right: 2,
            top: 2,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "rgba(34,197,94,0.95)",
            borderWidth: 2,
            borderColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      ) : null}
    </View>
  );
}
