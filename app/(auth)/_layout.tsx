import React, { useEffect } from "react";
import { Redirect, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useSession } from "@/lib/providers/SessionProvider";

export default function AuthLayout() {
  const { session } = useSession();

  useEffect(() => {
    if (session.status !== "loading") {
      SplashScreen.hideAsync();
    }
  }, [session.status]);

  if (session.status === "loading") {
    // Return null to keep the native splash screen visible
    return null;
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
