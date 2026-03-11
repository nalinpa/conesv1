import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Cone } from "@/lib/models";

async function fetchCones(): Promise<Cone[]> {
  const q = query(
    collection(db, COL.cones),
    where("active", "==", true),
    orderBy("name", "asc"),
  );

  // ✅ Pass the query into the getDocs() function
  const snap = await getDocs(q);

  return snap.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const val = d.data();
    return {
      id: d.id,
      ...val,
      region: val.region ?? "central",
      category: val.category ?? "cone",
    } as Cone;
  });
}

export function useCones() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cones"],
    queryFn: fetchCones,
  });

  return {
    cones: data || [],
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}
