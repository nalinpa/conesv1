import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { surfGreenTheme } from "@/lib/kitten-theme";

import { SessionProvider } from "@/lib/providers/SessionProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />

      <ApplicationProvider {...eva} theme={{ ...eva.light, ...surfGreenTheme }}>
        <SessionProvider>{children}</SessionProvider>

        {/* Portals should live outside session/provider remount cycles */}
        <PortalHost />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}
