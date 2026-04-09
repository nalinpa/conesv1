import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Cone } from "@/lib/models";

async function fetchCone(coneId: string): Promise<Cone | null> {
  const ref = doc(db, COL.cones, coneId);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    throw new Error("Volcano not found");
  }

  const data = docSnap.data();
  if (!data) return null;

  return {
    id: docSnap.id,
    ...data,
    name: data.name ?? "",
    description: data.description ?? "",
    region: data.region ?? "central",
    category: data.category ?? "cone",
  } as Cone;
}

export function useCone(coneId: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cone", coneId],
    queryFn: () => fetchCone(coneId!),
    enabled: !!coneId,

    // 1. Consider data fresh for 2 weeks (in milliseconds)
    // If they view the cone, close the app, and open it 2 hours later, 0 reads.
    // If they open it 25 hours later, 1 read.
    staleTime: 1000 * 60 * 60 * 24 * 14, 
    
    // 2. Keep the inactive data in memory for a week
    gcTime: 1000 * 60 * 60 * 24 * 7,

    // 3. STOP refetching just because they switched apps
    refetchOnWindowFocus: false,

    // 4. STOP refetching just because their internet briefly dropped and reconnected
    refetchOnReconnect: false,
  });

  return {
    cone: data || null,
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}
