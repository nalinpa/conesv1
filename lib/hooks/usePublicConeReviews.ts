import { reviewService } from "@/lib/services/reviewService";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";

export function usePublicConeReviews(coneId: string) {
  const { data, loading, error, refresh } = useCachedQuery(
    ["public-reviews", coneId],
    () => reviewService.getPublicConeReviews(coneId),
  );
  return {
    reviews: data ?? [],
    loading,
    err: error?.message ?? null,
    refresh,
  };
}
