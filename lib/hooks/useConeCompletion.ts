import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

export function useConeCompletion(coneId: string | null | undefined): {
  completedId: string | null;
  shareBonus: boolean;

  loading: boolean;
  err: string;

  refresh: () => Promise<void>;
  setShareBonusLocal: (next: boolean) => void;
} {
  const { session } = useSession();

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

    // Session not ready yet → don't flip to "not completed" prematurely
    if (session.status === "loading") return;

    // Guest/loggedOut or no cone → clear state
    if (session.status !== "authed" || !coneId) {
      reset();
      return;
    }

    const uid = session.uid;

    try {
      const completionId = `${uid}_${String(coneId)}`;
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
  }, [session.status, session.status === "authed" ? session.uid : null, coneId, reset]);

  // Live watch (preferred)
  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | null = null;

    // While session is loading, keep the hook loading and do nothing
    if (session.status === "loading") {
      setLoading(true);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    // Guest/loggedOut or no coneId → nothing to watch
    if (session.status !== "authed" || !coneId) {
      reset();
      setLoading(false);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    const uid = session.uid;

    setLoading(true);
    setErr("");

    const completionId = `${uid}_${String(coneId)}`;
    const ref = doc(db, COL.coneCompletions, completionId);

    unsub = onSnapshot(
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
      if (unsub) unsub();
    };
  }, [session.status, session.status === "authed" ? session.uid : null, coneId, reset]);

  return {
    completedId,
    shareBonus,
    loading,
    err,
    refresh,
    setShareBonusLocal: setShareBonus,
  };
}
