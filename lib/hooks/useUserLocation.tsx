import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import { locationStore } from "@/lib/locationStore";
import { GAMEPLAY } from "@/lib/constants/gameplay";

export type LocationStatus = "unknown" | "granted" | "denied";

// Changed default autoRequest to false, as the global Provider now handles the baseline
export function useUserLocation({ autoRequest = false }: { autoRequest?: boolean } = {}) {
  // Initialize with the global store instead of null
  const initialLoc = locationStore.get();

  const [loc, setLoc] = useState<Location.LocationObject | null>(initialLoc);

  // If the store already has a location, we know permission is granted
  const [status, setStatus] = useState<LocationStatus>(
    initialLoc ? "granted" : "unknown",
  );

  const [err, setErr] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Prevent setState after unmount (common with async location calls)
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const safeSet = useCallback(
    (
      next: Partial<{
        loc: Location.LocationObject | null;
        status: LocationStatus;
        err: string;
      }>,
    ) => {
      if (!aliveRef.current) return;

      if ("loc" in next) {
        setLoc(next.loc ?? null);
        // Feed high-accuracy manual refreshes back into the global store
        if (next.loc) {
          locationStore.set(next.loc);
        }
      }

      if ("status" in next && next.status) setStatus(next.status);
      if ("err" in next) setErr(next.err ?? "");
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // ✅ Guarding: single-flight + (optional) minimum interval
  // ---------------------------------------------------------------------------
  const inFlightRef = useRef<Promise<{ ok: boolean }> | null>(null);
  const lastRunAtRef = useRef<number>(0);

  const runGuarded = useCallback(async (fn: () => Promise<{ ok: boolean }>) => {
    const now = Date.now();

    // If a refresh is already running, return the same promise (single-flight)
    if (inFlightRef.current) return inFlightRef.current;

    // Throttle: prevent rapid repeated refresh triggers (tap spam / focus+active)
    if (now - lastRunAtRef.current < GAMEPLAY.GPS_REFRESH_THROTTLE_MS) {
      return { ok: false as const }; // skipped
    }

    if (aliveRef.current) setIsRefreshing(true);

    const p = (async () => {
      try {
        return await fn();
      } finally {
        lastRunAtRef.current = Date.now();
        inFlightRef.current = null;
        if (aliveRef.current) setIsRefreshing(false);
      }
    })();

    inFlightRef.current = p;
    return p;
  }, []);

  /**
   * Ask permission + do a "good enough" location fetch.
   * Best for list/progress/map screens where speed matters.
   */
  const request = useCallback(async () => {
    safeSet({ err: "" });

    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        safeSet({
          status: "denied",
          loc: null,
          err: "Location permission denied.",
        });
        return { ok: false as const };
      }

      safeSet({ status: "granted" });

      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      safeSet({ loc: cur, err: "" });
      return { ok: true as const };
    } catch (e: any) {
      safeSet({ err: e?.message ?? "Could not get location." });
      return { ok: false as const };
    }
  }, [safeSet]);

  /**
   * ✅ High accuracy refresh (GUARDED).
   * Best for cone completion / range checks.
   */
  const refresh = useCallback(() => {
    return runGuarded(async () => {
      safeSet({ err: "" });

      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== "granted") {
          safeSet({
            status: "denied",
            loc: null,
            err: "Location permission denied.",
          });
          return { ok: false as const };
        }

        safeSet({ status: "granted" });

        const cur = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        safeSet({ loc: cur, err: "" });
        return { ok: true as const };
      } catch (e: any) {
        safeSet({ err: e?.message ?? "Failed to refresh location." });
        return { ok: false as const };
      }
    });
  }, [runGuarded, safeSet]);

  // Auto-run once (default behavior)
  useEffect(() => {
    if (!autoRequest) return;
    void request();
  }, [autoRequest, request]);

  return useMemo(
    () => ({
      loc,
      status,
      err,
      request,
      refresh,
      isRefreshing,
    }),
    [loc, status, err, request, refresh, isRefreshing],
  );
}
