import React from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { AppButton } from "@/components/ui/AppButton";
import { formatDistanceMeters } from "@/lib/formatters";
import { space } from "@/lib/ui/tokens";

type ConeListItemProps = {
  id: string;
  name: string;
  description?: string;

  completed?: boolean;
  distanceMeters?: number | null;

  onPress: (coneId: string) => void;
};

export function ConeListItem({
  id,
  name,
  description,
  completed = false,
  distanceMeters,
  onPress,
}: ConeListItemProps) {
  const hasDistance = distanceMeters != null;
  const distanceLabel = hasDistance ? formatDistanceMeters(distanceMeters) : "—";

  return (
    <CardShell onPress={() => onPress(id)}>
      <View style={{ gap: 10 }}>
        {/* Top row: title + distance */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              category="s1"
              numberOfLines={1}
              style={{
                fontWeight: "900",
                opacity: completed ? 0.72 : 1,
              }}
            >
              {name}
            </Text>

            {description?.trim() ? (
              <Text appearance="hint" numberOfLines={2} style={{ opacity: completed ? 0.75 : 1 }}>
                {description.trim()}
              </Text>
            ) : null}
          </View>

          <View style={{ alignItems: "flex-end", gap: 8 }}>
            {/* Distance in top-right */}
            <Pill status={hasDistance ? "info" : "basic"}>{distanceLabel}</Pill>

            {/* Optional completed badge (quiet) */}
            {completed ? <Pill status="success">Visited</Pill> : null}
          </View>
        </View>

        {/* Bottom CTA row */}
        <View style={{ marginTop: 2 }}>
          <AppButton
            variant={completed ? "secondary" : "primary"}
            size="md"
            onPress={() => onPress(id)}
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 14,
              paddingHorizontal: space.lg,
            }}
          >
            View details
          </AppButton>
        </View>
      </View>
    </CardShell>
  );
}
