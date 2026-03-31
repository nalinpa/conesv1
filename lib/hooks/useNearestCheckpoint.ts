import { useMemo } from "react";
import { useAppData } from "@/lib/providers/DataProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { nearestCheckpoint } from "@/lib/checkpoints";

export function useNearestCheckpoint(coneId: string) {
  const { conesData } = useAppData();
  const { location: loc } = useLocation();

  return useMemo(() => {
    // 1. Find the cone object
    const cone = conesData?.cones?.find((c) => c.id === coneId);

    // 2. Safety check for location and data
    if (!cone || !loc) return { cone, nearest: null };

    // 3. Run your existing calculation
    const nearest = nearestCheckpoint(cone, loc.coords.latitude, loc.coords.longitude);

    return { cone, nearest };
  }, [conesData?.cones, coneId, loc]);
}
