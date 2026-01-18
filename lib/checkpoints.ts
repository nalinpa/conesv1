import { haversineMeters } from "./geo";

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

export function getEffectiveCheckpoints(cone: ConeWithCheckpoints): EffectiveCheckpoint[] {
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
  deviceLng: number
): { checkpoint: EffectiveCheckpoint; distanceMeters: number } {
  const cps = getEffectiveCheckpoints(cone);

  let best = cps[0];
  let bestDist = haversineMeters(deviceLat, deviceLng, best.lat, best.lng);

  for (let i = 1; i < cps.length; i++) {
    const cp = cps[i];
    const d = haversineMeters(deviceLat, deviceLng, cp.lat, cp.lng);
    if (d < bestDist) {
      best = cp;
      bestDist = d;
    }
  }

  return { checkpoint: best, distanceMeters: bestDist };
}

export function inRange(
  checkpoint: { radiusMeters: number },
  distanceMeters: number,
  accuracyMeters: number | null,
  maxAccuracyMeters = 50
) {
  const okAccuracy = accuracyMeters == null || accuracyMeters <= maxAccuracyMeters;
  return distanceMeters <= checkpoint.radiusMeters && okAccuracy;
}
