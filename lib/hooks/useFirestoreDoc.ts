import { useEffect, useState } from "react";
import { onSnapshot, FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

type Options = {
  enabled?: boolean;
};

export function useFirestoreDoc<T extends FirebaseFirestoreTypes.DocumentData>(
  ref: FirebaseFirestoreTypes.DocumentReference<T> | null | undefined,
  opts?: Options,
) {
  const enabled = opts?.enabled ?? true;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!ref && enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.data() ?? null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [ref, enabled]);

  return { data, loading, error };
}
