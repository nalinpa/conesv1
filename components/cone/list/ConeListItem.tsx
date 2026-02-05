import React from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { formatDistanceMeters } from "@/lib/formatters";

type ConeListItemProps = {
  id: string;
  name: string;
  description?: string;
  region?: string | null;
  category?: string | null; // acts as "type" label (cone/crater/...)
  completed?: boolean;
  distanceMeters?: number | null;
  onPress: (coneId: string) => void;
};

function cleanLabel(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  return s ? s : fallback;
}

function titleCase(s: string): string {
  // lightweight, avoids extra deps; keeps "north" -> "North"
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function ConeListItem({
  id,
  name,
  description,
  region,
  category,
  completed = false,
  distanceMeters,
  onPress,
}: ConeListItemProps) {
  const regionLabel = titleCase(cleanLabel(region, "Unknown region"));
  const typeLabel = titleCase(cleanLabel(category, "Unknown type"));

  return (
    <CardShell onPress={() => onPress(id)}>
      <View style={{ gap: 10 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flexShrink: 1, gap: 6 }}>
            <Text
              category="s1"
              style={{
                fontWeight: "900",
                opacity: completed ? 0.72 : 1,
              }}
              numberOfLines={1}
            >
              {name}
            </Text>

            {/* Chips row: region + type always */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Pill status="basic">{regionLabel}</Pill>
              <Pill status="basic">{typeLabel}</Pill>
            </View>
          </View>

          {/* Completed indicator: only show when completed (avoid noisy "Not completed") */}
          {completed ? <Pill status="success">Completed</Pill> : null}
        </View>

        {/* Description */}
        {description?.trim() ? (
          <Text appearance="hint" numberOfLines={2} style={{ opacity: completed ? 0.75 : 1 }}>
            {description.trim()}
          </Text>
        ) : null}

        {/* Meta row */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {distanceMeters != null ? (
            <Pill status="basic">{formatDistanceMeters(distanceMeters)}</Pill>
          ) : null}
        </View>
      </View>
    </CardShell>
  );
}
