import { useCallback, useEffect, useMemo, useState } from "react";
import { reviewService } from "@/lib/services/reviewService";
import { useSession } from "@/lib/providers/SessionProvider";

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
  const { session } = useSession();

  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  const [myRating, setMyRating] = useState<number | null>(null);
  const [myText, setMyText] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // While session hydrates, keep loading (prevents flicker / “missing my review”)
    if (session.status === "loading") {
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

    // Public summary is allowed for everyone; only "my review" is gated by authed uid.
    const uidOrNull = session.status === "authed" ? session.uid : null;

    const unsub = reviewService.listenConeReviewsSummary(
      String(coneId),
      uidOrNull,
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
  }, [
    session.status,
    coneId,
    session.status === "authed" ? session.uid : null,
  ]);

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

      const uid = session.uid;

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
    [session.status, session.status === "authed" ? session.uid : null],
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
