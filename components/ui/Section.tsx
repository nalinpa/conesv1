import React from "react";
import { View } from "react-native";
import { space } from "@/lib/ui/tokens";
import { AppText } from "./AppText";
import { Row } from "./Row";

export function Section({
  title,
  rightSlot,
  children,
}: {
  title?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: space.md }}>
      {title ? (
        <Row justify="space-between">
          <AppText variant="sectionTitle">{title}</AppText>
          {rightSlot}
        </Row>
      ) : null}

      {children}
    </View>
  );
}
