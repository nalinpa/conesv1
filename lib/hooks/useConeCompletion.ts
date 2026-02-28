import { useMemo } from "react";
import { doc } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";
import { useFirestoreDoc } from "@/lib/hooks/useFirestoreDoc";

export function useConeCompletion(coneId?: string | null) {
  const { session } = useSession();

  const uid = session.status === "authed" ? session.uid : null;

  // Only provide a doc ref if we have a user and coneId
  const ref = useMemo(() => {
    if (!uid || !coneId) return null;
    const completionId = `${uid}_${coneId}`;
    return doc(db, COL.coneCompletions, completionId);
  }, [uid, coneId]);

  const { data, loading, error } = useFirestoreDoc(ref);

  // Map Firestore data to completion state
  const completedId = data && ref ? ref.id : null;
  const shareBonus = data?.shareBonus ?? false;

  return {
    completedId,
    shareBonus,
    loading,
    err: error?.message ?? null,
  };
}
