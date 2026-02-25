import React from "react";
import { View, StyleSheet } from "react-native";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";

export function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const isPrimitive = typeof value === "string" || typeof value === "number";

  return (
    <Row align="center" justify="space-between" style={styles.container}>
      <Row align="center" gap="xs">
        {icon}
        <AppText variant="label" status="hint">
          {label}
        </AppText>
      </Row>

      {isPrimitive ? (
        <AppText variant="body" style={styles.valueText}>
          {value}
        </AppText>
      ) : (
        <View>{value}</View>
      )}
    </Row>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 2,
  },
  valueText: {
    fontWeight: "900",
  },
});
