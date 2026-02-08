import { useCallback, useEffect, useState } from "react";
import { reviewService, type PublicReview } from "@/lib/services/reviewService";

export function usePublicConeReviews(coneId: string) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(async () => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const list = await reviewService.getPublicConeReviews(coneId);
        if (cancelled) return;
        setReviews(list);
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message ?? "Couldn’t load reviews right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coneId, reloadKey]);

  return { loading, err, reviews, refresh };
}
