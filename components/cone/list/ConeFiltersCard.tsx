import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import type { ConeCategory, ConeRegion } from "@/lib/models";

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
  v: T
): string {
  return opts.find((o) => o.value === v)?.label ?? String(v);
}

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
    <Button
      size="tiny"
      appearance={selected ? "filled" : "outline"}
      onPress={onPress}
      style={{ borderRadius: 999, paddingHorizontal: 10 }}
    >
      {label}
    </Button>
  );
}

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
    [onChange, value]
  );

  const hasFilters =
    value.hideCompleted !== DEFAULT_FILTERS.hideCompleted ||
    value.region !== DEFAULT_FILTERS.region ||
    value.category !== DEFAULT_FILTERS.category;

  const onClear = useCallback(() => {
    onChange(DEFAULT_FILTERS);
  }, [onChange]);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (value.hideCompleted) parts.push("hide completed");
    if (value.region !== "all")
      parts.push(labelFor(REGIONS as any, value.region as any));
    if (value.category !== "all")
      parts.push(labelFor(CATEGORIES as any, value.category as any));
    return parts.length ? parts.join(" • ") : "none";
  }, [value.hideCompleted, value.region, value.category]);

  return (
    <CardShell>
      <View style={{ gap: 10 }}>
        {/* header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text category="s2">Filters</Text>
            <Text appearance="hint" category="c1" numberOfLines={1}>
              {summary}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {hasFilters ? (
              <Button
                size="tiny"
                appearance="ghost"
                status="basic"
                onPress={onClear}
              >
                Clear
              </Button>
            ) : null}

            <Button
              size="small"
              appearance="outline"
              onPress={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide" : "Show"}
            </Button>
          </View>
        </View>

        {expanded ? (
          <View style={{ gap: 12 }}>
            {/* completed chips */}
            <View style={{ gap: 6 }}>
              <Text appearance="hint" category="c1">
                Completed
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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

                <Text appearance="hint" category="c1">
                  {completionsLoading ? "Loading…" : `${completedCount} completed`}
                </Text>
              </View>

              {completionsErr ? (
                <Text appearance="hint" category="c1">
                  {completionsErr}
                </Text>
              ) : null}
            </View>

            {/* region chips */}
            <View style={{ gap: 6 }}>
              <Text appearance="hint" category="c1">
                Region
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
                  {REGIONS.map((r) => (
                    <Chip
                      key={r.value}
                      label={r.label}
                      selected={value.region === r.value}
                      onPress={() => patch({ region: r.value })}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* type chips */}
            <View style={{ gap: 6 }}>
              <Text appearance="hint" category="c1">
                Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
                  {CATEGORIES.map((c) => (
                    <Chip
                      key={c.value}
                      label={c.label}
                      selected={value.category === c.value}
                      onPress={() => patch({ category: c.value })}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* footer */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }} />
              <Text appearance="hint" category="c1">
                Showing {shownCount}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </CardShell>
  );
}