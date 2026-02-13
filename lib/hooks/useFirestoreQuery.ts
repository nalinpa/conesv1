import { useEffect, useState } from "react";
import { onSnapshot, Query, QuerySnapshot } from "firebase/firestore";

export function useFirestoreQuery<T>(queryRef: Query<T> | null | undefined) {
  const [data, setData] = useState<QuerySnapshot<T> | null>(null);
  const [loading, setLoading] = useState(!!queryRef);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!queryRef) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = onSnapshot(
      queryRef,
      (snap) => {
        setData(snap);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [queryRef]);

  return { data, loading, error };
}