import React from "react";
import { StyleSheet } from "react-native";
import { MapPin, ChevronRight, Navigation } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { formatDistanceMeters } from "@/lib/formatters";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppButton } from "@/components/ui/AppButton";

export function NearestUnclimbedCard({
  cone,
  distanceMeters,
  locErr,
  onOpenCone,
}: any) {
  if (!cone) {
    return (
      <CardShell status="basic">
        <Row gap="sm" align="center">
          <AppIcon icon={Navigation} variant="hint" size={20} />
          <AppText variant="body" status="hint">
            {locErr ? "Enable location to find nearby cones" : "Finding your next summit..."}
          </AppText>
        </Row>
      </CardShell>
    );
  }

  return (
    <CardShell 
      status="surf" 
      onPress={() => onOpenCone(cone.id)}
      style={styles.card}
    >
      <Stack gap="md">
        <Row justify="space-between" align="center">
          <Row gap="xs" align="center">
            {/* Surf Green Icon for the "pop", but dark text for legibility */}
            <AppIcon icon={MapPin} variant="surf" size={18} />
            <AppText variant="label" style={styles.headerLabel}>
              NEXT MISSION
            </AppText>
          </Row>
          {distanceMeters != null && (
            <Pill status="surf">
              {formatDistanceMeters(distanceMeters)}
            </Pill>
          )}
        </Row>

        <Stack gap="xs">
          <AppText variant="h3" style={styles.coneName}>{cone.name}</AppText>
          <AppText variant="body" numberOfLines={2} style={styles.description}>
            {cone.description || "A volcanic peak waiting to be explored."}
          </AppText>
        </Stack>

        <AppButton 
          variant="primary" 
          size="sm" 
          onPress={() => onOpenCone(cone.id)}
          style={styles.button}
        >
          <Row gap="xs" align="center">
            <AppText variant="label" status="control">View Details</AppText>
            <AppIcon icon={ChevronRight} variant="control" size={16} />
          </Row>
        </AppButton>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0F9F7",
  },
  headerLabel: {
    fontWeight: "900",
    color: "#1E293B", 
    letterSpacing: 0.5,
  },
  coneName: {
    color: "#0F172A",
    fontWeight: "900",
  },
  description: {
    color: "#475569", 
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: "#66B2A2", 
  },
});