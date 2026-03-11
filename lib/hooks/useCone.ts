import { useQuery } from "@tanstack/react-query";
import { doc } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Cone } from "@/lib/models";

async function fetchCone(coneId: string): Promise<Cone | null> {
  const ref = doc(db, COL.cones, coneId);
  const docSnap = await ref.get();

  if (!docSnap.exists) {
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
  });

  return {
    cone: data || null,
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}
