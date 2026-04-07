import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { completionService } from "../services/completionService";

type CompleteConeArgs = Parameters<typeof completionService.completeCone>[0];

interface SyncState {
  queue: CompleteConeArgs[];
  isSyncing: boolean;
  addToQueue: (visit: CompleteConeArgs) => void;
  processQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,

      addToQueue: (visit) => {
        const { queue } = get();
        if (queue.some((v) => v.cone.id === visit.cone.id)) return;
        set({ queue: [...queue, visit] });
      },

      processQueue: async () => {
        const { queue, isSyncing } = get();

        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });

        const remainingQueue: CompleteConeArgs[] = [];

        for (const visit of queue) {
          try {
            const res = await completionService.completeCone(visit);

            if (res && res.ok === false) {
              // Ignore deliberate network timeouts, but log actual Firebase rejections
              if (res.err !== "FIREBASE_TIMEOUT") {
                Sentry.captureMessage(
                  `Firebase rejected cone sync: ${res.err}`,
                  "warning",
                );
              }
              remainingQueue.push(visit);
            }
          } catch (error) {
            // Log true crashes to Sentry with extra context
            Sentry.captureException(error, {
              tags: { context: "SyncEngine" },
              extra: { coneName: visit.cone.name, coneId: visit.cone.id },
            });
            remainingQueue.push(visit);
          }
        }

        set({ queue: remainingQueue, isSyncing: false });
      },
    }),
    {
      name: "cones-sync-storage-v3",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);
