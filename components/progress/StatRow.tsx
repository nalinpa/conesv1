import React from "react";
import { View, StyleSheet } from "react-native";

import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";

export function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  const isPrimitive = typeof value === "string" || typeof value === "number";

  return (
    <Row align="baseline" gap="sm">
      <AppText variant="hint">{label}</AppText>

      {isPrimitive ? (
        <AppText variant="sectionTitle" style={styles.valueText}>
          {value}
        </AppText>
      ) : (
        <View>{value}</View>
      )}
    </Row>
  );
}

const styles = StyleSheet.create({
  valueText: {
    fontWeight: "900",
  },
});
