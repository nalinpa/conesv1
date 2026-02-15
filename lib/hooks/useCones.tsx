import { useMemo } from "react";
import { collection, query, where, orderBy } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery";
import type { Cone } from "@/lib/models";

export function useCones() {
  const q = useMemo(() => {
    return query(
      collection(db, COL.cones),
      where("active", "==", true),
      orderBy("name", "asc"),
    );
  }, []);

  const { data, loading, error } = useFirestoreQuery(q);

  const cones = useMemo(() => {
    if (!data) return [];
    return data.docs.map((d) => {
      const val = d.data();
      return {
        id: d.id,
        ...val,
        region: val.region ?? "central",
        category: val.category ?? "cone",
      } as Cone;
    });
  }, [data]);

  return { cones, loading, err: error?.message ?? "" };
}
