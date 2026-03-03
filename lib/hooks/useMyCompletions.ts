import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";
import type { WatchMyCompletionsResult } from "@/lib/services/completionService";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  return 0;
}

/**
 * Fetcher for the full list of user completions (used for badges/progress).
 */
async function fetchMyCompletions(uid: string) {
  const snap = await db.collection(COL.coneCompletions)
    .where("userId", "==", uid)
    .get();

  const completedConeIds = new Set<string>();
  const sharedConeIds = new Set<string>();
  const completedAtByConeId: Record<string, number> = {};
  const completions: any[] = [];

  snap.forEach((doc) => {
    const d = doc.data() as any;
    const coneId = d.coneId;
    if (!coneId) return;

    completedConeIds.add(coneId);
    completedAtByConeId[coneId] = toMs(d.completedAt);
    if (d.shareBonus) sharedConeIds.add(coneId);
    completions.push({ id: doc.id, ...d });
  });

  return {
    completedConeIds,
    sharedConeIds,
    completedAtByConeId,
    shareBonusCount: sharedConeIds.size,
    completions,
  };
}

export function useMyCompletions(): {
  loading: boolean;
  err: string;
  completedConeIds: Set<string>;
  shareBonusCount: number;
  completedAtByConeId: Record<string, number>;
  sharedConeIds: Set<string>;
  completions: WatchMyCompletionsResult["completions"];
} {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["myCompletions", uid],
    queryFn: () => fetchMyCompletions(uid!),
    enabled: !!uid,
  });

  const defaultState = {
    completedConeIds: new Set<string>(),
    sharedConeIds: new Set<string>(),
    completedAtByConeId: {},
    shareBonusCount: 0,
    completions: [],
  };

  const state = data || defaultState;

  return {
    loading: session.status === "loading" || isLoading,
    err: error instanceof Error ? error.message : "",
    ...state, 
  };
}