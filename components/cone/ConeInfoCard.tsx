// components/cone/ConeInfoCard.tsx
import React from "react";
import { View } from "react-native";
import { Card, Text } from "@ui-kitten/components";
import { Pill } from "@/components/ui/Pill";

export function ConeInfoCard({
  name,
  description,
  slug,
  radiusMeters,
}: {
  name: string;
  description?: string;
  slug?: string;
  radiusMeters?: number | null;
}) {
  return (
    <Card style={{ borderRadius: 18, padding: 16 }}>
      <View style={{ gap: 10 }}>
        {/* Title */}
        <Text category="h5" style={{ fontWeight: "900" }}>
          {name}
        </Text>

        {/* Description */}
        <Text appearance="hint">
          {description?.trim() ? description.trim() : "No description yet."}
        </Text>

        {/* Meta pills */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {radiusMeters != null ? <Pill>Radius {radiusMeters}m</Pill> : null}
          {slug ? <Pill>{slug}</Pill> : null}
        </View>
      </View>
    </Card>
  );
}
