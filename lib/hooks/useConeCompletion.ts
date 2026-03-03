import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for a single completion document.
 */
async function fetchSpecificCompletion(uid: string, coneId: string) {
  // We use the deterministic ID pattern: userId_coneId
  const completionId = `${uid}_${coneId}`;
  const snap = await db.collection(COL.coneCompletions).doc(completionId).get();

  if (!snap.exists) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export function useConeCompletion(coneId?: string | null) {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    /**
     * THE FIX: We use a unique key "cone-completion-status".
     * If this were just ["cone", coneId], TanStack Query would return the 
     * volcano details from the cache. Since the volcano always has an ID, 
     * the app would think 'completedId' is truthy for every volcano.
     */
    queryKey: ["cone-completion-status", uid, coneId],
    queryFn: () => fetchSpecificCompletion(uid!, coneId!),
    enabled: !!uid && !!coneId,
    // Prevents UI flickering by starting with null
    placeholderData: null,
  });

  // Map to the return values the UI expects
  const completedId = data ? data.id : null;
  const shareBonus = !!data?.shareBonus;

  return {
    completedId,
    shareBonus,
    loading: isLoading,
    err: error instanceof Error ? error.message : null,
  };
}