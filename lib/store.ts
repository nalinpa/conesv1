import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

// 1. Guest Store
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
    {
      name: "guest-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// 2. Location Store (Memory only - we don't want to persist stale GPS coords)
interface LocationState {
  location: Location.LocationObject | null;
  setLocation: (loc: Location.LocationObject | null) => void;
}
export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  setLocation: (loc) => set({ location: loc }),
}));

// 3. Filters Store
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
    {
      name: "cones-filters",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// 4. App Settings Store
interface AppSettingsState {
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
}
export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: true, // Kept true as per your test state
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// 5. Map State Store (In-Memory)
interface MapState {
  selectedConeId: string | null;
  setSelectedConeId: (id: string | null) => void;
}
export const useMapStore = create<MapState>((set) => ({
  selectedConeId: null,
  setSelectedConeId: (id) => set({ selectedConeId: id }),
}));

// 6. Review Drafts Store
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
