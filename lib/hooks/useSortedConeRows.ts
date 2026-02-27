import { useMemo, useRef } from "react";
import type * as Location from "expo-location";

import type { Cone } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export type ConeRow = {
  cone: Cone;
  distanceMeters: number | null;
};

export function useSortedConeRows(cones: Cone[], loc: Location.LocationObject | null) {
  // Store the last valid location in a Ref so it survives 'null' flickers
  const lastValidLoc = useRef<Location.LocationObject | null>(null);

  if (loc) {
    lastValidLoc.current = loc;
  }

  return useMemo<ConeRow[]>(() => {
    // Use the current location, or fall back to the last known one
    const activeLoc = loc || lastValidLoc.current;

    // Only if we have NO location whatsoever do we do Name Sort
    if (!activeLoc) {
      return [...cones]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((cone) => ({ cone, distanceMeters: null }));
    }

    const { latitude, longitude } = activeLoc.coords;

    const rows = cones.map((cone) => ({
      cone,
      distanceMeters: nearestCheckpoint(cone, latitude, longitude).distanceMeters,
    }));

    rows.sort((a, b) => {
      if (a.distanceMeters == null && b.distanceMeters == null)
        return a.cone.name.localeCompare(b.cone.name);
      if (a.distanceMeters == null) return 1;
      if (b.distanceMeters == null) return -1;
      if (a.distanceMeters !== b.distanceMeters)
        return a.distanceMeters - b.distanceMeters;
      return a.cone.name.localeCompare(b.cone.name);
    });

    return rows;
  }, [cones, loc]);
}