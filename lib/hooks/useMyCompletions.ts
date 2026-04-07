import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  onSnapshot,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";
import { useSyncStore } from "@/lib/store/useSyncStore"; // 🚀 IMPORT THE ZUSTAND STORE

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  return 0;
}

const defaultState = {
  completedConeIds: new Set<string>(),
  sharedConeIds: new Set<string>(),
  pendingConeIds: new Set<string>(),
  completedAtByConeId: {},
  shareBonusCount: 0,
  completions: [],
};

export function useMyCompletions() {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;
  const queryClient = useQueryClient();

  // 🚀 GRAB THE OFFLINE QUEUE FROM ZUSTAND
  const syncQueue = useSyncStore((state) => state.queue);

  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, COL.coneCompletions), where("userId", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const completedConeIds = new Set<string>();
        const sharedConeIds = new Set<string>();
        const pendingConeIds = new Set<string>();
        const completedAtByConeId: Record<string, number> = {};
        const completions: any[] = [];

        snap.forEach((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const d = doc.data() as any;
          const coneId = d.coneId;
          if (!coneId) return;

          completedConeIds.add(coneId);
          completedAtByConeId[coneId] = toMs(d.completedAt);
          if (d.shareBonus) sharedConeIds.add(coneId);

          if (doc.metadata.hasPendingWrites) {
            pendingConeIds.add(coneId);
          }

          completions.push({ id: doc.id, ...d });
        });

        queryClient.setQueryData(["myCompletions", uid], {
          completedConeIds,
          sharedConeIds,
          pendingConeIds,
          completedAtByConeId,
          shareBonusCount: sharedConeIds.size,
          completions,
        });
      },
      (error) => {
        Sentry.captureException(error, {
          tags: { hook: "useMyCompletions" },
          extra: { uid },
        });
      },
    );

    return () => unsubscribe();
  }, [uid, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myCompletions", uid],
    queryFn: () => defaultState,
    initialData: defaultState,
    enabled: false,
  });

  const state = (data as typeof defaultState) || defaultState;

  const mergedState = useMemo(() => {
    const finalCompletedIds = new Set(state.completedConeIds);
    const finalPendingIds = new Set(state.pendingConeIds);

    // Inject everything sitting in the offline queue into the UI's reality
    syncQueue.forEach((item) => {
      // 🚀 THE FIX: Remove '.args' and add optional chaining just to be incredibly safe
      if (item?.cone?.id) {
        finalCompletedIds.add(item.cone.id);
        finalPendingIds.add(item.cone.id);
      }
    });

    return {
      ...state,
      completedConeIds: finalCompletedIds,
      pendingConeIds: finalPendingIds,
    };
  }, [state, syncQueue]);

  return {
    loading: session.status === "loading" || isLoading,
    err: error instanceof Error ? error.message : "",
    ...mergedState, // 🚀 Return the merged state so the UI sees everything
  };
}
