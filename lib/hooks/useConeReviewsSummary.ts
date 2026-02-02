import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

type ReviewsSummaryState = {
  avgRating: number | null;
  ratingCount: number;

  myRating: number | null;
  myText: string | null;

  loading: boolean;
  err: string;
};

function clampRating(n: any): number | null {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  if (v < 1 || v > 5) return null;
  return v;
}

function cleanText(t: any, maxLen = 280): string | null {
  if (typeof t !== "string") return null;
  const s = t.trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

export function useConeReviewsSummary(
  coneId: string | null | undefined,
): ReviewsSummaryState {
  const { uid, loading: authLoading } = useAuthUser();

  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  const [myRating, setMyRating] = useState<number | null>(null);
  const [myText, setMyText] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    // While auth hydrates, keep loading (prevents flicker / "missing my review")
    if (authLoading) {
      setLoading(true);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    if (!coneId) {
      // Treat missing coneId as a “hard” error to match other hooks
      setAvgRating(null);
      setRatingCount(0);
      setMyRating(null);
      setMyText(null);
      setLoading(false);
      setErr("Missing coneId.");
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setErr("");

    const myId = uid ? `${uid}_${String(coneId)}` : null;

    const reviewsQ = query(
      collection(db, COL.coneReviews),
      where("coneId", "==", String(coneId)),
    );

    const unsub = onSnapshot(
      reviewsQ,
      (snap) => {
        if (!mounted) return;

        let sum = 0;
        let count = 0;

        let mineRating: number | null = null;
        let mineText: string | null = null;

        for (const d of snap.docs) {
          const data = d.data() as any;

          const r = clampRating(data?.reviewRating);
          if (r != null) {
            sum += r;
            count += 1;
          }

          // One review per user per cone is enforced by docId convention
          if (myId && d.id === myId) {
            mineRating = clampRating(data?.reviewRating);
            mineText = cleanText(data?.reviewText, 280);
          }
        }

        setRatingCount(count);
        setAvgRating(count > 0 ? sum / count : null);

        setMyRating(mineRating);
        setMyText(mineText);

        setLoading(false);
      },
      (e) => {
        console.error(e);
        if (!mounted) return;

        setAvgRating(null);
        setRatingCount(0);
        setMyRating(null);
        setMyText(null);

        setErr((e as any)?.message ?? "Failed to load reviews.");
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      unsub();
    };
  }, [authLoading, coneId, uid]);

  return useMemo(
    () => ({
      avgRating,
      ratingCount,
      myRating,
      myText,
      loading,
      err,
    }),
    [avgRating, ratingCount, myRating, myText, loading, err],
  );
}
