import React, { useState, useEffect } from "react";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 1. Safely initialize the QueryClient inside the component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep unused data in memory/disk for 24 hours
            gcTime: 1000 * 60 * 60 * 24, 
            // Keep data "fresh" for 5 minutes before checking Firebase again
            staleTime: 1000 * 60 * 5, 
            // Retry failed requests twice (useful for spotty cell service on hikes)
            retry: 2,
            // Refetch when the phone regains internet
            refetchOnReconnect: true,
            // Don't refetch every time the app comes to the foreground
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // 2. Safely initialize the AsyncStorage persister inside the component lifecycle
  // This ensures we don't try to read the hard drive before the app is fully ready
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: AsyncStorage,
      key: "CONES_OFFLINE_CACHE",
      throttleTime: 1000,
    })
  );

  // 3. Wire up Network Awareness
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(
        !!state.isConnected && !!state.isInternetReachable
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: persister,
        // Match the max age of the persisted data to your gcTime (24 hours)
        maxAge: 1000 * 60 * 60 * 24, 
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}