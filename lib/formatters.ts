/**
 * Format a distance in meters.
 *
 * mode:
 * - "short": compact value only (e.g. "120 m", "1.4 km")
 * - "label": human-friendly label (e.g. "Distance 120 m", "Distance 1.4 km")
 *
 * Notes:
 * - Defensive: handles null/undefined/NaN/Infinity
 */
export function formatDistanceMeters(
  distanceMeters: number | null | undefined,
  mode: "short" | "label" = "short",
): string {
  if (distanceMeters == null || !Number.isFinite(distanceMeters)) {
    return mode === "label" ? "Distance —" : "—";
  }

  if (distanceMeters < 1000) {
    const m = Math.round(distanceMeters);
    return mode === "label" ? `Distance ${m} m` : `${m} m`;
  }

  const km = (distanceMeters / 1000).toFixed(1);
  return mode === "label" ? `Distance ${km} km` : `${km} km`;
}

/**
 * Generic meters formatter (used for radius / accuracy / stats)
 * Defensive: handles null/undefined/NaN/Infinity
 */
export function formatMeters(m: number | null | undefined): string {
  if (m == null || !Number.isFinite(m)) return "—";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}
