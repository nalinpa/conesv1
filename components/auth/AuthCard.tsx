import React from "react";
import { View, StyleSheet } from "react-native";
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
  onChangeMode: (mode: AuthMode) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeConfirm: (value: string) => void;
  onGuest?: () => void | Promise<void>;
  onSubmit: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Brand header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBox,
              {
                backgroundColor: theme["color-primary-100"],
                borderColor: theme["border-basic-color-3"],
              },
            ]}
          >
            <Text style={styles.logoEmoji}>🌋</Text>
          </View>

          <View style={styles.titleContainer}>
            <AppText variant="screenTitle" style={styles.titleText}>
              Cones
            </AppText>

            <AppText variant="hint" appearance="hint" style={styles.subtitleText}>
              Explore Auckland’s volcanic field.
            </AppText>
          </View>
        </View>
      </View>

      <CardShell>
        <Stack gap="md">
          {/* Mode switch */}
          <Row gap="sm" justify="space-between" style={styles.buttonRow}>
            <AppButton
              variant={mode === "login" ? "primary" : "secondary"}
              size="sm"
              disabled={busy}
              style={styles.flex1}
              onPress={() => onChangeMode("login")}
            >
              Sign in
            </AppButton>

            <AppButton
              variant={mode === "signup" ? "primary" : "secondary"}
              size="sm"
              disabled={busy}
              style={styles.flex1}
              onPress={() => onChangeMode("signup")}
            >
              Sign up
            </AppButton>
          </Row>

          <View style={styles.formHeader}>
            <AppText variant="sectionTitle" style={styles.titleText}>
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

          <View style={styles.inputsContainer}>
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

          <View style={styles.spacerSmall} />

          <AppText variant="hint" appearance="hint" style={styles.footerText}>
            No account needed to explore. Sign in to track completions and leave reviews.
          </AppText>
        </Stack>
      </CardShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  brandHeader: {
    gap: 14,
    marginBottom: 18,
  },
  logoContainer: {
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logoEmoji: {
    fontSize: 26,
  },
  titleContainer: {
    alignItems: "center",
    gap: 6,
  },
  titleText: {
    fontWeight: "900",
  },
  subtitleText: {
    textAlign: "center",
  },
  buttonRow: {
    width: "100%",
  },
  flex1: {
    flex: 1,
  },
  formHeader: {
    gap: 6,
  },
  inputsContainer: {
    gap: 12,
  },
  spacerSmall: {
    height: space.xs,
  },
  footerText: {
    textAlign: "center",
  },
});
