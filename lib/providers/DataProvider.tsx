import React, { createContext, useContext, useMemo } from "react";
import { useCones } from "@/lib/hooks/useCones";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

// Automatically infer the shapes of your hook returns
type ConesData = ReturnType<typeof useCones>;
type CompletionsData = ReturnType<typeof useMyCompletions>;
type ReviewsData = ReturnType<typeof useMyReviews>;

interface AppDataContextType {
  conesData: ConesData;
  completionsData: CompletionsData;
  reviewsData: ReviewsData;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // These hooks mount their onSnapshot listeners EXACTLY ONCE here
  const conesData = useCones();
  const completionsData = useMyCompletions();
  const reviewsData = useMyReviews();

  // Memoize the value to prevent unnecessary re-renders across the app
  const value = useMemo(
    () => ({
      conesData,
      completionsData,
      reviewsData,
    }),
    [conesData, completionsData, reviewsData],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within a DataProvider");
  }
  return context;
}
