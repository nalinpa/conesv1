import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import * as Sentry from "@sentry/react-native";
import { useSyncStore } from "@/lib/store/useSyncStore";

export function useOfflineSyncManager() {
  const processQueue = useSyncStore((state) => state.processQueue);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        const queueSize = useSyncStore.getState().queue.length;

        if (queueSize > 0) {
          processQueue().catch((err) => {
            Sentry.captureException(err, {
              tags: { context: "OfflineSyncManager" },
            });
          });
        }
      }
    });

    return () => unsubscribe();
  }, [processQueue]);
}
