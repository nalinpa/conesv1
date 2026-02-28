import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";
import { useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

const EMPTY_IDS = new Set<string>();

export function useMyReviews(): {
  loading: boolean;
  err: string;

  reviewedConeIds: Set<string>;
  reviewCount: number;
  reviewedAtByConeId: Record<string, number>;
} {
  const { session } = useSession();

  const uid = session.status === "authed" ? session.uid : null;

  const qy = useMemo(() => {
    if (!uid) return null;
    return query(collection(db, COL.coneReviews), where("userId", "==", uid));
  }, [uid]);

  const { data, loading: queryLoading, error } = useFirestoreQuery(qy);

  const { reviewedConeIds, reviewCount, reviewedAtByConeId } = useMemo(() => {
    if (!data) {
      return {
        reviewedConeIds: EMPTY_IDS,
        reviewCount: 0,
        reviewedAtByConeId: {},
      };
    }

    const ids = new Set<string>();
    const atByCone: Record<string, number> = Object.create(null);

    for (const d of data.docs) {
      const val = d.data({ serverTimestamps: "estimate" });
      const coneId = typeof val?.coneId === "string" ? val.coneId : null;
      if (!coneId) continue;

      ids.add(coneId);

      // keep earliest timestamp we saw for this cone
      const t = toMs(val?.reviewCreatedAt);
      if (t > 0) {
        const prev = atByCone[coneId] ?? 0;
        atByCone[coneId] = prev > 0 ? Math.min(prev, t) : t;
      }
    }

    return {
      reviewedConeIds: ids,
      reviewCount: ids.size,
      reviewedAtByConeId: atByCone,
    };
  }, [data]);

  return {
    loading: session.status === "loading" || queryLoading,
    err: error?.message ?? "",
    reviewedConeIds,
    reviewCount,
    reviewedAtByConeId,
  };
}
