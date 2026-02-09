import { useEffect } from "react";
import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { goLogin, goProgressHome } from "@/lib/routes";

export default function Index() {
  const { uid, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;

    if (uid) {
      // signed in → go to the app
      goProgressHome();
    } else {
      // signed out → go to login
      goLogin();
    }
  }, [uid, loading]);

  return (
    <Screen>
      <LoadingState fullScreen={false} label="Starting…" />
    </Screen>
  );
}
