import { useMemo } from "react";
import { doc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useFirestoreDoc } from "@/lib/hooks/useFirestoreDoc";
import type { Cone } from "@/lib/models";

export function useCone(coneId: string | null | undefined) {
  const ref = useMemo(() => {
    if (!coneId) return null;
    return doc(db, COL.cones, coneId);
  }, [coneId]);

  const { data, loading, error } = useFirestoreDoc(ref);

  const cone = useMemo(() => {
    if (!data || !ref) return null;
    return {
      id: ref.id,
      ...data,
      name: data.name ?? "",
      description: data.description ?? "",
      region: data.region ?? "central",
      category: data.category ?? "cone",
    } as Cone;
  }, [data, ref]);

  return {
    cone,
    loading,
    err: error?.message ?? "",
  };
}
