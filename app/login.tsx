import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Stack } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuthForm } from "@/lib/hooks/useAuthForm";
import { useGuestMode } from "@/lib/hooks/useGuestMode";
import { goMapHome } from "@/lib/routes";

export default function LoginScreen() {
  const f = useAuthForm("login");
  const guest = useGuestMode();

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
            busy={f.busy || guest.loading}
            err={f.err}
            notice={f.notice}
            canSubmit={f.canSubmit}
            onChangeMode={f.setMode}
            onChangeEmail={f.setEmail}
            onChangePassword={f.setPassword}
            onChangeConfirm={f.setConfirm}
            onSubmit={() => void f.submit()}
            onGuest={async () => {
              await guest.enable();
              goMapHome();
            }}
          />
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}
