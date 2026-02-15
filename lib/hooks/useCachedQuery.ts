import { useCallback, useEffect, useRef, useState } from "react";

type UseCachedQueryResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useCachedQuery<T>(
  key: unknown[] | string | null,
  fetcher: () => Promise<T>,
  opts?: { enabled?: boolean },
): UseCachedQueryResult<T> {
  const enabled = opts?.enabled ?? true;
  const isKeyValid = key !== null;
  const shouldFetch = enabled && isKeyValid;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Flatten deps for useEffect
  const deps = Array.isArray(key) ? key : [key];

  useEffect(() => {
    if (shouldFetch) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch, refresh, ...deps]);

  return { data, loading, error, refresh };
}
