import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

export type PublicReview = {
  id: string;
  userId: string;
  coneId: string;
  coneName?: string;
  reviewRating: number; // 1..5
  reviewText?: string | null;
  reviewCreatedAt?: any;
};

function clampRating(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(5, v));
}

export function usePublicConeReviews(coneId: string) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        if (!coneId) throw new Error("Missing coneId.");

        const qy = query(
          collection(db, COL.coneReviews),
          where("coneId", "==", String(coneId)),
          orderBy("reviewCreatedAt", "desc")
        );

        const snap = await getDocs(qy);

        const list: PublicReview[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: String(data.userId ?? ""),
            coneId: String(data.coneId ?? ""),
            coneName: typeof data.coneName === "string" ? data.coneName : undefined,
            reviewRating: clampRating(data.reviewRating),
            reviewText: typeof data.reviewText === "string" ? data.reviewText : null,
            reviewCreatedAt: data.reviewCreatedAt ?? null,
          };
        });

        if (!mounted) return;
        setReviews(list);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Couldn’t load reviews");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [coneId, reloadKey]);

  return { loading, err, reviews, retry };
}
