import React, { useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
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
  onPressCone: (_id: string) => void;
  completedIds?: Set<string>;
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
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={header ?? null}
      renderItem={({ item }) => {
        const { cone, distanceMeters } = item;

        return (
          <ConeListItem
            id={cone.id}
            name={cone.name}
            description={cone.description}
            distanceMeters={distanceMeters}
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

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  separator: { height: 12 },
});
