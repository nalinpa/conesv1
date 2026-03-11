import { getDistance, findNearest } from "geolib";

export type Checkpoint = {
  id?: string;
  label?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type ConeWithCheckpoints = {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: Checkpoint[];
};

export type EffectiveCheckpoint = Checkpoint & {
  id: string;
  label: string;
  source: "checkpoint" | "fallback";
};

export function getEffectiveCheckpoints(
  cone: ConeWithCheckpoints,
): EffectiveCheckpoint[] {
  if (cone.checkpoints && cone.checkpoints.length > 0) {
    return cone.checkpoints.map((cp, idx) => ({
      id: cp.id ?? `cp_${idx}`,
      label: cp.label ?? `Checkpoint ${idx + 1}`,
      lat: cp.lat,
      lng: cp.lng,
      radiusMeters: cp.radiusMeters,
      source: "checkpoint" as const,
    }));
  }

  return [
    {
      id: "fallback",
      label: "Main point",
      lat: cone.lat,
      lng: cone.lng,
      radiusMeters: cone.radiusMeters,
      source: "fallback" as const,
    },
  ];
}

export function nearestCheckpoint(
  cone: ConeWithCheckpoints,
  deviceLat: number,
  deviceLng: number,
): { checkpoint: EffectiveCheckpoint; distanceMeters: number } {
  const cps = getEffectiveCheckpoints(cone);
  const userCoords = { latitude: deviceLat, longitude: deviceLng };

  const formattedCps = cps.map((cp) => ({
    ...cp,
    latitude: cp.lat,
    longitude: cp.lng,
  }));

  const nearest = findNearest(userCoords, formattedCps) as (typeof formattedCps)[0];

  const distanceMeters = getDistance(userCoords, nearest);

  return { checkpoint: nearest, distanceMeters };
}

export function inRange(
  checkpoint: { radiusMeters: number },
  distanceMeters: number,
  accuracyMeters: number | null,
  maxAccuracyMeters = 50,
) {
  const okAccuracy = accuracyMeters == null || accuracyMeters <= maxAccuracyMeters;
  return distanceMeters <= checkpoint.radiusMeters && okAccuracy;
}
