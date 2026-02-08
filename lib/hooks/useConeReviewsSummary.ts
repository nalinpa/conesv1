import { useCallback, useEffect, useMemo, useState } from "react";
import { reviewService } from "@/lib/services/reviewService";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

type ReviewsSummaryState = {
  avgRating: number | null;
  ratingCount: number;

  myRating: number | null;
  myText: string | null;

  loading: boolean;
  err: string | null;

  saving: boolean;
  saveReview: (args: {
    coneId: string;
    coneSlug: string;
    coneName: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }) => Promise<{ ok: true } | { ok: false; err: string }>;
};

export function useConeReviewsSummary(
  coneId: string | null | undefined,
): ReviewsSummaryState {
  const { uid, loading: authLoading } = useAuthUser();

  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  const [myRating, setMyRating] = useState<number | null>(null);
  const [myText, setMyText] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // While auth hydrates, keep loading (prevents flicker / “missing my review”)
    if (authLoading) {
      setLoading(true);
      setErr(null);
      return;
    }

    if (!coneId) {
      setAvgRating(null);
      setRatingCount(0);
      setMyRating(null);
      setMyText(null);
      setLoading(false);
      setErr("Missing coneId.");
      return;
    }

    setLoading(true);
    setErr(null);

    const unsub = reviewService.listenConeReviewsSummary(
      String(coneId),
      uid,
      (v) => {
        setAvgRating(v.avgRating);
        setRatingCount(v.ratingCount);
        setMyRating(v.myRating);
        setMyText(v.myText);
        setLoading(false);
      },
      (e: any) => {
        setAvgRating(null);
        setRatingCount(0);
        setMyRating(null);
        setMyText(null);
        setErr(e?.message ?? "Failed to load reviews.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, [authLoading, coneId, uid]);

  const saveReview = useCallback(
    async (args: {
      coneId: string;
      coneSlug: string;
      coneName: string;
      reviewRating: number | null | undefined;
      reviewText: string | null | undefined;
    }) => {
      if (authLoading) return { ok: false as const, err: "Auth not ready" };
      if (!uid) return { ok: false as const, err: "You must be logged in" };
      if (!args.coneId) return { ok: false as const, err: "Missing coneId" };

      setSaving(true);
      try {
        return await reviewService.saveReview({
          uid,
          coneId: String(args.coneId),
          coneSlug: String(args.coneSlug ?? ""),
          coneName: String(args.coneName ?? ""),
          reviewRating: args.reviewRating,
          reviewText: args.reviewText,
        });
      } finally {
        setSaving(false);
      }
    },
    [authLoading, uid],
  );

  return useMemo(
    () => ({
      avgRating,
      ratingCount,
      myRating,
      myText,
      loading,
      err,
      saving,
      saveReview,
    }),
    [avgRating, ratingCount, myRating, myText, loading, err, saving, saveReview],
  );
}
