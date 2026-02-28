import { useMemo } from "react";
import { collection, FirebaseFirestoreTypes, query, where } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";
import { useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery";
import type { WatchMyCompletionsResult } from "@/lib/services/completionService";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  return 0;
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
  const qy = useMemo(() => {
      if (!uid) return null;
      return query(
        collection(db, COL.coneCompletions), 
        where("userId", "==", uid)
      ) as FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>;
    }, [uid]);

  const { data, loading: queryLoading, error } = useFirestoreQuery(qy);

  const state = useMemo<WatchMyCompletionsResult>(() => {
    if (!data) {
      return {
        completedConeIds: new Set(),
        shareBonusCount: 0,
        completedAtByConeId: {},
        completions: [],
        sharedConeIds: new Set(),
      };
    }

    const completedConeIds = new Set<string>();
    const sharedConeIds = new Set<string>();
    const completedAtByConeId: Record<string, number> = {};
    const completions: any[] = [];

    data.docs.forEach((doc) => {
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
      shareBonusCount: sharedConeIds.size,
      completedAtByConeId,
      sharedConeIds,
      completions,
    };
  }, [data]);

  return {
    loading: session.status === "loading" || queryLoading,
    err: error?.message ?? "",
    completedConeIds: state.completedConeIds,
    shareBonusCount: state.shareBonusCount,
    completedAtByConeId: state.completedAtByConeId,
    sharedConeIds: state.sharedConeIds,
    completions: state.completions,
  };
}
