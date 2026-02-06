import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useMyReviews(): {
  loading: boolean;
  err: string;

  reviewedConeIds: Set<string>;
  reviewCount: number;
  reviewedAtByConeId: Record<string, number>;
} {
  const { user, uid, loading: authLoading } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [reviewedConeIds, setReviewedConeIds] = useState<Set<string>>(new Set());
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewedAtByConeId, setReviewedAtByConeId] = useState<Record<string, number>>({});

  useEffect(() => {
    let unsub: (() => void) | null = null;

    if (authLoading) {
      setLoading(true);
      setErr("");
      return;
    }

    if (!user || !uid) {
      setReviewedConeIds(new Set());
      setReviewCount(0);
      setReviewedAtByConeId({});
      setErr("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    const qy = query(collection(db, COL.coneReviews), where("userId", "==", uid));

    unsub = onSnapshot(
      qy,
      (snap) => {
        const ids = new Set<string>();
        const atByCone: Record<string, number> = Object.create(null);

        for (const d of snap.docs) {
          const data = d.data() as any;
          const coneId = typeof data?.coneId === "string" ? data.coneId : null;
          if (!coneId) continue;

          ids.add(coneId);

          const t = toMs(data?.reviewCreatedAt);
          if (t > 0) {
            const prev = atByCone[coneId] ?? 0;
            atByCone[coneId] = prev > 0 ? Math.min(prev, t) : t;
          }
        }

        setReviewedConeIds(ids);
        setReviewCount(ids.size);
        setReviewedAtByConeId(atByCone);

        setLoading(false);
      },
      (e) => {
        console.error(e);
        setErr((e as any)?.message ?? "Failed to load reviews");
        setReviewedConeIds(new Set());
        setReviewCount(0);
        setReviewedAtByConeId({});
        setLoading(false);
      },
    );

    return () => {
      if (unsub) unsub();
    };
  }, [authLoading, user, uid]);

  return { loading, err, reviewedConeIds, reviewCount, reviewedAtByConeId };
}
