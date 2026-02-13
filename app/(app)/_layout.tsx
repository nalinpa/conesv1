import React from "react";
import { Redirect, Slot } from "expo-router";

import { useSession } from "@/lib/providers/SessionProvider";
import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AppLayout() {
  const { session } = useSession();

  if (session.status === "loading") {
    return (
      <Screen>
        <LoadingState fullScreen={false} label="Loading…" />
      </Screen>
    );
  }

  if (session.status === "loggedOut") {
    return <Redirect href="/(auth)/login" />;
  }

  // authed OR guest
  return <Slot />;
}
