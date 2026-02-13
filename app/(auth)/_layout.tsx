import React from "react";
import { Redirect, Slot } from "expo-router";
import { useSession } from "@/lib/providers/SessionProvider";
import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AuthLayout() {
  const { session } = useSession();

  if (session.status === "loading") {
    return (
      <Screen>
        <LoadingState fullScreen={false} label="Loading…" />
      </Screen>
    );
  }

  if (session.status === "authed") {
    return <Redirect href="/(app)/(tabs)/progress" />;
  }

  if (session.status === "guest") {
    return <Redirect href="/(app)/(tabs)/map" />;
  }

  // loggedOut
  return <Slot />;
}
