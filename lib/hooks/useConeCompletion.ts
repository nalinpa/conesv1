import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

export function useConeCompletion(coneId: string | null | undefined): {
  completedId: string | null;
  shareBonus: boolean;

  loading: boolean;
  err: string;

  refresh: () => Promise<void>;
  setShareBonusLocal: (next: boolean) => void;
} {
  const { user, loading: authLoading, uid } = useAuthUser();

  const [completedId, setCompletedId] = useState<string | null>(null);
  const [shareBonus, setShareBonus] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const reset = useCallback(() => {
    setCompletedId(null);
    setShareBonus(false);
  }, []);

  const refresh = useCallback(async () => {
    setErr("");

    // Auth not ready yet → don't flip to "not completed" prematurely
    if (authLoading) return;

    // Not logged in or no cone → clear state
    if (!uid || !coneId) {
      reset();
      return;
    }

    try {
      const completionId = `${user?.uid}_${String(coneId)}`;
      const snap = await getDoc(doc(db, COL.coneCompletions, completionId));

      if (snap.exists()) {
        const data = snap.data() as any;
        setCompletedId(snap.id);
        setShareBonus(!!data.shareBonus);
      } else {
        reset();
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to refresh completion.");
    }
  }, [authLoading, uid, coneId, reset]);

  // Live watch (preferred)
  useEffect(() => {
    let mounted = true;

    // While auth is loading, keep the hook loading
    if (authLoading) {
      setLoading(true);
      return () => {
        mounted = false;
      };
    }

    // No uid or coneId → nothing to watch
    if (!uid || !coneId) {
      reset();
      setLoading(false);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setErr("");

    const completionId = `${uid}_${String(coneId)}`;
    const ref = doc(db, COL.coneCompletions, completionId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!mounted) return;

        if (snap.exists()) {
          const data = snap.data() as any;
          setCompletedId(snap.id);
          setShareBonus(!!data.shareBonus);
        } else {
          reset();
        }

        setLoading(false);
      },
      (e) => {
        if (!mounted) return;
        setErr((e as any)?.message ?? "Failed to watch completion.");
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      unsub();
    };
  }, [authLoading, uid, coneId, reset]);

  return {
    completedId,
    shareBonus,
    loading,
    err,
    refresh,
    setShareBonusLocal: setShareBonus,
  };
}
