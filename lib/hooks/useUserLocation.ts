import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import * as Sentry from "@sentry/react-native";

import { useLocationStore } from "@/lib/store/index";

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
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      // 🚀 Clean up the live stream when the app closes to save battery
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
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

      // 🚀 THE MAGIC FIX: Start the live stream instead of taking a single snapshot
      if (!watcherRef.current) {
        watcherRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High, // Fast, triangulated tracking
            timeInterval: 1000, // Ping the hardware every 1 second
            distanceInterval: 1, // Update the UI every time they move 1 meter
          },
          (newLocation) => {
            safeSet({ loc: newLocation }); // Automatically pushes to your map/meter!
          },
        );
      }

      return { ok: true as const };
    } catch (e: any) {
      Sentry.captureException(e);
      safeSet({ err: e?.message ?? "Could not get location." });
      return { ok: false as const };
    }
  }, [safeSet]);

  const refresh = useCallback(async () => {
    // We keep this for manual refresh buttons, but you likely won't need it much anymore
    setIsRefreshing(true);
    try {
      const cur = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      safeSet({ loc: cur, err: "" });
    } finally {
      setIsRefreshing(false);
    }
    return { ok: true as const };
  }, [safeSet]);

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
