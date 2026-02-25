import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";

import { goCone, goLogin } from "@/lib/routes";
import { useCones } from "@/lib/hooks/useCones";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useSortedConeRows } from "@/lib/hooks/useSortedConeRows";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useSession } from "@/lib/providers/SessionProvider";

import type { ConeCategory, ConeRegion } from "@/lib/models";
import { ConesListView } from "@/components/cone/list/ConesListView";
import { ConesListHeader } from "@/components/cone/list/ConeListHeader";
import { ConeFiltersCard, type ConeFiltersValue } from "@/components/cone/list/ConeFiltersCard";

const DEFAULT_FILTERS: ConeFiltersValue = {
  hideCompleted: false,
  region: "all",
  category: "all",
};

export default function ConeListPage() {
  const { session } = useSession();
  const isGuest = session.status === "guest";
  const { cones, loading: conesLoading, err: conesErr } = useCones();
  const { loc, status: locStatus, err: locErr, request, refresh: refreshGPS } = useUserLocation();
  const { completedConeIds, loading: compLoading } = useMyCompletions();

  const [lockedLoc, setLockedLoc] = useState<typeof loc>(null);
  const [filters, setFilters] = useState<ConeFiltersValue>(DEFAULT_FILTERS);

  // Set location once to prevent list jumping while browsing
  useEffect(() => {
    if (!lockedLoc && loc) setLockedLoc(loc);
  }, [loc, lockedLoc]);

  const handleRefreshGPS = () => {
    setLockedLoc(null);
    loc ? refreshGPS() : request();
  };

  const filteredRows = useMemo(() => {
    const active = cones.filter((c) => !!c.active);
    let list = active;

    if (!isGuest) {
      if (filters.hideCompleted) list = list.filter((c) => !completedConeIds.has(c.id));
      if (filters.region !== "all") list = list.filter((c) => c.region === filters.region);
      if (filters.category !== "all") list = list.filter((c) => c.category === filters.category);
    }
    return list;
  }, [cones, filters, completedConeIds, isGuest]);

  const rows = useSortedConeRows(filteredRows, lockedLoc);

  if (conesLoading || (session.status === "loading")) {
    return <Screen><LoadingState label="Finding volcanoes..." /></Screen>;
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
      <ConesListHeader 
        status={locStatus} 
        hasLoc={!!loc} 
        locErr={locErr} 
        onPressGPS={handleRefreshGPS} 
      />

      {isGuest ? (
        <CardShell status="surf" onPress={goLogin}>
          <Stack gap="xs">
            <AppText variant="sectionTitle">Unlock Tracking</AppText>
            <AppText variant="label" status="hint">
              Sign in to filter by completion and track your summits.
            </AppText>
          </Stack>
        </CardShell>
      ) : (
        <ConeFiltersCard
          value={filters}
          onChange={setFilters}
          completedCount={completedConeIds.size}
          completionsLoading={compLoading}
          shownCount={rows.length}
        />
      )}
    </Stack>
  );

  return (
    <Screen padded={false}>
      {rows.length === 0 ? (
        <View style={styles.emptyContainer}>
          {header}
          <CardShell style={styles.emptyCard}>
            <Stack gap="sm" align="center">
              <AppText variant="h3">No Cones Found</AppText>
              <AppText variant="body" status="hint" style={styles.centerText}>
                Try adjusting your filters or checking a different region.
              </AppText>
            </Stack>
          </CardShell>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyCard: {
    marginTop: 20,
    paddingVertical: 40,
  },
  centerText: {
    textAlign: "center",
  },
});