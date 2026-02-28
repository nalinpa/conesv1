import { useEffect, useState } from "react";
import { onSnapshot, FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export function useFirestoreQuery<T extends FirebaseFirestoreTypes.DocumentData>(queryRef: FirebaseFirestoreTypes.Query<T> | null | undefined) {
  const [data, setData] = useState<FirebaseFirestoreTypes.QuerySnapshot<T> | null>(null);
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
      },
    );

    return () => unsub();
  }, [queryRef]);

  return { data, loading, error };
}
