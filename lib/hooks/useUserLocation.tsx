import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";

export type LocationStatus = "unknown" | "granted" | "denied";

export function useUserLocation({
  autoRequest = true,
}: {
  autoRequest?: boolean;
} = {}) {
  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [status, setStatus] = useState<LocationStatus>("unknown");
  const [err, setErr] = useState<string>("");

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
      if ("loc" in next) setLoc(next.loc ?? null);
      if ("status" in next && next.status) setStatus(next.status);
      if ("err" in next) setErr(next.err ?? "");
    },
    [],
  );

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
   * High accuracy refresh.
   * Best for cone completion / range checks.
   */
  const refresh = useCallback(async () => {
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
  }, [safeSet]);

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
      request, // permission + balanced fetch
      refresh, // high accuracy fetch
    }),
    [loc, status, err, request, refresh],
  );
}
