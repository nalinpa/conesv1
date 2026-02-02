/**
 * Format a distance in meters.
 *
 * mode:
 * - "short": compact value only (e.g. "120 m", "1.4 km")
 * - "label": human-friendly label (e.g. "120 m away", "1.4 km away")
 */
export function formatDistanceMeters(
  distanceMeters: number | null,
  mode: "short" | "label" = "short",
): string {
  if (distanceMeters == null) {
    return mode === "label" ? "Distance —" : "—";
  }

  if (distanceMeters < 1000) {
    const m = Math.round(distanceMeters);
    return mode === "label" ? `${m} m away` : `${m} m`;
  }

  const km = (distanceMeters / 1000).toFixed(1);
  return mode === "label" ? `${km} km away` : `${km} km`;
}

/**
 * Generic meters formatter (used for status / stats)
 */
export function formatMeters(m: number | null): string {
  if (m == null) return "—";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}
