import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import firestore from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { reviewService } from "@/lib/services/reviewService";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for the Cone's overall stats (average rating, count).
 * Using db.doc() directly from your project's firebase instance.
 */
async function fetchConeStats(coneId: string) {
  const ref = db.collection(COL.cones).doc(coneId);
  const snap = await ref.get();
  // Ensure we return null instead of undefined for TanStack Query compatibility
  return snap.exists ? (snap.data() ?? null) : null;
}

/**
 * Fetcher for the user's specific review for this volcano.
 */
async function fetchMyReview(uid: string, coneId: string) {
  const reviewId = `${uid}_${coneId}`;
  const ref = db.collection(COL.coneReviews).doc(reviewId);
  const snap = await ref.get();
  // Defensive check: force undefined data to null
  return snap.exists ? (snap.data() ?? null) : null;
}

export function useConeReviewsSummary(coneId: string | null | undefined) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const uid = session.status === "authed" ? session.uid : null;

  // Query 1: The Cone Stats (Shared cache key with useCone)
  const { 
    data: coneData, 
    isLoading: coneLoading, 
    error: coneError 
  } = useQuery({
    queryKey: ["cone", coneId],
    queryFn: () => fetchConeStats(coneId!),
    enabled: !!coneId,
  });

  // Query 2: The User's personal review
  const { 
    data: reviewData, 
    isLoading: reviewLoading, 
    error: reviewError 
  } = useQuery({
    queryKey: ["coneReview", uid, coneId],
    queryFn: () => fetchMyReview(uid!, coneId!),
    enabled: !!uid && !!coneId,
  });

  // Mutation: Saving or Updating a Review
  const mutation = useMutation({
    mutationFn: async (args: Parameters<typeof reviewService.saveReview>[0]) => {
      const res = await reviewService.saveReview(args);
      if (!res.ok) throw new Error(res.err || "Failed to save review");
      return res;
    },
    onSuccess: (_, args) => {
      // Refresh user review, volcano stats, and global app data (for badges)
      queryClient.invalidateQueries({ queryKey: ["coneReview", uid, args.coneId] });
      queryClient.invalidateQueries({ queryKey: ["cone", args.coneId] });
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    }
  });

  // Map state to the legacy signature your UI components expect
  const avgRating = coneData?.avgRating ?? null;
  const ratingCount = coneData?.ratingCount ?? 0;
  const myRating = reviewData?.rating ?? reviewData?.reviewRating ?? null;
  const myText = reviewData?.text ?? reviewData?.reviewText ?? null;

  const loading = session.status === "loading" || coneLoading || reviewLoading;
  const err = (coneError instanceof Error ? coneError.message : null) 
           ?? (reviewError instanceof Error ? reviewError.message : null);

  const saveReview = async (args: {
    coneId: string;
    coneSlug: string;
    coneName: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }) => {
    if (session.status === "loading") return { ok: false as const, err: "Session not ready" };
    if (session.status !== "authed") return { ok: false as const, err: "You must be logged in" };
    if (!args.coneId) return { ok: false as const, err: "Missing coneId" };

    try {
      await mutation.mutateAsync({ uid: uid!, ...args });
      return { ok: true as const };
    } catch (e: any) {
      return { ok: false as const, err: e.message };
    }
  };

  return {
    avgRating,
    ratingCount,
    myRating,
    myText,
    loading,
    err,
    saving: mutation.isPending,
    saveReview,
  };
}