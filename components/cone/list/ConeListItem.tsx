import React from "react";
import { StyleSheet } from "react-native";
import { Navigation, CheckCircle2, ChevronRight } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
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

  return (
    <CardShell onPress={() => onPress(id)} status={completed ? "basic" : "surf"}>
      <Stack gap="sm">
        {/* Top Header Row */}
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center" style={styles.flex1}>
            {completed && <AppIcon icon={CheckCircle2} size={18} variant="success" />}
            <AppText
              variant="sectionTitle"
              style={[styles.title, completed && styles.completedText]}
              numberOfLines={1}
            >
              {name}
            </AppText>
          </Row>

          {/* Inline Pills */}
          <Row gap="xs">
            {hasDistance && (
              <Pill status="surf" icon={Navigation}>
                {formatDistanceMeters(distanceMeters)}
              </Pill>
            )}
            {completed && <Pill status="success">Visited</Pill>}
          </Row>
        </Row>

        {/* Full-Width Description */}
        {description?.trim() ? (
          <AppText
            variant="body"
            status="hint"
            numberOfLines={3}
            style={[styles.description, completed && styles.completedText]}
          >
            {description.trim()}
          </AppText>
        ) : null}

        {/* Footer Action */}
        <Row justify="flex" style={styles.footer}>
          <Row gap="xs" align="center">
            <AppText
              variant="label"
              status={completed ? "hint" : "surf"}
              style={styles.bold}
            >
              View Details
            </AppText>
            <AppIcon
              icon={ChevronRight}
              size={14}
              variant={completed ? "hint" : "surf"}
            />
          </Row>
        </Row>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  title: {
    fontWeight: "900",
    color: "#0F172A",
    fontSize: 18,
  },
  description: {
    lineHeight: 20,
    width: "100%",
  },
  completedText: {
    opacity: 0.5,
  },
  footer: {
    marginTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: space.sm,
  },
  bold: {
    fontWeight: "800",
  },
});
