import React, { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuthForm } from "@/lib/hooks/useAuthForm";
import { useSession } from "@/lib/providers/SessionProvider";

export default function LoginScreen() {
  const f = useAuthForm("login");
  const { session, enableGuest } = useSession();

  // If session changes while we're on login, leave immediately.
  useEffect(() => {
    if (session.status === "guest") router.replace("/(tabs)/map");
    if (session.status === "authed") router.replace("/(tabs)/progress");
  }, [session.status]);

  const busy = f.busy || session.status === "loading";

  return (
    <>
      <Stack.Screen options={{ title: "Sign in" }} />

      <Screen padded>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <AuthCard
            mode={f.mode}
            title={f.title}
            subtitle={f.subtitle}
            email={f.email}
            password={f.password}
            confirm={f.confirm}
            busy={busy}
            err={f.err}
            notice={f.notice}
            canSubmit={f.canSubmit}
            onChangeMode={f.setMode}
            onChangeEmail={f.setEmail}
            onChangePassword={f.setPassword}
            onChangeConfirm={f.setConfirm}
            onSubmit={() => void f.submit()}
            onGuest={async () => {
              if (session.status !== "loggedOut") return;
              await enableGuest();
              router.replace("/(tabs)/map");
            }}
          />
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}
