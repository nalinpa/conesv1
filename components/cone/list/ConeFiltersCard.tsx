import React, { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronDown, ChevronUp, Filter, CheckCircle2, Circle } from "lucide-react-native";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

const REGIONS = [
  { label: "All Regions", value: "all" },
  { label: "North", value: "north" },
  { label: "Central", value: "central" },
  { label: "East", value: "east" },
  { label: "South", value: "south" },
  { label: "Harbour", value: "harbour" },
];

const CATEGORIES = [
  { label: "All Types", value: "all" },
  { label: "Cone", value: "cone" },
  { label: "Crater", value: "crater" },
  { label: "Lake", value: "lake" },
  { label: "Other", value: "other" },
];

export function ConeFiltersCard({ value, onChange, shownCount }: any) {
  const [expanded, setExpanded] = useState(false);

  const toggleHideCompleted = () => {
    onChange({ ...value, hideCompleted: !value.hideCompleted });
  };

  return (
    <View style={styles.fullWidthContainer}>
      <Stack gap="md">
        {/* Top Toggle Bar */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => setExpanded(!expanded)}
          style={styles.mainToggle}
        >
          <Row justify="space-between" align="center">
            <Row gap="sm" align="center">
              <AppIcon icon={Filter} variant="surf" size={18} />
              <AppText variant="body" style={styles.bold}>
                {shownCount} Volcanoes shown
              </AppText>
            </Row>
            <AppIcon icon={expanded ? ChevronUp : ChevronDown} variant="hint" size={20} />
          </Row>
        </TouchableOpacity>

        {expanded && (
          <Stack gap="lg" style={styles.expandedContent}>
            {/* Hide Completed Toggle */}
            <TouchableOpacity onPress={toggleHideCompleted} style={styles.filterRow}>
              <Row justify="space-between" align="center">
                <AppText variant="body">Hide visited peaks</AppText>
                <AppIcon 
                  icon={value.hideCompleted ? CheckCircle2 : Circle} 
                  variant={value.hideCompleted ? "surf" : "hint"} 
                  size={24} 
                />
              </Row>
            </TouchableOpacity>

            {/* Region Selector */}
            <Stack gap="xs">
              <AppText variant="label" status="hint" style={styles.label}>REGION</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {REGIONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => onChange({ ...value, region: r.value })}
                    style={[styles.chip, value.region === r.value && styles.activeChip]}
                  >
                    <AppText 
                      variant="label" 
                      style={[styles.chipText, value.region === r.value && styles.activeChipText]}
                    >
                      {r.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Stack>

            {/* Category Selector */}
            <Stack gap="xs">
              <AppText variant="label" status="hint" style={styles.label}>TYPE</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => onChange({ ...value, category: c.value })}
                    style={[styles.chip, value.category === c.value && styles.activeChip]}
                  >
                    <AppText 
                      variant="label" 
                      style={[styles.chipText, value.category === c.value && styles.activeChipText]}
                    >
                      {c.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Stack>
          </Stack>
        )}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidthContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: space.md,
    // Negative margin to bleed out of parent padding if necessary
    marginHorizontal: -16, 
    paddingHorizontal: 16,
  },
  mainToggle: {
    paddingVertical: 4,
  },
  bold: { fontWeight: "800" },
  expandedContent: {
    marginTop: space.sm,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  filterRow: {
    paddingVertical: 4,
  },
  label: {
    letterSpacing: 1,
    marginBottom: 4,
  },
  chipScroll: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeChip: {
    backgroundColor: "#66B2A2",
    borderColor: "#66B2A2",
  },
  chipText: {
    color: "#64748B",
    fontWeight: "700",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
});