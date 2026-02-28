import React, { useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";

import { CardShell } from "@/components/ui/CardShell";
import { ConeListItem } from "@/components/cone/list/ConeListItem";
import { AppText } from "@/components/ui/AppText";
import { Stack } from "@/components/ui/Stack";

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
  onPressCone: (id: string) => void;
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
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={header ?? null}
      ListHeaderComponentStyle={styles.headerStyle}
      // ==========================================
      // PERFORMANCE PROPS
      // ==========================================
      // 1. Unmount views that are far off-screen (Massive memory saver on Android)
      removeClippedSubviews={true}
      // 2. Only render enough items to fill the initial screen, preventing a heavy mount
      initialNumToRender={8}
      // 3. Render next items in smaller chunks rather than all at once
      maxToRenderPerBatch={8}
      // 4. Keep fewer "invisible" items in memory (Default is 21 screens worth, 5 is much lighter)
      windowSize={5}
      // ==========================================

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
    flexGrow: 1,
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
