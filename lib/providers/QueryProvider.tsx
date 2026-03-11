import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 1. Safely initialize the QueryClient inside the component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep unused data in memory for 24 hours
            gcTime: 1000 * 60 * 60 * 24,
            // Keep data "fresh" for 5 minutes before checking Firebase again
            staleTime: 1000 * 60 * 5,
            // Retry failed requests twice (useful for spotty cell service on hikes)
            retry: 2,
            // Don't refetch every time the app comes to the foreground
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
