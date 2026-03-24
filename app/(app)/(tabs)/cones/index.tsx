import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";

import { goCone, goAccountHome } from "@/lib/routes";
import { useSortedConeRows } from "@/lib/hooks/useSortedConeRows";
import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useLocationStore, useFiltersStore } from "@/lib/store";
import { useAppData } from "@/lib/providers/DataProvider";

import { ConesListView } from "@/components/cone/list/ConesListView";
import { ConesListHeader } from "@/components/cone/list/ConeListHeader";
import { ConeFiltersCard } from "@/components/cone/list/ConeFiltersCard";

export default function ConeListPage() {
  const { session } = useSession();
  const isGuest = session.status === "guest";

  const { location: liveLoc, errorMsg: locErr } = useLocation();
  const locStatus = locErr ? "denied" : liveLoc ? "granted" : "unknown";

  const { conesData, completionsData } = useAppData();
  const { cones, loading: conesLoading, err: conesErr } = conesData;
  const { completedConeIds, loading: compLoading } = completionsData;

  const [lockedLoc, setLockedLoc] = useState(() => useLocationStore.getState().location);
  const { filters, setFilters } = useFiltersStore();

  useEffect(() => {
    if (!lockedLoc && liveLoc) {
      setLockedLoc(liveLoc);
    }
  }, [liveLoc, lockedLoc]);

  const handleRefreshGPS = () => {
    if (locStatus === "denied") {
      Linking.openSettings();
    } else {
      setLockedLoc(null);
    }
  };

  const filteredRows = useMemo(() => {
    const active = cones.filter((c) => !!c.active);
    let list = active;

    if (!isGuest) {
      if (filters.hideCompleted) list = list.filter((c) => !completedConeIds.has(c.id));
      if (filters.region !== "all")
        list = list.filter((c) => c.region === filters.region);
      if (filters.category !== "all")
        list = list.filter((c) => c.category === filters.category);
    }
    return list;
  }, [cones, filters, completedConeIds, isGuest]);

  const rows = useSortedConeRows(filteredRows, lockedLoc);

  if (conesLoading || session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Finding volcanoes..." />
      </Screen>
    );
  }

  if (conesErr) {
    return (
      <Screen>
        <ErrorCard title="Connection Issue" message={conesErr} />
      </Screen>
    );
  }

  const header = (
    <Stack gap="md" style={styles.headerStack}>
      <View style={styles.paddedSection}>
        <ConesListHeader
          status={locStatus}
          hasLoc={!!lockedLoc}
          locErr={locErr || ""}
          onPressGPS={handleRefreshGPS}
        />
      </View>

      {isGuest ? (
        <View style={styles.paddedSection}>
          <CardShell status="surf" onPress={goAccountHome}>
            <Stack gap="xs">
              <AppText variant="sectionTitle">Unlock Tracking</AppText>
              <AppText variant="label" status="hint">
                Sign in to filter by completion and track your summits.
              </AppText>
            </Stack>
          </CardShell>
        </View>
      ) : (
        <View style={styles.fullWidth}>
          <ConeFiltersCard
            value={filters}
            onChange={setFilters}
            completedCount={completedConeIds.size}
            completionsLoading={compLoading}
            shownCount={rows.length}
          />
        </View>
      )}
    </Stack>
  );

  return (
    <Screen padded={false}>
      {rows.length === 0 ? (
        <View style={styles.emptyContainer}>
          {header}
          <View style={styles.paddedSection}>
            <CardShell style={styles.emptyCard}>
              <Stack gap="sm" align="center">
                <AppText variant="h3">No Cones Found</AppText>
                <AppText variant="body" status="hint" style={styles.centerText}>
                  Try adjusting your filters or checking a different region.
                </AppText>
              </Stack>
            </CardShell>
          </View>
        </View>
      ) : (
        <ConesListView
          rows={rows}
          header={header}
          onPressCone={goCone}
          completedIds={completedConeIds}
          hideCompleted={filters.hideCompleted}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerStack: {
    paddingTop: 12,
    paddingBottom: 8,
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  paddedSection: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 20,
    paddingVertical: 40,
  },
  centerText: {
    textAlign: "center",
  },
});
