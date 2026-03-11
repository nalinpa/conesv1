import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for a single completion document.
 */
async function fetchSpecificCompletion(uid: string, coneId: string) {
  const completionId = `${uid}_${coneId}`;

  const docRef = doc(db, COL.coneCompletions, completionId);

  const snap = await getDoc(docRef);

  if (!snap.exists) {
    return null;
  }

  const data = snap.data() as { shareBonus?: boolean };

  return {
    id: snap.id,
    ...data,
  };
}

export function useConeCompletion(coneId?: string | null) {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["cone-completion-status", uid, coneId],
    queryFn: () => fetchSpecificCompletion(uid!, coneId!),
    enabled: !!uid && !!coneId,
    // Prevents UI flickering by starting with null
    placeholderData: null,
  });

  const completedId = data ? data.id : null;
  const shareBonus = !!data?.shareBonus;

  return {
    completedId,
    shareBonus,
    loading: isLoading,
    err: error instanceof Error ? error.message : null,
  };
}
