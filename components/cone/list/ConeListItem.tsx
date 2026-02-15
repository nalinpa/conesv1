import React from "react";
import { View, StyleSheet } from "react-native";
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

  onPress: (id: string) => void;
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
      <View style={styles.container}>
        {/* Top row: title + distance */}
        <View style={styles.topRow}>
          <View style={styles.textContainer}>
            <Text
              category="s1"
              numberOfLines={1}
              style={[styles.title, completed && styles.titleCompleted]}
            >
              {name}
            </Text>

            {description?.trim() ? (
              <Text
                appearance="hint"
                numberOfLines={2}
                style={completed && styles.descCompleted}
              >
                {description.trim()}
              </Text>
            ) : null}
          </View>

          <View style={styles.rightContainer}>
            {/* Distance in top-right */}
            <Pill status={hasDistance ? "info" : "basic"}>{distanceLabel}</Pill>

            {/* Optional completed badge (quiet) */}
            {completed ? <Pill status="success">Visited</Pill> : null}
          </View>
        </View>

        {/* Bottom CTA row */}
        <View style={styles.bottomRow}>
          <AppButton
            variant={completed ? "secondary" : "primary"}
            size="md"
            onPress={() => onPress(id)}
            style={styles.button}
          >
            View details
          </AppButton>
        </View>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  textContainer: { flex: 1, gap: 6 },
  title: { fontWeight: "900" },
  titleCompleted: { opacity: 0.72 },
  descCompleted: { opacity: 0.75 },
  rightContainer: { alignItems: "flex-end", gap: 8 },
  bottomRow: { marginTop: 2 },
  button: {
    width: "100%",
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: space.lg,
  },
});
