import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { completionService } from "@/lib/services/completionService";

// --- 1. Guest Store ---
interface GuestState {
  isGuest: boolean;
  setGuest: (val: boolean) => void;
}
export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      isGuest: false,
      setGuest: (val) => set({ isGuest: val }),
    }),
    { name: "guest-storage", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 2. Location Store (Memory Only) ---
interface LocationState {
  location: Location.LocationObject | null;
  setLocation: (loc: Location.LocationObject | null) => void;
}
export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  setLocation: (loc) => set({ location: loc }),
}));

// --- 3. Filters Store ---
export type ConeFiltersValue = {
  category: string | null;
  region: string | null;
  hideCompleted: boolean;
};
interface FiltersState {
  filters: ConeFiltersValue;
  setFilters: (filters: ConeFiltersValue) => void;
}
export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      filters: { hideCompleted: false, region: "all", category: "all" },
      setFilters: (filters) => set({ filters }),
    }),
    { name: "cones-filters", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 4. App Settings Store ---
interface AppSettingsState {
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
}
export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: true,
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    { name: "app-settings", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 5. Map State Store (Memory Only) ---
interface MapState {
  selectedConeId: string | null;
  setSelectedConeId: (id: string | null) => void;
}
export const useMapStore = create<MapState>((set) => ({
  selectedConeId: null,
  setSelectedConeId: (id) => set({ selectedConeId: id }),
}));

// --- 6. Review Drafts Store ---
interface DraftsState {
  drafts: Record<string, { rating: number | null; text: string }>;
  setDraft: (coneId: string, rating: number | null, text: string) => void;
  clearDraft: (coneId: string) => void;
}
export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (coneId, rating, text) =>
        set((state) => ({ drafts: { ...state.drafts, [coneId]: { rating, text } } })),
      clearDraft: (coneId) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[coneId];
          return { drafts: newDrafts };
        }),
    }),
    { name: "review-drafts", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 7. Sync Store (Persistent Offline Queue) ---
interface QueuedVisit {
  args: {
    uid: string;
    cone: any; 
    loc: Location.LocationObject;
    gate: any;
  };
  queuedAt: number;
}

interface SyncState {
  queue: QueuedVisit[];
  isSyncing: boolean;
  addToQueue: (args: QueuedVisit['args']) => void;
  processQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,

      addToQueue: (args) => {
        const { queue } = get();
        // Prevent duplicate queuing for the same cone
        if (queue.some((v) => v.args.cone.id === args.cone.id)) return;
        set({ queue: [...queue, { args, queuedAt: Date.now() }] });
      },

      processQueue: async () => {
        const { queue, isSyncing } = get();
        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });
        const remainingQueue: QueuedVisit[] = [];

        for (const item of queue) {
          try {
            // Pass the FULL snapshot (GPS/Gate) to the service
            const result = await completionService.completeCone(item.args);
            
            if (!result.ok) {
              // If it's a validation error (not range), we might want to drop it, 
              // but for now, we keep it for safety.
              remainingQueue.push(item);
            }
          } catch (error) {
            console.error(`[Sync] Network/Process Error:`, error);
            remainingQueue.push(item);
          }
        }

        set({ queue: remainingQueue, isSyncing: false });
      },
    }),
    {
      name: "cones-sync-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// --- 8. Tracking Store ---
interface TrackingState {
  targetId: string | null;
  targetName: string | null;
  isTracking: boolean;
  
  showSuccess: boolean;
  successTarget: string | null;
  successId: string | null;

  startTracking: (id: string, name: string) => void;
  stopTracking: () => void;
  
  triggerSuccessUI: (name: string, id: string) => void;
  closeSuccess: () => void;
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      targetId: null,
      targetName: null,
      isTracking: false,
      
      showSuccess: false,
      successTarget: null,
      successId: null,
      
      startTracking: (id, name) => {
        const current = get();
        if (current.isTracking && current.targetId === id) return;
        set({ targetId: id, targetName: name, isTracking: true });
      },
      
      stopTracking: () => set({ targetId: null, targetName: null, isTracking: false }),

      triggerSuccessUI: (name: string, id: string) => {
        set({ 
          showSuccess: true, 
          successTarget: name,
          successId: id, // <--- CRITICAL: Make sure this is being set
          isTracking: false,
          targetId: null 
        });
      },

      closeSuccess: () => set({ showSuccess: false, successTarget: null, successId: null }),
    }),
    {
      name: "tracking-mission",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        targetId: state.targetId, 
        targetName: state.targetName, 
        isTracking: state.isTracking 
      }),
    },
  ),
);