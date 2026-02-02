import { useMemo } from "react";
import type * as Location from "expo-location";

import type { Cone } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export function useGPSGate(
  cone: Cone | null,
  loc: Location.LocationObject | null,
  opts?: { maxAccuracyMeters?: number },
): {
  distanceMeters: number | null;
  accuracyMeters: number | null;
  inRange: boolean;

  checkpointLabel: string | null;
  checkpointRadius: number | null;
  checkpointId: string | null;

  // useful for completion writes
  checkpointLat: number | null;
  checkpointLng: number | null;
} {
  const maxAccuracy = opts?.maxAccuracyMeters ?? 50;

  return useMemo(() => {
    if (!cone || !loc) {
      return {
        distanceMeters: null,
        accuracyMeters: null,
        inRange: false,
        checkpointLabel: null,
        checkpointRadius: null,
        checkpointId: null,
        checkpointLat: null,
        checkpointLng: null,
      };
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const nearest = nearestCheckpoint(cone, latitude, longitude);

    const distanceMeters = nearest.distanceMeters;
    const accuracyMeters = accuracy ?? null;

    const okAccuracy = accuracyMeters == null || accuracyMeters <= maxAccuracy;
    const inRange = distanceMeters <= nearest.checkpoint.radiusMeters && okAccuracy;

    return {
      distanceMeters,
      accuracyMeters,
      inRange,

      checkpointLabel: nearest.checkpoint.label ?? null,
      checkpointRadius: nearest.checkpoint.radiusMeters ?? null,
      checkpointId: nearest.checkpoint.id ?? null,

      checkpointLat: nearest.checkpoint.lat ?? null,
      checkpointLng: nearest.checkpoint.lng ?? null,
    };
  }, [cone, loc, maxAccuracy]);
}
