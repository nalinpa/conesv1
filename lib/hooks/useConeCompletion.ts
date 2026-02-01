import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

export function useConeCompletion(coneId: string | null | undefined): {
  completedId: string | null;
  shareBonus: boolean;

  loading: boolean;
  err: string;

  refresh: () => Promise<void>;
  setShareBonusLocal: (next: boolean) => void;
} {
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [shareBonus, setShareBonus] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    setErr("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setCompletedId(null);
        setShareBonus(false);
        return;
      }
      if (!coneId) {
        setCompletedId(null);
        setShareBonus(false);
        return;
      }

      const completionId = `${user.uid}_${String(coneId)}`;
      const snap = await getDoc(doc(db, COL.coneCompletions, completionId));

      if (snap.exists()) {
        const data = snap.data() as any;
        setCompletedId(snap.id);
        setShareBonus(!!data.shareBonus);
      } else {
        setCompletedId(null);
        setShareBonus(false);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to refresh completion.");
    }
  }, [coneId]);

  // Live watch (preferred)
  useEffect(() => {
    let mounted = true;

    const user = auth.currentUser;
    if (!user || !coneId) {
      setCompletedId(null);
      setShareBonus(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    const completionId = `${user.uid}_${String(coneId)}`;
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
          setCompletedId(null);
          setShareBonus(false);
        }

        setLoading(false);
      },
      (e) => {
        if (!mounted) return;
        setErr((e as any)?.message ?? "Failed to watch completion.");
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      unsub();
    };
  }, [coneId]);

  return {
    completedId,
    shareBonus,
    loading,
    err,
    refresh,
    setShareBonusLocal: setShareBonus,
  };
}
