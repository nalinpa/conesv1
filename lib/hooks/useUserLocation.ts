import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import * as Sentry from "@sentry/react-native";

import { useLocationStore } from "@/lib/store/index";
import { GAMEPLAY } from "@/lib/constants/gameplay";

export type LocationStatus = "unknown" | "granted" | "denied";

export function useUserLocation({ autoRequest = false }: { autoRequest?: boolean } = {}) {
  const initialLoc = useLocationStore.getState().location;

  const [loc, setLoc] = useState<Location.LocationObject | null>(initialLoc);
  const [status, setStatus] = useState<LocationStatus>(
    initialLoc ? "granted" : "unknown",
  );

  const [err, setErr] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        if (next.loc) {
          useLocationStore.getState().setLocation(next.loc);
        }
      }

      if ("status" in next && next.status) setStatus(next.status);
      if ("err" in next) setErr(next.err ?? "");
    },
    [],
  );

  const inFlightRef = useRef<Promise<{ ok: boolean } | undefined> | null>(null);
  const lastRunAtRef = useRef<number>(0);

  const runGuarded = useCallback(async (fn: () => Promise<{ ok: boolean }>) => {
    const now = Date.now();

    if (inFlightRef.current) return inFlightRef.current;

    if (now - lastRunAtRef.current < GAMEPLAY.GPS_REFRESH_THROTTLE_MS) {
      return { ok: false as const };
    }

    if (aliveRef.current) setIsRefreshing(true);

    const p = (async () => {
      try {
        return await fn();
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        lastRunAtRef.current = Date.now();
        inFlightRef.current = null;
        if (aliveRef.current) setIsRefreshing(false);
      }
    })();

    inFlightRef.current = p;
    return p;
  }, []);

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
      Sentry.captureException(e);
      safeSet({ err: e?.message ?? "Could not get location." });
      return { ok: false as const };
    }
  }, [safeSet]);

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
        Sentry.captureException(e);
        safeSet({ err: e?.message ?? "Failed to refresh location." });
        return { ok: false as const };
      }
    });
  }, [runGuarded, safeSet]);

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
