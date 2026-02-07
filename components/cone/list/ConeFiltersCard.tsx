import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import type { ConeCategory, ConeRegion } from "@/lib/models";

import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { CardShell } from "@/components/ui/CardShell";
import { AppButton } from "@/components/ui/AppButton";
import { AppIconButton } from "@/components/ui/AppIconButton";

import { ChevronDown, ChevronUp } from "lucide-react-native";
import { space } from "@/lib/ui/tokens";

/* ---------------------------------
 * Options
 * --------------------------------- */

const REGIONS: Array<{ label: string; value: ConeRegion | "all" }> = [
  { label: "All", value: "all" },
  { label: "North", value: "north" },
  { label: "Central", value: "central" },
  { label: "East", value: "east" },
  { label: "South", value: "south" },
  { label: "Harbour", value: "harbour" },
];

const CATEGORIES: Array<{ label: string; value: ConeCategory | "all" }> = [
  { label: "All", value: "all" },
  { label: "Cone", value: "cone" },
  { label: "Crater", value: "crater" },
  { label: "Lake", value: "lake" },
  { label: "Other", value: "other" },
];

export type ConeFiltersValue = {
  hideCompleted: boolean;
  region: ConeRegion | "all";
  category: ConeCategory | "all";
};

const DEFAULT_FILTERS: ConeFiltersValue = {
  hideCompleted: true,
  region: "all",
  category: "all",
};

function labelFor<T extends string>(
  opts: Array<{ label: string; value: T }>,
  v: T,
): string {
  return opts.find((o) => o.value === v)?.label ?? String(v);
}

/* ---------------------------------
 * Chip (quiet)
 * --------------------------------- */

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <AppButton
      size="xs"
      variant={selected ? "secondary" : "ghost"}
      onPress={onPress}
      style={{
        borderRadius: 999,
        minHeight: 32,
        paddingHorizontal: space.sm,
      }}
    >
      {label}
    </AppButton>
  );
}

/* ---------------------------------
 * Component
 * --------------------------------- */

export function ConeFiltersCard({
  value,
  onChange,
  completedCount,
  completionsLoading,
  completionsErr,
  shownCount,
  defaultExpanded = false,
}: {
  value: ConeFiltersValue;
  onChange: (next: ConeFiltersValue) => void;
  completedCount: number;
  completionsLoading: boolean;
  completionsErr: string;
  shownCount: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const patch = useCallback(
    (p: Partial<ConeFiltersValue>) => onChange({ ...value, ...p }),
    [onChange, value],
  );

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (value.hideCompleted) parts.push("hide completed");
    if (value.region !== "all")
      parts.push(labelFor(REGIONS as any, value.region as any));
    if (value.category !== "all")
      parts.push(labelFor(CATEGORIES as any, value.category as any));
    return parts.length ? parts.join(" • ") : "none";
  }, [value]);

  /* ============================
   * COLLAPSED BAR
   * ============================ */
  if (!expanded) {
    return (
      <View
        style={{
            marginHorizontal: -space.md,
            paddingVertical: space.sm,
            paddingHorizontal: space.md,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "rgba(0,0,0,0.06)",
            backgroundColor: "rgba(0,0,0,0.02)",
        }}
        >
        <Row justify="space-between" align="center">
          <AppText variant="hint" numberOfLines={1}>
            Filters: {summary}
          </AppText>

          <AppIconButton
            icon={ChevronDown}
            size={18}
            onPress={() => setExpanded(true)}
            accessibilityLabel="Show filters"
          />
        </Row>
      </View>
    );
  }

  /* ============================
   * EXPANDED PANEL
   * ============================ */
  return (
    <CardShell>
      <Stack gap="sm">
        <Row justify="space-between" align="center">
          <AppText variant="label">Filters</AppText>

          <AppIconButton
            icon={ChevronUp}
            size={18}
            onPress={() => setExpanded(false)}
            accessibilityLabel="Hide filters"
          />
        </Row>

        {/* Completed */}
        <Stack gap="xs">
          <AppText variant="hint">Completed</AppText>

          <Row gap="xs" align="center" style={{ flexWrap: "wrap" }}>
            <Chip
              label="Hide"
              selected={value.hideCompleted}
              onPress={() => patch({ hideCompleted: true })}
            />
            <Chip
              label="Show"
              selected={!value.hideCompleted}
              onPress={() => patch({ hideCompleted: false })}
            />

            <View style={{ flex: 1 }} />

            <AppText variant="hint">
              {completionsLoading
                ? "Loading…"
                : `${completedCount} completed`}
            </AppText>
          </Row>

          {completionsErr ? (
            <AppText variant="hint" numberOfLines={2}>
              {completionsErr}
            </AppText>
          ) : null}
        </Stack>

        {/* Region */}
        <Stack gap="xs">
          <AppText variant="hint">Region</AppText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Row gap="xs" style={{ paddingVertical: 2 }}>
              {REGIONS.map((r) => (
                <Chip
                  key={r.value}
                  label={r.label}
                  selected={value.region === r.value}
                  onPress={() => patch({ region: r.value })}
                />
              ))}
            </Row>
          </ScrollView>
        </Stack>

        {/* Category */}
        <Stack gap="xs">
          <AppText variant="hint">Type</AppText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Row gap="xs" style={{ paddingVertical: 2 }}>
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.value}
                  label={c.label}
                  selected={value.category === c.value}
                  onPress={() => patch({ category: c.value })}
                />
              ))}
            </Row>
          </ScrollView>
        </Stack>

        <Row justify="flex-end">
          <AppText variant="hint">Showing {shownCount}</AppText>
        </Row>
      </Stack>
    </CardShell>
  );
}
