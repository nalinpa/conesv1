import React, { useEffect } from "react";
import { Redirect, Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useSession } from "@/lib/providers/SessionProvider";

export default function AuthLayout() {
  const { session } = useSession();
  const segments = useSegments();

  useEffect(() => {
    if (session.status !== "loading") {
      SplashScreen.hideAsync();
    }
  }, [session.status]);

  if (session.status === "loading") {
    return null;
  }

  // If they are fully authed, get them out of Auth and into the App
  if (session.status === "authed") {
    return <Redirect href="/(app)/(tabs)/progress" />;
  }

  if (session.status === "guest") {
    return <Redirect href="/(app)/(tabs)/map" />;
  }

  // loggedOut OR unverified (and currently on the verify-email page)
  return <Slot />;
}