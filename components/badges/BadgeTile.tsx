import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@ui-kitten/components";

import { Pill } from "@/components/ui/Pill";

export function BadgeTile({
  name,
  unlockText,
  unlocked,
  progressLabel,
}: {
  name: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel?: string | null;
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.card, unlocked ? styles.cardUnlocked : styles.cardLocked]}>
        <Text category="s1" style={styles.name}>
          {name}
        </Text>

        <Text appearance="hint" style={styles.description}>
          {unlockText}
        </Text>

        <View style={styles.footer}>
          {unlocked ? (
            <Pill status="success">Earned</Pill>
          ) : progressLabel ? (
            <Text appearance="hint" category="c1">
              {progressLabel}
            </Text>
          ) : (
            <Text appearance="hint" category="c1">
              In progress
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  cardUnlocked: {
    opacity: 1,
  },
  cardLocked: {
    opacity: 0.55,
  },
  name: {
    fontWeight: "800",
  },
  description: {
    marginTop: 6,
  },
  footer: {
    marginTop: 10,
  },
});
