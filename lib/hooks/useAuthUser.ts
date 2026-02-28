import { useEffect, useState } from "react";
import { onAuthStateChanged, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuthUser() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return {
    user,
    uid: user?.uid ?? null,
    loading,
  };
}
