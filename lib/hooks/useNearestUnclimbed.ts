import { useMemo } from "react";
import type * as Location from "expo-location";

import type { Cone } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export type NearestUnclimbedResult = {
  cone: Cone;
  distanceMeters: number | null;
};

export function useNearestUnclimbed(
  cones: Cone[],
  completedConeIds: Set<string>,
  loc: Location.LocationObject | null
): NearestUnclimbedResult | null {
  return useMemo(() => {
    const unclimbed = cones.filter((c) => !completedConeIds.has(c.id));
    if (unclimbed.length === 0) return null;

    // Stable fallback when no location: alphabetically first
    if (!loc) {
      const sorted = [...unclimbed].sort((a, b) => a.name.localeCompare(b.name));
      return { cone: sorted[0], distanceMeters: null };
    }

    const { latitude, longitude } = loc.coords;

    let best = unclimbed[0];
    let bestDist = nearestCheckpoint(best, latitude, longitude).distanceMeters;

    for (let i = 1; i < unclimbed.length; i++) {
      const c = unclimbed[i];
      const d = nearestCheckpoint(c, latitude, longitude).distanceMeters;
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }

    return { cone: best, distanceMeters: bestDist };
  }, [cones, completedConeIds, loc]);
}
