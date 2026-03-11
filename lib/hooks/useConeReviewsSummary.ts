import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { doc, getDoc } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { reviewService } from "@/lib/services/reviewService";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for the Cone's overall stats (average rating, count).
 */
async function fetchConeStats(coneId: string) {
  const ref = doc(db, COL.cones, coneId);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() ?? null) : null;
}

/**
 * Fetcher for the user's specific review for this volcano.
 */
async function fetchMyReview(uid: string, coneId: string) {
  const reviewId = `${uid}_${coneId}`;

  const ref = doc(db, COL.coneReviews, reviewId);
  const snap = await getDoc(ref);

  // Defensive check: force undefined data to null
  return snap.exists() ? (snap.data() ?? null) : null;
}

export function useConeReviewsSummary(coneId: string | null | undefined) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const uid = session.status === "authed" ? session.uid : null;

  const userName = auth().currentUser?.displayName || "Unknown User";

  const {
    data: coneData,
    isLoading: coneLoading,
    error: coneError,
  } = useQuery({
    queryKey: ["cone", coneId],
    queryFn: () => fetchConeStats(coneId!),
    enabled: !!coneId,
  });

  const {
    data: reviewData,
    isLoading: reviewLoading,
    error: reviewError,
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
    },
  });

  const avgRating = coneData?.avgRating ?? null;
  const ratingCount = coneData?.ratingCount ?? 0;
  const myRating = reviewData?.rating ?? reviewData?.reviewRating ?? null;
  const myText = reviewData?.text ?? reviewData?.reviewText ?? null;

  const loading = session.status === "loading" || coneLoading || reviewLoading;
  const err =
    (coneError instanceof Error ? coneError.message : null) ??
    (reviewError instanceof Error ? reviewError.message : null);

  const saveReview = async (args: {
    coneId?: string | null;
    coneSlug: string;
    coneName: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }) => {
    const targetConeId = args.coneId || coneId;

    if (session.status === "loading")
      return { ok: false as const, err: "Session not ready" };
    if (session.status !== "authed")
      return { ok: false as const, err: "You must be logged in" };
    if (!targetConeId) return { ok: false as const, err: "Missing coneId" };

    try {
      // ✅ 2. Pass the userName into the mutation payload
      await mutation.mutateAsync({
        ...args,
        uid: uid!,
        userName: userName,
        coneId: targetConeId,
      });
      return { ok: true as const };
    } catch (e: any) {
      Sentry.captureException(e);
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
