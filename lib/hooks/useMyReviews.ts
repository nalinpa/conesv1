import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

const EMPTY_IDS = new Set<string>();

async function fetchMyReviews(uid: string) {
  const qy = query(collection(db, COL.coneReviews), where("userId", "==", uid));

  const snap = await getDocs(qy);

  const ids = new Set<string>();
  const atByCone: Record<string, number> = Object.create(null);

  for (const d of snap.docs) {
    const val = d.data();
    const coneId = typeof val?.coneId === "string" ? val.coneId : null;
    if (!coneId) continue;

    ids.add(coneId);

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
}

export function useMyReviews(): {
  loading: boolean;
  err: string;
  reviewedConeIds: Set<string>;
  reviewCount: number;
  reviewedAtByConeId: Record<string, number>;
} {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["myReviews", uid],
    queryFn: () => fetchMyReviews(uid!),
    enabled: !!uid, // Only fetch if user is logged in
  });

  const defaultState = {
    reviewedConeIds: EMPTY_IDS,
    reviewCount: 0,
    reviewedAtByConeId: {},
  };

  const state = data || defaultState;

  return {
    loading: session.status === "loading" || isLoading,
    err: error instanceof Error ? error.message : "",
    ...state, // Spread out the matched values!
  };
}
