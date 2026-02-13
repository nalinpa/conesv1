import React from "react";
import { View } from "react-native";
import { Input, Text, useTheme } from "@ui-kitten/components";

import type { AuthMode } from "@/lib/hooks/useAuthForm";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { Pill } from "@/components/ui/Pill";
import { space } from "@/lib/ui/tokens";

export function AuthCard({
  mode,
  title,
  subtitle,
  email,
  password,
  confirm,
  busy,
  err,
  notice,
  canSubmit,
  onChangeMode,
  onChangeEmail,
  onChangePassword,
  onChangeConfirm,
  onGuest,
  onSubmit,
}: {
  mode: AuthMode;
  title: string;
  subtitle: string;
  email: string;
  password: string;
  confirm: string;
  busy: boolean;
  err: string | null;
  notice: string | null;
  canSubmit: boolean;
  onChangeMode: (m: AuthMode) => void;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onChangeConfirm: (v: string) => void;
  onGuest?: () => void | Promise<void>;
  onSubmit: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: "flex-start" }}>
      {/* Brand header */}
      <View style={{ gap: 14, marginBottom: 18 }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme["color-primary-100"],
              borderWidth: 1,
              borderColor: theme["border-basic-color-3"],
            }}
          >
            <Text style={{ fontSize: 26 }}>🌋</Text>
          </View>

          <View style={{ alignItems: "center", gap: 6 }}>
            <AppText variant="screenTitle" style={{ fontWeight: "900" }}>
              Cones
            </AppText>

            <AppText variant="hint" appearance="hint" style={{ textAlign: "center" }}>
              Explore Auckland’s volcanic field.
            </AppText>
          </View>
        </View>
      </View>

      <CardShell>
        <Stack gap="md">
          {/* Mode switch */}
          <Row gap="sm" justify="space-between" style={{ width: "100%" }}>
            <AppButton
              variant={mode === "login" ? "primary" : "secondary"}
              size="sm"
              disabled={busy}
              style={{ flex: 1 }}
              onPress={() => onChangeMode("login")}
            >
              Sign in
            </AppButton>

            <AppButton
              variant={mode === "signup" ? "primary" : "secondary"}
              size="sm"
              disabled={busy}
              style={{ flex: 1 }}
              onPress={() => onChangeMode("signup")}
            >
              Sign up
            </AppButton>
          </Row>

          <View style={{ gap: 6 }}>
            <AppText variant="sectionTitle" style={{ fontWeight: "900" }}>
              {title}
            </AppText>
            <AppText variant="hint" appearance="hint">
              {subtitle}
            </AppText>
          </View>

          {notice ? (
            <Pill status="success" muted>
              {notice}
            </Pill>
          ) : null}

          {err ? (
            <Pill status="danger" muted>
              {err}
            </Pill>
          ) : null}

          <View style={{ gap: 12 }}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChangeEmail}
              disabled={busy}
            />

            {mode !== "reset" ? (
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                secureTextEntry
                autoCapitalize="none"
                onChangeText={onChangePassword}
                disabled={busy}
              />
            ) : null}

            {mode === "signup" ? (
              <Input
                label="Confirm password"
                placeholder="••••••••"
                value={confirm}
                secureTextEntry
                autoCapitalize="none"
                onChangeText={onChangeConfirm}
                disabled={busy}
              />
            ) : null}
          </View>

          <AppButton
            variant="primary"
            loading={busy}
            loadingLabel={
              mode === "signup"
                ? "Creating…"
                : mode === "reset"
                ? "Sending…"
                : "Signing in…"
            }
            disabled={!canSubmit || busy}
            onPress={onSubmit}
          >
            {mode === "signup"
              ? "Create account"
              : mode === "reset"
              ? "Send reset link"
              : "Sign in"}
          </AppButton>

          {mode === "login" ? (
            <>
              <AppButton
                variant="ghost"
                size="sm"
                disabled={busy || !onGuest}
                onPress={() => void onGuest?.()}
              >
                Continue as guest
              </AppButton>

              <AppButton
                variant="ghost"
                size="sm"
                disabled={busy}
                onPress={() => onChangeMode("reset")}
              >
                Forgot password?
              </AppButton>
            </>
          ) : null}

          <View style={{ height: space.xs }} />

          <AppText variant="hint" appearance="hint" style={{ textAlign: "center" }}>
            No account needed to explore. Sign in to track completions and leave reviews.
          </AppText>
        </Stack>
      </CardShell>
    </View>
  );
}
