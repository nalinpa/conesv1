import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/lib/services/reviewService";

export function usePublicConeReviews(coneId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["public-reviews", coneId],
    queryFn: () => reviewService.getPublicConeReviews(coneId),
    enabled: !!coneId, 
  });

  return {
    reviews: data ?? [],
    loading: isLoading,
    err: error instanceof Error ? error.message : null,
    refresh: refetch, 
  };
}