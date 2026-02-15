import { useCallback, useMemo, useState } from "react";
import { doc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { reviewService } from "@/lib/services/reviewService";
import { useSession } from "@/lib/providers/SessionProvider";
import { useFirestoreDoc } from "@/lib/hooks/useFirestoreDoc";

type ReviewsSummaryState = {
  avgRating: number | null;
  ratingCount: number;

  myRating: number | null;
  myText: string | null;

  loading: boolean;
  err: string | null;

  saving: boolean;
  saveReview: (_args: {
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
  const { session } = useSession();

  const [saving, setSaving] = useState(false);

  const uid = session.status === "authed" ? session.uid : null;

  // 1. Cone Doc (for avgRating, ratingCount)
  const coneRef = useMemo(() => {
    if (!coneId) return null;
    return doc(db, COL.cones, coneId);
  }, [coneId]);

  const {
    data: coneData,
    loading: coneLoading,
    error: coneError,
  } = useFirestoreDoc(coneRef);

  // 2. My Review Doc (assuming deterministic ID: uid_coneId)
  const reviewRef = useMemo(() => {
    if (!uid || !coneId) return null;
    const reviewId = `${uid}_${coneId}`;
    return doc(db, COL.coneReviews, reviewId);
  }, [uid, coneId]);

  const {
    data: reviewData,
    loading: reviewLoading,
    error: reviewError,
  } = useFirestoreDoc(reviewRef);

  const avgRating = coneData?.avgRating ?? null;
  const ratingCount = coneData?.ratingCount ?? 0;
  const myRating = reviewData?.rating ?? reviewData?.reviewRating ?? null;
  const myText = reviewData?.text ?? reviewData?.reviewText ?? null;

  const loading = session.status === "loading" || coneLoading || reviewLoading;
  const err = coneError?.message ?? reviewError?.message ?? null;

  const saveReview = useCallback(
    async (args: {
      coneId: string;
      coneSlug: string;
      coneName: string;
      reviewRating: number | null | undefined;
      reviewText: string | null | undefined;
    }) => {
      if (session.status === "loading")
        return { ok: false as const, err: "Session not ready" };

      if (session.status !== "authed")
        return { ok: false as const, err: "You must be logged in" };

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
    [session.status, uid],
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
