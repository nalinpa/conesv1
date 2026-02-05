import { useMemo, useState } from "react";
import { View } from "react-native";

import { Layout, Text } from "@ui-kitten/components";

import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardShell } from "@/components/ui/CardShell";

import { goCone } from "@/lib/routes";

import { useCones } from "@/lib/hooks/useCones";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useSortedConeRows } from "@/lib/hooks/useSortedConeRows";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";

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
  // Data
  const { cones, loading, err, reload } = useCones();

  // Location
  const { loc, status, err: locErr, request, refresh: refreshGPS } =
    useUserLocation();

  // Completions (live)
  const {
    completedConeIds,
    loading: completionsLoading,
    err: completionsErr,
  } = useMyCompletions();

  const [filters, setFilters] = useState<ConeFiltersValue>(DEFAULT_FILTERS);

  // Active cones count (for empty state correctness)
  const activeCones = useMemo(() => {
    // If useCones() already returns only active, this still works.
    return cones.filter((c) => !!c.active);
  }, [cones]);

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
      list = list.filter(
        (c) => c.category === (filters.category as ConeCategory)
      );
    }

    return list;
  }, [activeCones, filters, completedConeIds]);

  // Sorted rows (distance-aware when loc exists)
  const rows = useSortedConeRows(filteredCones, loc);

  // ----------------------------
  // Loading / error states
  // ----------------------------
  if (loading) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading cones…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
          <ErrorCard
            title="Couldn’t load cones"
            message={err}
            action={{
              label: "Retry",
              onPress: () => void reload(),
              appearance: "filled",
            }}
          />
        </Layout>
      </Screen>
    );
  }

  const header = (
    <View style={{ gap: 12 }}>
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
    </View>
  );

  // ----------------------------
  // Empty states (correct + distinct)
  // ----------------------------
  const showNoActive = totalActiveCount === 0;
  const showNoMatch = !showNoActive && rows.length === 0;

  if (showNoActive || showNoMatch) {
    return (
      <Screen padded={false}>
        <Layout style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 12 }}>
            {header}

            <CardShell>
              {showNoActive ? (
                <>
                  <Text category="s1">No active cones exist</Text>
                  <Text appearance="hint" style={{ marginTop: 6 }}>
                    Add cones in the admin app, or activate some cones to show them here.
                  </Text>
                </>
              ) : (
                <>
                  <Text category="s1">No cones match your filters</Text>
                  <Text appearance="hint" style={{ marginTop: 6 }}>
                    Try clearing filters or adjusting region/category.
                  </Text>
                </>
              )}
            </CardShell>
          </View>
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Layout style={{ flex: 1 }}>
        <ConesListView
          rows={rows}
          header={header}
          onPressCone={(coneId: string) => goCone(coneId)}
          completedIds={completedConeIds}
          hideCompleted={false} // already filtered at source
        />
      </Layout>
    </Screen>
  );
}
