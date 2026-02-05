import React, { useMemo } from "react";
import { View, FlatList } from "react-native";
import { Text } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { ConeListItem } from "@/components/cone/list/ConeListItem";

import type { ConeRow } from "@/lib/hooks/useSortedConeRows";

export function ConesListView({
  rows,
  header,
  onPressCone,
  completedIds,

  hideCompleted = false,
}: {
  rows: ConeRow[];
  header?: React.ReactElement<any> | null;
  onPressCone: (coneId: string) => void;

  // optional: makes it trivial to wire completions + completion filters
  completedIds?: Set<string>;

  // when true + completedIds provided, completed cones are hidden
  hideCompleted?: boolean;
}) {
  const visibleRows = useMemo(() => {
    if (!hideCompleted) return rows;
    if (!completedIds || completedIds.size === 0) return rows;
    return rows.filter((r) => !completedIds.has(r.cone.id));
  }, [rows, hideCompleted, completedIds]);

  return (
    <FlatList
      data={visibleRows}
      keyExtractor={(item) => item.cone.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={header ?? null}
      renderItem={({ item }) => {
        const { cone, distanceMeters } = item;

        return (
          <ConeListItem
            id={cone.id}
            name={cone.name}
            description={cone.description}
            distanceMeters={distanceMeters}
            region={cone.region}
            category={cone.category}
            completed={completedIds ? completedIds.has(cone.id) : false}
            onPress={onPressCone}
          />
        );
      }}
      ListEmptyComponent={
        <CardShell>
          <Text appearance="hint">
            {hideCompleted && completedIds?.size
              ? "No uncompleted cones found."
              : "No cones found — check admin “active” flags."}
          </Text>
        </CardShell>
      }
    />
  );
}
