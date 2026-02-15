import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";

import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";

import { goCone } from "@/lib/routes";

import { useCones } from "@/lib/hooks/useCones";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useSortedConeRows } from "@/lib/hooks/useSortedConeRows";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";

import { useSession } from "@/lib/providers/SessionProvider";

import type { ConeCategory, ConeRegion } from "@/lib/models";

import { ConesListView } from "@/components/cone/list/ConesListView";
import { ConesListHeader } from "@/components/cone/list/ConeListHeader";
import {
  ConeFiltersCard,
  type ConeFiltersValue,
} from "@/components/cone/list/ConeFiltersCard";

const DEFAULT_FILTERS: ConeFiltersValue = {
  hideCompleted: true,
  region: "all",
  category: "all",
};

export default function ConeListPage() {
  const { session } = useSession();

  if (session.status === "loading") {
    return (
      <Screen padded={false}>
        <View style={styles.flex1}>
          <LoadingState label="Loading…" />
        </View>
      </Screen>
    );
  }

  if (session.status === "guest") return <ConeListGuest />;
  return <ConeListAuthed />;
}

function ConeListGuest() {
  const { cones, loading, err } = useCones();

  const { loc, status, err: locErr, request, refresh: refreshGPS } = useUserLocation();

  const activeCones = useMemo(() => cones.filter((c) => !!c.active), [cones]);

  const rows = useSortedConeRows(activeCones, loc);

  if (loading) {
    return (
      <Screen padded={false}>
        <View style={styles.flex1}>
          <LoadingState label="Loading cones…" />
        </View>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <View style={styles.centerContainer}>
          <ErrorCard title="Couldn’t load cones" message={err} />
        </View>
      </Screen>
    );
  }

  const header = (
    <Stack gap="md">
      <ConesListHeader
        status={status}
        hasLoc={!!loc}
        locErr={locErr}
        onPressGPS={() => void (loc ? refreshGPS() : request())}
      />

      {/* Guests: hide filters entirely */}
      <CardShell>
        <Stack gap="xs">
          <AppText variant="sectionTitle">Browse</AppText>
          <AppText variant="hint">
            Sign in to filter by completion and track progress.
          </AppText>
        </Stack>
      </CardShell>
    </Stack>
  );

  if (rows.length === 0) {
    return (
      <Screen padded={false}>
        <View style={styles.listContainer}>
          <Stack gap="md">
            {header}
            <CardShell>
              <Stack gap="sm">
                <AppText variant="sectionTitle">No active cones exist</AppText>
                <AppText variant="hint">
                  Activate cones in the admin app to show them here.
                </AppText>
              </Stack>
            </CardShell>
          </Stack>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.flex1}>
        <ConesListView
          rows={rows}
          header={header}
          onPressCone={(coneId: string) => goCone(coneId)}
          completedIds={new Set()} // guests have no completions
          hideCompleted={false}
        />
      </View>
    </Screen>
  );
}

function ConeListAuthed() {
  const { cones, loading, err } = useCones();

  const { loc, status, err: locErr, request, refresh: refreshGPS } = useUserLocation();

  const {
    completedConeIds,
    loading: completionsLoading,
    err: completionsErr,
  } = useMyCompletions();

  const [filters, setFilters] = useState<ConeFiltersValue>(DEFAULT_FILTERS);

  const activeCones = useMemo(() => cones.filter((c) => !!c.active), [cones]);
  const totalActiveCount = activeCones.length;

  const filteredCones = useMemo(() => {
    let list = activeCones;

    if (filters.hideCompleted && completedConeIds.size) {
      list = list.filter((c) => !completedConeIds.has(c.id));
    }

    if (filters.region !== "all") {
      list = list.filter((c) => c.region === (filters.region as ConeRegion));
    }

    if (filters.category !== "all") {
      list = list.filter((c) => c.category === (filters.category as ConeCategory));
    }

    return list;
  }, [activeCones, filters, completedConeIds]);

  const rows = useSortedConeRows(filteredCones, loc);

  if (loading) {
    return (
      <Screen padded={false}>
        <View style={styles.flex1}>
          <LoadingState label="Loading cones…" />
        </View>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <View style={styles.centerContainer}>
          <ErrorCard title="Couldn’t load cones" message={err} />
        </View>
      </Screen>
    );
  }

  const header = (
    <Stack gap="md">
      <ConesListHeader
        status={status}
        hasLoc={!!loc}
        locErr={locErr}
        onPressGPS={() => void (loc ? refreshGPS() : request())}
      />

      <ConeFiltersCard
        value={filters}
        onChange={setFilters}
        completedCount={completedConeIds.size}
        completionsLoading={completionsLoading}
        completionsErr={completionsErr}
        shownCount={rows.length}
      />
    </Stack>
  );

  const showNoActive = totalActiveCount === 0;
  const showNoMatch = !showNoActive && rows.length === 0;

  if (showNoActive || showNoMatch) {
    return (
      <Screen padded={false}>
        <View style={styles.listContainer}>
          <Stack gap="md">
            {header}
            <CardShell>
              <Stack gap="sm">
                <AppText variant="sectionTitle">
                  {showNoActive ? "No active cones exist" : "No cones match your filters"}
                </AppText>

                <AppText variant="hint">
                  {showNoActive
                    ? "Add cones in the admin app, or activate some cones to show them here."
                    : "Try clearing filters or adjusting region/category."}
                </AppText>
              </Stack>
            </CardShell>
          </Stack>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.flex1}>
        <ConesListView
          rows={rows}
          header={header}
          onPressCone={(coneId: string) => goCone(coneId)}
          completedIds={completedConeIds}
          hideCompleted={false}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
