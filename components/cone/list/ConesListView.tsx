import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";

import { CardShell } from "@/components/ui/CardShell";
import { ConeListItem } from "@/components/cone/list/ConeListItem";
import { AppText } from "@/components/ui/AppText";
import { Stack } from "@/components/ui/Stack";

import type { ConeRow } from "@/lib/hooks/useSortedConeRows";

const ItemSeparator = () => <View style={styles.separator} />;

export function ConesListView({
  rows,
  header,
  onPressCone,
  completedIds,
  hideCompleted = false,
}: {
  rows: ConeRow[];
  header?: React.ReactElement<any> | null;
  onPressCone: (id: string) => void;
  completedIds?: Set<string>;
  hideCompleted?: boolean;
}) {
  const visibleRows = useMemo(() => {
    if (!hideCompleted || !completedIds || completedIds.size === 0) return rows;
    return rows.filter((r) => !completedIds.has(r.cone.id));
  }, [rows, hideCompleted, completedIds]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ConeRow>) => {
      const { cone, distanceMeters } = item;
      const isCompleted = completedIds?.has(cone.id) ?? false;

      return (
        <ConeListItem
          id={cone.id}
          name={cone.name}
          description={cone.description}
          distanceMeters={distanceMeters}
          completed={isCompleted}
          onPress={onPressCone}
          index={index}
        />
      );
    },
    [onPressCone, completedIds],
  ); // Dependencies are critical here

  return (
    <FlashList
      data={visibleRows}
      keyExtractor={(item) => item.cone.id}
      renderItem={renderItem} // Reference to memoized function
      // @ts-ignore - FlashList typing quirk
      estimatedItemSize={142}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={header ?? null}
      ListHeaderComponentStyle={styles.headerStyle}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      drawDistance={250}
      ListEmptyComponent={
        <CardShell status="basic" style={styles.emptyCard}>
          <Stack gap="xs" align="center">
            <AppText variant="sectionTitle" status="hint">
              No Peaks Found
            </AppText>
            <AppText variant="body" status="hint" style={styles.centerText}>
              {hideCompleted && completedIds?.size
                ? "You've conquered everything in this list!"
                : "Check your filters or active settings."}
            </AppText>
          </Stack>
        </CardShell>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerStyle: {
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    paddingVertical: 32,
  },
  centerText: {
    textAlign: "center",
  },
});
